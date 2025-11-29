/**
 * Zetrix SDK Integration
 * Wraps the official zetrix-sdk-nodejs for use in the MCP server
 */

// Note: zetrix-sdk-nodejs is a CommonJS module, we need to handle it carefully
import { ZetrixNetwork } from "./zetrix-client.js";

// SDK will be loaded dynamically
let ZtxSDK: any = null;

const NETWORK_HOSTS: Record<ZetrixNetwork, string> = {
  mainnet: "node.zetrix.com",
  testnet: "test-node.zetrix.com",
};

export interface ZetrixSDKAccount {
  address: string;
  privateKey: string;
  publicKey: string;
}

export interface ZetrixSDKBalance {
  address: string;
  balance: string;
}

export interface ZetrixContractCallParams {
  contractAddress: string;
  optType?: number;
  input?: string;
  sourceAddress?: string;
  amount?: string;
  metadata?: string;
}

export interface ZetrixContractInvokeParams {
  sourceAddress: string;
  privateKey: string;
  contractAddress: string;
  amount: string;
  input: string;
  metadata?: string;
}

export class ZetrixSDK {
  private sdk: any;
  private network: string;
  private host: string;

  constructor(networkOrHost: ZetrixNetwork | string) {
    if (networkOrHost === "mainnet" || networkOrHost === "testnet") {
      this.network = networkOrHost;
      this.host = NETWORK_HOSTS[networkOrHost];
    } else {
      this.network = "custom";
      this.host = networkOrHost;
    }
  }

  /**
   * Initialize the SDK (lazy loading)
   */
  private async initSDK() {
    if (this.sdk) return;

    try {
      // Dynamically import the CommonJS module
      const module = await import("zetrix-sdk-nodejs");
      const ZtxChainSDK = module.default || module;

      this.sdk = new ZtxChainSDK({ host: this.host });
    } catch (error) {
      throw new Error(
        `Failed to initialize Zetrix SDK: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create a new account
   */
  async createAccount(): Promise<ZetrixSDKAccount> {
    await this.initSDK();

    try {
      const result = await this.sdk.account.create();

      if (result.errorCode !== 0) {
        throw new Error(result.errorDesc || `SDK Error: ${result.errorCode}`);
      }

      return {
        address: result.result.address,
        privateKey: result.result.privateKey,
        publicKey: result.result.publicKey,
      };
    } catch (error) {
      throw new Error(
        `Failed to create account: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<ZetrixSDKBalance> {
    await this.initSDK();

    try {
      const result = await this.sdk.account.getBalance(address);

      if (result.errorCode !== 0) {
        throw new Error(result.errorDesc || `SDK Error: ${result.errorCode}`);
      }

      return {
        address,
        balance: result.result.balance,
      };
    } catch (error) {
      throw new Error(
        `Failed to get balance: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Call a smart contract (query only, no state change)
   */
  async callContract(params: ZetrixContractCallParams): Promise<any> {
    await this.initSDK();

    try {
      const callParams: any = {
        contractAddress: params.contractAddress,
        optType: params.optType || 2, // 2 = query
      };

      if (params.input) callParams.input = params.input;
      if (params.sourceAddress) callParams.sourceAddress = params.sourceAddress;

      const result = await this.sdk.contract.call(callParams);

      if (result.errorCode !== 0) {
        throw new Error(result.errorDesc || `SDK Error: ${result.errorCode}`);
      }

      return result.result;
    } catch (error) {
      throw new Error(
        `Failed to call contract: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Invoke a smart contract (with state change and gas payment)
   */
  async invokeContract(params: ZetrixContractInvokeParams): Promise<any> {
    await this.initSDK();

    try {
      // Create contract invoke operation
      const operation = this.sdk.operation.contractInvokeByGasOperation({
        contractAddress: params.contractAddress,
        amount: params.amount,
        input: params.input,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      // Build and sign transaction
      const feeData = await this.sdk.transaction.evaluateFee({
        sourceAddress: params.sourceAddress,
        nonce: "auto", // SDK will fetch nonce automatically
        operations: [operation.result.operation],
        signtureNumber: "1",
        metadata: params.metadata,
      });

      if (feeData.errorCode !== 0) {
        throw new Error(
          feeData.errorDesc || `SDK Error: ${feeData.errorCode}`
        );
      }

      // Submit transaction
      const txParams = {
        sourceAddress: params.sourceAddress,
        nonce: feeData.result.nonce,
        operations: [operation.result.operation],
        gasPrice: feeData.result.gasPrice,
        feeLimit: feeData.result.feeLimit,
        metadata: params.metadata,
      };

      const blob = await this.sdk.transaction.buildBlob(txParams);

      if (blob.errorCode !== 0) {
        throw new Error(blob.errorDesc || `SDK Error: ${blob.errorCode}`);
      }

      // Sign the transaction
      const signature = this.sdk.transaction.sign({
        privateKeys: [params.privateKey],
        blob: blob.result.transactionBlob,
      });

      if (signature.errorCode !== 0) {
        throw new Error(
          signature.errorDesc || `SDK Error: ${signature.errorCode}`
        );
      }

      // Submit to blockchain
      const submitResult = await this.sdk.transaction.submit({
        blob: blob.result.transactionBlob,
        signature: signature.result.signatures,
      });

      if (submitResult.errorCode !== 0) {
        throw new Error(
          submitResult.errorDesc || `SDK Error: ${submitResult.errorCode}`
        );
      }

      return submitResult.result;
    } catch (error) {
      throw new Error(
        `Failed to invoke contract: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if an account exists
   */
  async isAccountActivated(address: string): Promise<boolean> {
    await this.initSDK();

    try {
      const result = await this.sdk.account.isActivated(address);

      if (result.errorCode !== 0) {
        // If error code is "account not exist", return false
        if (result.errorCode === 4) {
          return false;
        }
        throw new Error(result.errorDesc || `SDK Error: ${result.errorCode}`);
      }

      return result.result.isActivated;
    } catch (error) {
      throw new Error(
        `Failed to check account: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get account nonce
   */
  async getNonce(address: string): Promise<number> {
    await this.initSDK();

    try {
      const result = await this.sdk.account.getNonce(address);

      if (result.errorCode !== 0) {
        throw new Error(result.errorDesc || `SDK Error: ${result.errorCode}`);
      }

      return result.result.nonce;
    } catch (error) {
      throw new Error(
        `Failed to get nonce: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Evaluate transaction fee
   */
  async evaluateFee(params: {
    sourceAddress: string;
    nonce: string | number;
    operations: any[];
    signatureNumber: string | number;
    metadata?: string;
  }): Promise<any> {
    await this.initSDK();

    try {
      const result = await this.sdk.transaction.evaluateFee({
        sourceAddress: params.sourceAddress,
        nonce: params.nonce.toString(),
        operations: params.operations,
        signtureNumber: params.signatureNumber.toString(),
        metadata: params.metadata,
      });

      if (result.errorCode !== 0) {
        throw new Error(result.errorDesc || `SDK Error: ${result.errorCode}`);
      }

      return result.result;
    } catch (error) {
      throw new Error(
        `Failed to evaluate fee: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
