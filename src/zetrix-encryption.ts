/**
 * Zetrix Encryption Integration
 * Wraps the official zetrix-encryption-nodejs for cryptographic operations
 */

export interface ZetrixKeyPair {
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface ZetrixSignature {
  signData: string;
  publicKey: string;
}

export interface ZetrixKeystoreData {
  encryptedPrivateKey: string;
}

/**
 * ZetrixEncryption class provides cryptographic utilities for Zetrix blockchain
 * including key generation, signing, verification, and secure key storage
 */
export class ZetrixEncryption {
  private encryption: any;
  private KeyPair: any;
  private signature: any;
  private keystore: any;

  constructor() {
    // Will be initialized lazily
  }

  /**
   * Initialize the encryption library (lazy loading)
   */
  private async initEncryption() {
    if (this.encryption) return;

    try {
      // Dynamically import the CommonJS module
      const module = await import("zetrix-encryption-nodejs");
      this.encryption = module.default || module;
      this.KeyPair = this.encryption.keypair;
      this.signature = this.encryption.signature;
      this.keystore = this.encryption.keystore;
    } catch (error) {
      throw new Error(
        `Failed to initialize Zetrix Encryption: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate a new Zetrix key pair
   * @returns Object containing privateKey, publicKey, and address
   */
  async generateKeyPair(): Promise<ZetrixKeyPair> {
    await this.initEncryption();

    try {
      const kp = new this.KeyPair();
      return {
        privateKey: kp.getEncPrivateKey(),
        publicKey: kp.getEncPublicKey(),
        address: kp.getAddress(),
      };
    } catch (error) {
      throw new Error(
        `Failed to generate key pair: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get public key from private key
   * @param privateKey - The encrypted private key
   * @returns The corresponding public key
   */
  async getPublicKeyFromPrivate(privateKey: string): Promise<string> {
    await this.initEncryption();

    try {
      return this.KeyPair.getEncPublicKey(privateKey);
    } catch (error) {
      throw new Error(
        `Failed to derive public key: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get address from public key
   * @param publicKey - The public key
   * @returns The Zetrix address
   */
  async getAddressFromPublicKey(publicKey: string): Promise<string> {
    await this.initEncryption();

    try {
      return this.KeyPair.getAddress(publicKey);
    } catch (error) {
      throw new Error(
        `Failed to derive address: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Validate a private key format
   * @param privateKey - The private key to validate
   * @returns True if valid, false otherwise
   */
  async isValidPrivateKey(privateKey: string): Promise<boolean> {
    await this.initEncryption();

    try {
      return this.KeyPair.checkEncPrivateKey(privateKey);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate a public key format
   * @param publicKey - The public key to validate
   * @returns True if valid, false otherwise
   */
  async isValidPublicKey(publicKey: string): Promise<boolean> {
    await this.initEncryption();

    try {
      return this.KeyPair.checkEncPublicKey(publicKey);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate an address format
   * @param address - The address to validate
   * @returns True if valid, false otherwise
   */
  async isValidAddress(address: string): Promise<boolean> {
    await this.initEncryption();

    try {
      return this.KeyPair.checkAddress(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Sign a message with a private key
   * @param message - The message to sign (hex string)
   * @param privateKey - The private key to sign with
   * @returns The signature object
   */
  async sign(message: string, privateKey: string): Promise<ZetrixSignature> {
    await this.initEncryption();

    try {
      const signData = this.signature.sign(message, privateKey);
      const publicKey = this.KeyPair.getEncPublicKey(privateKey);

      return {
        signData,
        publicKey,
      };
    } catch (error) {
      throw new Error(
        `Failed to sign message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verify a signature
   * @param message - The original message (hex string)
   * @param signData - The signature to verify
   * @param publicKey - The public key to verify against
   * @returns True if signature is valid, false otherwise
   */
  async verify(
    message: string,
    signData: string,
    publicKey: string
  ): Promise<boolean> {
    await this.initEncryption();

    try {
      return this.signature.verify(message, signData, publicKey);
    } catch (error) {
      throw new Error(
        `Failed to verify signature: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Encrypt a private key with a password (uses callbacks, wrapped in Promise)
   * @param privateKey - The private key to encrypt
   * @param password - The password to use for encryption
   * @returns Encrypted keystore data (object that can be passed to decrypt)
   */
  async encryptPrivateKey(
    privateKey: string,
    password: string
  ): Promise<any> {
    await this.initEncryption();

    return new Promise((resolve, reject) => {
      try {
        this.keystore.encrypt(privateKey, password, (result: any) => {
          if (result) {
            // The library returns an object with encrypted data
            // Return as-is for decrypt to consume
            resolve(result);
          } else {
            reject(new Error("Encryption failed: No data returned"));
          }
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to encrypt private key: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
    });
  }

  /**
   * Decrypt an encrypted private key with a password
   * @param encryptedData - The encrypted keystore data (object or JSON string)
   * @param password - The password used for encryption
   * @returns The decrypted private key
   */
  async decryptPrivateKey(
    encryptedData: any,
    password: string
  ): Promise<string> {
    await this.initEncryption();

    return new Promise((resolve, reject) => {
      try {
        // The decrypt function accepts the object directly
        this.keystore.decrypt(encryptedData, password, (decrypted: string) => {
          if (decrypted) {
            resolve(decrypted);
          } else {
            reject(new Error("Decryption failed: Invalid password or data"));
          }
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to decrypt private key: ${error instanceof Error ? error.message : String(error)}`
          )
        );
      }
    });
  }
}
