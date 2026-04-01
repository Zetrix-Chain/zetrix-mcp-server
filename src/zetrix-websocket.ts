import WebSocket from "ws";
import { EventEmitter } from "events";
import protobuf from "protobufjs";
import { readFileSync } from "fs";
import { createRequire } from "module";

// Protobuf message types from the Zetrix SDK bundle
export enum ChainMessageType {
  CHAIN_TYPE_NONE = 0,
  CHAIN_HELLO = 10,
  CHAIN_TX_STATUS = 11,
  CHAIN_PEER_ONLINE = 12,
  CHAIN_PEER_OFFLINE = 13,
  CHAIN_PEER_MESSAGE = 14,
  CHAIN_SUBMITTRANSACTION = 15,
  CHAIN_LEDGER_HEADER = 16,
  CHAIN_CONTRACT_LOG = 17,
  CHAIN_LEDGER_TXS = 18,
  CHAIN_SUBSCRIBE_TX = 19,
  CHAIN_TX_ENV_STORE = 20,
}

export enum TransactionStatus {
  UNDEFINED = 0,
  CONFIRMED = 1,
  PENDING = 2,
  COMPLETE = 3,
  FAILURE = 4,
  APPLY_FAILURE = 5,
}

export interface ChainHelloResponse {
  type: ChainMessageType.CHAIN_HELLO;
  apiList: number[];
  timestamp: string;
}

export interface ChainTxStatusResponse {
  type: ChainMessageType.CHAIN_TX_STATUS;
  status: TransactionStatus;
  txHash: string;
  sourceAddress: string;
  sourceAccountSeq: number;
  ledgerSeq?: number;
  newAccountSeq?: number;
  errorCode?: number;
  errorDesc?: string;
  timestamp?: string;
}

export interface ChainResponse {
  type: number;
  [key: string]: any;
}

export class ZetrixWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;
  private _isRegistered = false;
  private sequence = 0;

  // Protobuf types
  private root: protobuf.Root | null = null;
  private WsMessage: protobuf.Type | null = null;
  private ChainHello: protobuf.Type | null = null;
  private ChainTxStatus: protobuf.Type | null = null;
  private ChainSubscribeTx: protobuf.Type | null = null;
  private TransactionEnv: protobuf.Type | null = null;

  constructor(wsUrl: string) {
    super();
    this.wsUrl = wsUrl;
    this.initProtobuf();
  }

  private initProtobuf() {
    try {
      // Load protobuf bundle from zetrix-sdk-nodejs
      const require = createRequire(import.meta.url);
      const bundlePath = require.resolve(
        "zetrix-sdk-nodejs/lib/crypto/protobuf/bundle.json"
      );
      const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
      this.root = protobuf.Root.fromJSON(bundle);

      this.WsMessage = this.root.lookupType("WsMessage");
      this.ChainHello = this.root.lookupType("ChainHello");
      this.ChainTxStatus = this.root.lookupType("ChainTxStatus");
      this.ChainSubscribeTx = this.root.lookupType("ChainSubscribeTx");
      this.TransactionEnv = this.root.lookupType("protocol.TransactionEnv");
    } catch (error) {
      throw new Error(
        `Failed to initialize protobuf: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private encodeWsMessage(
    type: ChainMessageType,
    data: Uint8Array
  ): Uint8Array {
    if (!this.WsMessage) throw new Error("Protobuf not initialized");
    this.sequence++;
    const msg = this.WsMessage.create({
      type,
      request: true,
      sequence: this.sequence,
      data,
    });
    return this.WsMessage.encode(msg).finish();
  }

  private decodeWsMessage(
    data: Buffer
  ): { type: number; request: boolean; sequence: number; data: Uint8Array } {
    if (!this.WsMessage) throw new Error("Protobuf not initialized");
    const msg = this.WsMessage.decode(new Uint8Array(data)) as any;
    return {
      type: Number(msg.type),
      request: msg.request as boolean,
      sequence: Number(msg.sequence),
      data: msg.data as Uint8Array,
    };
  }

  get isRegistered(): boolean {
    return this._isRegistered;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this._isRegistered;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        this.once("connected", resolve);
        this.once("error", reject);
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.on("open", () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit("connected");
          resolve();
        });

        this.ws.on("message", (data: Buffer) => {
          try {
            const wsMsg = this.decodeWsMessage(data);
            this.handleMessage(wsMsg);
          } catch (error) {
            this.emit(
              "error",
              new Error(`Failed to decode message: ${error}`)
            );
          }
        });

        this.ws.on("error", (error: any) => {
          this.isConnecting = false;
          this.emit("error", error);
          reject(error);
        });

        this.ws.on("close", () => {
          this.isConnecting = false;
          this._isRegistered = false;
          this.emit("disconnected");
          this.attemptReconnect();
        });
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(wsMsg: {
    type: number;
    request: boolean;
    sequence: number;
    data: Uint8Array;
  }) {
    switch (wsMsg.type) {
      case ChainMessageType.CHAIN_HELLO: {
        this._isRegistered = true;
        let decoded: any = {};
        if (this.ChainHello && wsMsg.data?.length) {
          try {
            decoded = this.ChainHello.decode(wsMsg.data).toJSON();
          } catch {}
        }
        this.emit("hello", {
          type: ChainMessageType.CHAIN_HELLO,
          ...decoded,
        });
        break;
      }

      case ChainMessageType.CHAIN_TX_STATUS: {
        let decoded: any = {};
        if (this.ChainTxStatus && wsMsg.data?.length) {
          try {
            decoded = this.ChainTxStatus.decode(wsMsg.data).toJSON();
          } catch {}
        }
        this.emit("tx_status", {
          type: ChainMessageType.CHAIN_TX_STATUS,
          ...decoded,
        });
        break;
      }

      case ChainMessageType.CHAIN_SUBSCRIBE_TX: {
        this.emit("subscribe_tx", {
          type: ChainMessageType.CHAIN_SUBSCRIBE_TX,
          success: true,
        });
        break;
      }

      case ChainMessageType.CHAIN_LEDGER_HEADER: {
        this.emit("ledger_header", {
          type: ChainMessageType.CHAIN_LEDGER_HEADER,
          data: wsMsg.data,
        });
        break;
      }

      default:
        this.emit("message", { type: wsMsg.type, data: wsMsg.data });
        break;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(() => {});
      }, this.reconnectDelay);
    }
  }

  private sendBinary(data: Uint8Array) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    this.ws.send(data);
  }

  async registerAndConnect(
    apiList?: ChainMessageType[]
  ): Promise<ChainHelloResponse> {
    await this.connect();

    return new Promise((resolve, reject) => {
      if (!this.ChainHello) {
        reject(new Error("Protobuf not initialized"));
        return;
      }

      const subscribeApis = apiList || [
        ChainMessageType.CHAIN_TX_STATUS,
        ChainMessageType.CHAIN_SUBSCRIBE_TX,
        ChainMessageType.CHAIN_LEDGER_HEADER,
      ];

      const hello = this.ChainHello.create({
        apiList: subscribeApis,
        timestamp: Date.now(),
      });
      const helloBytes = this.ChainHello.encode(hello).finish();
      const encoded = this.encodeWsMessage(
        ChainMessageType.CHAIN_HELLO,
        helloBytes
      );

      const timeout = setTimeout(() => {
        this.off("hello", onHello);
        reject(new Error("CHAIN_HELLO timeout"));
      }, 10000);

      const onHello = (response: ChainHelloResponse) => {
        clearTimeout(timeout);
        resolve(response);
      };

      this.once("hello", onHello);
      this.sendBinary(encoded);
    });
  }

  submitTransaction(
    transactionBlob: string,
    signatures: Array<{ public_key: string; sign_data: string }>
  ): Promise<ChainTxStatusResponse> {
    return new Promise((resolve, reject) => {
      if (!this._isRegistered) {
        reject(
          new Error(
            "WebSocket not registered. Call registerAndConnect first."
          )
        );
        return;
      }

      if (!this.root) {
        reject(new Error("Protobuf not initialized"));
        return;
      }

      try {
        // Decode the transaction blob back to Transaction protobuf
        const Transaction = this.root.lookupType("protocol.Transaction");
        const Signature = this.root.lookupType("protocol.Signature");
        const TransactionEnv = this.root.lookupType(
          "protocol.TransactionEnv"
        );

        const txBytes = Buffer.from(transactionBlob, "hex");
        const transaction = Transaction.decode(txBytes);

        const sigs = signatures.map((s) =>
          Signature.create({
            publicKey: s.public_key,
            signData: Buffer.from(s.sign_data, "hex"),
          })
        );

        const txEnv = TransactionEnv.create({
          transaction,
          signatures: sigs,
        });

        const txEnvBytes = TransactionEnv.encode(txEnv).finish();
        const encoded = this.encodeWsMessage(
          ChainMessageType.CHAIN_SUBMITTRANSACTION,
          txEnvBytes
        );

        const timeout = setTimeout(() => {
          this.off("tx_status", onTxStatus);
          reject(new Error("Transaction submission timeout"));
        }, 30000);

        const onTxStatus = (response: ChainTxStatusResponse) => {
          clearTimeout(timeout);
          resolve(response);
        };

        this.once("tx_status", onTxStatus);
        this.sendBinary(encoded);
      } catch (error) {
        reject(
          new Error(
            `Failed to encode transaction: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
    });
  }

  subscribeTransactions(addresses: string[]): Promise<ChainResponse> {
    return new Promise((resolve, reject) => {
      if (!this._isRegistered) {
        reject(
          new Error(
            "WebSocket not registered. Call registerAndConnect first."
          )
        );
        return;
      }

      if (!this.ChainSubscribeTx) {
        reject(new Error("Protobuf not initialized"));
        return;
      }

      const sub = this.ChainSubscribeTx.create({ address: addresses });
      const subBytes = this.ChainSubscribeTx.encode(sub).finish();
      const encoded = this.encodeWsMessage(
        ChainMessageType.CHAIN_SUBSCRIBE_TX,
        subBytes
      );

      const timeout = setTimeout(() => {
        this.off("subscribe_tx", onSubscribe);
        // Subscribe doesn't always get a response, resolve after timeout
        resolve({
          type: ChainMessageType.CHAIN_SUBSCRIBE_TX,
          success: true,
          addresses,
        });
      }, 5000);

      const onSubscribe = (response: ChainResponse) => {
        clearTimeout(timeout);
        resolve(response);
      };

      this.once("subscribe_tx", onSubscribe);
      this.sendBinary(encoded);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this._isRegistered = false;
    }
  }
}
