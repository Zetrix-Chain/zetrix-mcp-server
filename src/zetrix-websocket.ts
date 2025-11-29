import WebSocket from "ws";
import { EventEmitter } from "events";

export enum ChainMessageType {
  CHAIN_HELLO = 0,
  CHAIN_SUBMITTRANSACTION = 7,
  CHAIN_SUBSCRIBE_TX = 8,
  CHAIN_PEER_ONLINE = 12,
  CHAIN_PEER_OFFLINE = 13,
  CHAIN_PEER_MESSAGE = 14,
  CHAIN_LEDGER_HEADER = 16,
  CHAIN_TX_STATUS = 17,
  CHAIN_TX_ENV_STORE = 18,
}

export enum TransactionStatus {
  CONFIRMED = 0,
  PENDING = 1,
  COMPLETE = 2,
  FAILURE = 3,
}

export interface ChainHelloRequest {
  type: ChainMessageType.CHAIN_HELLO;
  api_list?: number[];
  timestamp: number;
}

export interface ChainHelloResponse {
  type: ChainMessageType.CHAIN_HELLO;
  self_addr: string;
  ledger_version: number;
  monitor_version: number;
  buchain_version: string;
  timestamp: number;
}

export interface ChainSubmitTransactionRequest {
  type: ChainMessageType.CHAIN_SUBMITTRANSACTION;
  transaction: any;
  signatures: Array<{
    public_key: string;
    sign_data: string;
  }>;
  trigger?: any;
}

export interface ChainTxStatusResponse {
  type: ChainMessageType.CHAIN_TX_STATUS;
  status: TransactionStatus;
  tx_hash: string;
  source_address: string;
  source_account_seq: number;
  ledger_seq?: number;
  new_account_seq?: number;
  error_code?: number;
  error_desc?: string;
}

export interface ChainTxEnvStoreResponse {
  type: ChainMessageType.CHAIN_TX_ENV_STORE;
  ledger_seq: number;
  transaction_env: any;
}

export interface ChainSubscribeTxRequest {
  type: ChainMessageType.CHAIN_SUBSCRIBE_TX;
  address: string[];
}

export interface ChainResponse {
  type: number;
  error_code?: number;
  error_desc?: string;
  [key: string]: any;
}

export interface ChainLedgerHeaderResponse {
  type: ChainMessageType.CHAIN_LEDGER_HEADER;
  ledger_seq: number;
  ledger_header: any;
}

export class ZetrixWebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;
  private messageQueue: any[] = [];
  private isRegistered = false;

  constructor(wsUrl: string) {
    super();
    this.wsUrl = wsUrl;
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
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            this.emit("error", new Error(`Failed to parse message: ${error}`));
          }
        });

        this.ws.on("error", (error) => {
          this.isConnecting = false;
          this.emit("error", error);
          reject(error);
        });

        this.ws.on("close", () => {
          this.isConnecting = false;
          this.isRegistered = false;
          this.emit("disconnected");
          this.attemptReconnect();
        });
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleMessage(message: ChainResponse) {
    switch (message.type) {
      case ChainMessageType.CHAIN_HELLO:
        this.isRegistered = true;
        this.emit("hello", message as ChainHelloResponse);
        this.flushMessageQueue();
        break;

      case ChainMessageType.CHAIN_TX_STATUS:
        this.emit("tx_status", message as ChainTxStatusResponse);
        break;

      case ChainMessageType.CHAIN_TX_ENV_STORE:
        this.emit("tx_env_store", message as ChainTxEnvStoreResponse);
        break;

      case ChainMessageType.CHAIN_LEDGER_HEADER:
        this.emit("ledger_header", message as ChainLedgerHeaderResponse);
        break;

      case ChainMessageType.CHAIN_PEER_ONLINE:
        this.emit("peer_online", message);
        break;

      case ChainMessageType.CHAIN_PEER_OFFLINE:
        this.emit("peer_offline", message);
        break;

      case ChainMessageType.CHAIN_PEER_MESSAGE:
        this.emit("peer_message", message);
        break;

      default:
        this.emit("message", message);
        break;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(() => {
          // Reconnect will be attempted again if needed
        });
      }, this.reconnectDelay);
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  private sendMessage(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    this.ws.send(JSON.stringify(message));
  }

  async registerAndConnect(apiList?: number[]): Promise<ChainHelloResponse> {
    await this.connect();

    return new Promise((resolve, reject) => {
      const helloMessage: ChainHelloRequest = {
        type: ChainMessageType.CHAIN_HELLO,
        api_list: apiList || [
          ChainMessageType.CHAIN_SUBMITTRANSACTION,
          ChainMessageType.CHAIN_SUBSCRIBE_TX,
          ChainMessageType.CHAIN_LEDGER_HEADER,
          ChainMessageType.CHAIN_TX_STATUS,
          ChainMessageType.CHAIN_TX_ENV_STORE,
        ],
        timestamp: Date.now(),
      };

      const timeout = setTimeout(() => {
        this.off("hello", onHello);
        reject(new Error("CHAIN_HELLO timeout"));
      }, 10000);

      const onHello = (response: ChainHelloResponse) => {
        clearTimeout(timeout);
        resolve(response);
      };

      this.once("hello", onHello);
      this.sendMessage(helloMessage);
    });
  }

  submitTransaction(
    transaction: any,
    signatures: Array<{ public_key: string; sign_data: string }>,
    trigger?: any
  ): Promise<ChainTxStatusResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isRegistered) {
        reject(new Error("WebSocket not registered. Call registerAndConnect first."));
        return;
      }

      const request: ChainSubmitTransactionRequest = {
        type: ChainMessageType.CHAIN_SUBMITTRANSACTION,
        transaction,
        signatures,
        trigger,
      };

      const timeout = setTimeout(() => {
        this.off("tx_status", onTxStatus);
        reject(new Error("Transaction submission timeout"));
      }, 30000);

      const onTxStatus = (response: ChainTxStatusResponse) => {
        clearTimeout(timeout);
        resolve(response);
      };

      this.once("tx_status", onTxStatus);
      this.sendMessage(request);
    });
  }

  subscribeTransactions(addresses: string[]): Promise<ChainResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isRegistered) {
        reject(new Error("WebSocket not registered. Call registerAndConnect first."));
        return;
      }

      const request: ChainSubscribeTxRequest = {
        type: ChainMessageType.CHAIN_SUBSCRIBE_TX,
        address: addresses,
      };

      const timeout = setTimeout(() => {
        reject(new Error("Subscription timeout"));
      }, 10000);

      const onMessage = (response: ChainResponse) => {
        if (response.error_code === 0) {
          clearTimeout(timeout);
          resolve(response);
        }
      };

      this.once("message", onMessage);
      this.sendMessage(request);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isRegistered = false;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isRegistered;
  }
}
