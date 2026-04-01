/**
 * Zetrix SDK Integration
 * Wraps the official zetrix-sdk-nodejs for use in the MCP server
 */

// Note: zetrix-sdk-nodejs is a CommonJS module, we need to handle it carefully
import { ZetrixNetwork } from "./zetrix-client.js";

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
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixGasSendParams {
  sourceAddress: string;
  privateKey: string;
  destAddress: string;
  amount: string;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixAccountActivateParams {
  sourceAddress: string;
  privateKey: string;
  destAddress: string;
  initBalance: string;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixAccountSetMetadataParams {
  sourceAddress: string;
  privateKey: string;
  key: string;
  value: string;
  version?: string;
  deleteFlag?: boolean;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixAccountSetPrivilegeParams {
  sourceAddress: string;
  privateKey: string;
  masterWeight?: string;
  txThreshold?: string;
  signers?: Array<{ address: string; weight: number }>;
  typeThresholds?: Array<{ type: number; threshold: number }>;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixAssetIssueParams {
  sourceAddress: string;
  privateKey: string;
  code: string;
  assetAmount: string;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixAssetSendParams {
  sourceAddress: string;
  privateKey: string;
  destAddress: string;
  code: string;
  issuer: string;
  assetAmount: string;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixContractCreateParams {
  sourceAddress: string;
  privateKey: string;
  payload: string;
  initBalance?: string;
  initInput?: string;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixContractInvokeByAssetParams {
  sourceAddress: string;
  privateKey: string;
  contractAddress: string;
  code?: string;
  issuer?: string;
  assetAmount?: string;
  input?: string;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixContractUpgradeParams {
  sourceAddress: string;
  privateKey: string;
  contractAddress: string;
  payload: string;
  gasPrice?: string;
  feeLimit?: string;
  metadata?: string;
}

export interface ZetrixLogCreateParams {
  sourceAddress: string;
  privateKey: string;
  topic: string;
  data: string;
  gasPrice?: string;
  feeLimit?: string;
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
   * Shared helper: getNonce, evaluateFee (or use overrides), buildBlob, sign, submit
   */
  private async _buildSignSubmit(params: {
    sourceAddress: string;
    privateKey: string;
    operation: any;
    gasPrice?: string;
    feeLimit?: string;
    metadata?: string;
  }): Promise<any> {
    // Get nonce
    const nonceResult = await this.sdk.account.getNonce(params.sourceAddress);
    if (nonceResult.errorCode !== 0) {
      throw new Error(
        nonceResult.errorDesc || `SDK Error: ${nonceResult.errorCode}`
      );
    }
    const nonce = (parseInt(nonceResult.result.nonce) + 1).toString();

    // Use provided gasPrice/feeLimit, or evaluate via testTransaction
    let gasPrice = params.gasPrice;
    let feeLimit = params.feeLimit;

    if (!gasPrice || !feeLimit) {
      const feeData = await this.sdk.transaction.evaluateFee({
        sourceAddress: params.sourceAddress,
        nonce,
        operations: [params.operation],
        signtureNumber: "1",
        metadata: params.metadata,
      });

      if (feeData.errorCode !== 0) {
        throw new Error(
          feeData.errorDesc || `SDK Error: ${feeData.errorCode}`
        );
      }

      gasPrice = gasPrice || feeData.result.gasPrice;
      feeLimit = feeLimit || feeData.result.feeLimit;
    }

    // Build blob
    const blobInfo = await this.sdk.transaction.buildBlob({
      sourceAddress: params.sourceAddress,
      gasPrice,
      feeLimit,
      nonce,
      operations: [params.operation],
      metadata: params.metadata,
    });

    if (blobInfo.errorCode !== 0) {
      throw new Error(
        blobInfo.errorDesc || `SDK Error: ${blobInfo.errorCode}`
      );
    }

    // Sign
    const signResult = this.sdk.transaction.sign({
      privateKeys: [params.privateKey],
      blob: blobInfo.result.transactionBlob,
    });

    if (signResult.errorCode !== 0) {
      throw new Error(
        signResult.errorDesc || `SDK Error: ${signResult.errorCode}`
      );
    }

    // Submit
    const submitResult = await this.sdk.transaction.submit({
      blob: blobInfo.result.transactionBlob,
      signature: signResult.result.signatures,
    });

    if (submitResult.errorCode !== 0) {
      throw new Error(
        submitResult.errorDesc || `SDK Error: ${submitResult.errorCode}`
      );
    }

    return submitResult.result;
  }

  /**
   * Invoke a smart contract (with state change and gas payment)
   */
  async invokeContract(params: ZetrixContractInvokeParams): Promise<any> {
    await this.initSDK();

    try {
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

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
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

  /**
   * Send native ZTX (gas) to another address
   */
  async sendGas(params: ZetrixGasSendParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.gasSendOperation({
        sourceAddress: params.sourceAddress,
        destAddress: params.destAddress,
        gasAmount: params.amount,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to send gas: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Activate a new account on the blockchain
   */
  async activateAccount(params: ZetrixAccountActivateParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.accountActivateOperation({
        sourceAddress: params.sourceAddress,
        destAddress: params.destAddress,
        initBalance: params.initBalance,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to activate account: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Set metadata key-value on an account
   */
  async setMetadata(params: ZetrixAccountSetMetadataParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.accountSetMetadataOperation({
        sourceAddress: params.sourceAddress,
        key: params.key,
        value: params.value,
        version: params.version,
        deleteFlag: params.deleteFlag,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to set metadata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Set account privilege (weights, thresholds, signers)
   */
  async setPrivilege(params: ZetrixAccountSetPrivilegeParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.accountSetPrivilegeOperation({
        sourceAddress: params.sourceAddress,
        masterWeight: params.masterWeight,
        txThreshold: params.txThreshold,
        signers: params.signers,
        typeThresholds: params.typeThresholds,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to set privilege: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Issue a new custom asset/token
   */
  async issueAsset(params: ZetrixAssetIssueParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.assetIssueOperation({
        sourceAddress: params.sourceAddress,
        code: params.code,
        assetAmount: params.assetAmount,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to issue asset: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Send a custom asset to another address
   */
  async sendAsset(params: ZetrixAssetSendParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.assetSendOperation({
        sourceAddress: params.sourceAddress,
        destAddress: params.destAddress,
        code: params.code,
        issuer: params.issuer,
        assetAmount: params.assetAmount,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to send asset: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Deploy a new smart contract
   */
  async createContract(params: ZetrixContractCreateParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.contractCreateOperation({
        sourceAddress: params.sourceAddress,
        payload: params.payload,
        initBalance: params.initBalance,
        initInput: params.initInput,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to create contract: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Invoke a smart contract with asset transfer
   */
  async invokeContractByAsset(params: ZetrixContractInvokeByAssetParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.contractInvokeByAssetOperation({
        contractAddress: params.contractAddress,
        sourceAddress: params.sourceAddress,
        code: params.code,
        issuer: params.issuer,
        assetAmount: params.assetAmount,
        input: params.input,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to invoke contract by asset: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Upgrade a smart contract's code
   */
  async upgradeContract(params: ZetrixContractUpgradeParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.contractUpgradeOperation({
        contractAddress: params.contractAddress,
        sourceAddress: params.sourceAddress,
        payload: params.payload,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to upgrade contract: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create an event log on the blockchain
   */
  async createLog(params: ZetrixLogCreateParams): Promise<any> {
    await this.initSDK();

    try {
      const operation = this.sdk.operation.logCreateOperation({
        sourceAddress: params.sourceAddress,
        topic: params.topic,
        data: params.data,
        metadata: params.metadata,
      });

      if (operation.errorCode !== 0) {
        throw new Error(
          operation.errorDesc || `SDK Error: ${operation.errorCode}`
        );
      }

      return await this._buildSignSubmit({
        sourceAddress: params.sourceAddress,
        privateKey: params.privateKey,
        operation: operation.result.operation,
        gasPrice: params.gasPrice,
        feeLimit: params.feeLimit,
        metadata: params.metadata,
      });
    } catch (error) {
      throw new Error(
        `Failed to create log: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
