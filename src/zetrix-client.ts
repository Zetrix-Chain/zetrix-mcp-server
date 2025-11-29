import axios, { AxiosInstance } from "axios";

export type ZetrixNetwork = "mainnet" | "testnet";

export interface ZetrixAccount {
  address: string;
  balance: string;
  nonce: number;
  metadata?: any;
}

export interface ZetrixBlock {
  blockNumber: number;
  closeTime: number;
  hash: string;
  prevHash: string;
  txCount: number;
  transactions?: any[];
}

export interface ZetrixTransaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  sourceAddress: string;
  feeLimit: string;
  gasPrice: string;
  nonce: number;
  operations?: any[];
  status: string;
}

export interface ZetrixBalance {
  address: string;
  balance: string;
  balanceInZTX: string;
}

export interface ZetrixNodeHealth {
  healthy: boolean;
  network: string;
  rpcUrl: string;
  timestamp: number;
  error?: string;
}

export interface ZetrixKeyPair {
  address: string;
  private_key: string;
  public_key: string;
  enc_type: string;
}

export interface ZetrixAccountAsset {
  amount: string;
  key: {
    code: string;
    issuer: string;
  };
}

export interface ZetrixAccountMetadata {
  key: string;
  value: string;
  version: number;
}

export interface ZetrixAccountBase {
  address: string;
  balance: string;
  nonce: number;
  priv?: any;
}

export interface ZetrixLedger {
  header: {
    seq: number;
    hash: string;
    previous_hash: string;
    account_tree_hash: string;
    close_time: number;
    consensus_value_hash: string;
    fees_hash: string;
    tx_count: number;
    validators_hash: string;
    version: number;
  };
  transactions?: any[];
  validators?: any[];
  consensus_value?: any;
  fees?: any;
}

export interface ZetrixTransactionBlob {
  hash: string;
  transaction_blob: string;
}

export interface ZetrixSubmitResult {
  hash: string;
  results: any[];
}

export interface ZetrixContractCallResult {
  logs: any;
  query_rets: any[];
  stat: any;
  txs: any[];
}

export interface ZetrixTestTransactionResult {
  actual_fee: string;
  hash: string;
  logs: any;
  query_rets: any[];
  stat: any;
  txs: any[];
}

const NETWORK_URLS: Record<ZetrixNetwork, string> = {
  mainnet: "https://node.zetrix.com",
  testnet: "https://test-node.zetrix.com",
};

export class ZetrixClient {
  private client: AxiosInstance;
  private rpcUrl: string;
  private network: string;

  constructor(networkOrUrl: ZetrixNetwork | string) {
    if (networkOrUrl === "mainnet" || networkOrUrl === "testnet") {
      this.rpcUrl = NETWORK_URLS[networkOrUrl];
      this.network = networkOrUrl;
    } else {
      this.rpcUrl = networkOrUrl;
      this.network = "custom";
    }

    this.client = axios.create({
      baseURL: this.rpcUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async checkHealth(): Promise<ZetrixNodeHealth> {
    try {
      const response = await this.client.get("/hello");

      return {
        healthy: response.status === 200,
        network: this.network,
        rpcUrl: this.rpcUrl,
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        healthy: false,
        network: this.network,
        rpcUrl: this.rpcUrl,
        timestamp: Date.now(),
        error: errorMessage,
      };
    }
  }

  async getAccount(address: string): Promise<ZetrixAccount> {
    try {
      const response = await this.client.post("", {
        method: "getAccount",
        params: {
          address,
        },
      });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      const account = response.data.result;
      return {
        address: account.address || address,
        balance: account.balance || "0",
        nonce: account.nonce || 0,
        metadata: account.metadatas,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get account: ${error.message}`);
      }
      throw error;
    }
  }

  async getBlock(blockNumber: number): Promise<ZetrixBlock> {
    try {
      const response = await this.client.post("", {
        method: "getBlockInfo",
        params: {
          block_number: blockNumber,
        },
      });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      const block = response.data.result.header;
      return {
        blockNumber: block.seq || blockNumber,
        closeTime: block.close_time || 0,
        hash: block.hash || "",
        prevHash: block.previous_hash || "",
        txCount: block.tx_count || 0,
        transactions: response.data.result.transactions,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get block: ${error.message}`);
      }
      throw error;
    }
  }

  async getLatestBlock(): Promise<ZetrixBlock> {
    try {
      const response = await this.client.post("", {
        method: "getBlockNumber",
      });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      const latestBlockNumber = response.data.result.header.seq;
      return this.getBlock(latestBlockNumber);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get latest block: ${error.message}`);
      }
      throw error;
    }
  }

  async getTransaction(hash: string): Promise<ZetrixTransaction> {
    try {
      const response = await this.client.post("", {
        method: "getTransactionHistory",
        params: {
          hash,
        },
      });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      const tx = response.data.result.transactions[0];
      return {
        hash: tx.hash || hash,
        blockNumber: tx.ledger_seq || 0,
        timestamp: tx.close_time || 0,
        sourceAddress: tx.source_address || "",
        feeLimit: tx.fee_limit || "0",
        gasPrice: tx.gas_price || "0",
        nonce: tx.nonce || 0,
        operations: tx.operations,
        status: tx.error_code === 0 ? "success" : "failed",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get transaction: ${error.message}`);
      }
      throw error;
    }
  }

  async getBalance(address: string): Promise<ZetrixBalance> {
    try {
      const account = await this.getAccount(address);
      const balanceInMicroZTX = BigInt(account.balance);
      const balanceInZTX = Number(balanceInMicroZTX) / 1000000;

      return {
        address,
        balance: account.balance,
        balanceInZTX: balanceInZTX.toFixed(6),
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createKeyPair(): Promise<ZetrixKeyPair> {
    try {
      const response = await this.client.get("/createKeyPair");

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to create key pair: ${error.message}`);
      }
      throw error;
    }
  }

  async getAccountBase(address: string): Promise<ZetrixAccountBase> {
    try {
      const response = await this.client.get("/getAccountBase", {
        params: { address },
      });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get account base: ${error.message}`);
      }
      throw error;
    }
  }

  async getAccountAssets(
    address: string,
    code?: string,
    issuer?: string
  ): Promise<ZetrixAccountAsset[]> {
    try {
      const params: any = { address };
      if (code && issuer) {
        params.code = code;
        params.issuer = issuer;
      }

      const response = await this.client.get("/getAccountAssets", { params });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result.assets || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get account assets: ${error.message}`);
      }
      throw error;
    }
  }

  async getAccountMetadata(
    address: string,
    key?: string
  ): Promise<ZetrixAccountMetadata[]> {
    try {
      const params: any = { address };
      if (key) {
        params.key = key;
      }

      const response = await this.client.get("/getAccountMetaData", { params });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result.metadatas || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get account metadata: ${error.message}`);
      }
      throw error;
    }
  }

  async getTransactionHistory(hash?: string, ledgerSeq?: number): Promise<any> {
    try {
      const params: any = {};
      if (hash) params.hash = hash;
      if (ledgerSeq) params.ledger_seq = ledgerSeq;

      const response = await this.client.get("/getTransactionHistory", {
        params,
      });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get transaction history: ${error.message}`);
      }
      throw error;
    }
  }

  async getTransactionCache(hash?: string, limit?: number): Promise<any> {
    try {
      const params: any = {};
      if (hash) params.hash = hash;
      if (limit) params.limit = limit;

      const response = await this.client.get("/getTransactionCache", { params });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get transaction cache: ${error.message}`);
      }
      throw error;
    }
  }

  async getLedger(
    seq?: number,
    withValidator?: boolean,
    withConsValue?: boolean,
    withFee?: boolean
  ): Promise<ZetrixLedger> {
    try {
      const params: any = {};
      if (seq) params.seq = seq;
      if (withValidator) params.with_validator = withValidator;
      if (withConsValue) params.with_consvalue = withConsValue;
      if (withFee) params.with_fee = withFee;

      const response = await this.client.get("/getLedger", { params });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get ledger: ${error.message}`);
      }
      throw error;
    }
  }

  async multiQuery(items: any[]): Promise<any[]> {
    try {
      const response = await this.client.post("/multiQuery", { items });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to execute multi query: ${error.message}`);
      }
      throw error;
    }
  }

  async getTransactionBlob(transaction: any): Promise<ZetrixTransactionBlob> {
    try {
      const response = await this.client.post("/getTransactionBlob", transaction);

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get transaction blob: ${error.message}`);
      }
      throw error;
    }
  }

  async submitTransaction(
    transactionBlob: string,
    signatures: Array<{ sign_data: string; public_key: string }>
  ): Promise<ZetrixSubmitResult> {
    try {
      const response = await this.client.post("/submitTransaction", {
        transaction_blob: transactionBlob,
        signatures,
      });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to submit transaction: ${error.message}`);
      }
      throw error;
    }
  }

  async callContract(params: {
    contract_address?: string;
    code?: string;
    input?: string;
    contract_balance?: string;
    fee_limit?: string;
    gas_price?: string;
    opt_type?: number;
    source_address?: string;
  }): Promise<ZetrixContractCallResult> {
    try {
      const response = await this.client.post("/callContract", params);

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to call contract: ${error.message}`);
      }
      throw error;
    }
  }

  async testTransaction(items: any[]): Promise<ZetrixTestTransactionResult> {
    try {
      const response = await this.client.post("/testTransaction", { items });

      if (response.data.error_code !== 0) {
        throw new Error(
          response.data.error_desc || `API Error: ${response.data.error_code}`
        );
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to test transaction: ${error.message}`);
      }
      throw error;
    }
  }
}
