#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { ZetrixClient, ZetrixNetwork, ZETRIX_CONSTANTS } from "./zetrix-client.js";
import { ZetrixWebSocketClient } from "./zetrix-websocket.js";
import { ZetrixSDK } from "./zetrix-sdk.js";
import { ZetrixEncryption } from "./zetrix-encryption.js";
import { ZetrixContractDocs } from "./zetrix-contract-docs.js";
import { ZetrixContractGenerator, ContractGenerationOptions } from "./zetrix-contract-generator.js";

// Zetrix Network Information:
// - Native coin: ZETRIX (main unit)
// - Micro unit: ZETA
// - Conversion: 1 ZETRIX = 1,000,000 ZETA
// - Standard gas price: 5 ZETA per transaction
const ZETRIX_NETWORK = (process.env.ZETRIX_NETWORK || "mainnet") as ZetrixNetwork;
const ZETRIX_RPC_URL = process.env.ZETRIX_RPC_URL;
const ZETRIX_WS_URL = process.env.ZETRIX_WS_URL;

const server = new Server(
  {
    name: "zetrix-mcp-server",
    version: "1.0.2",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const zetrixClient = new ZetrixClient(ZETRIX_RPC_URL || ZETRIX_NETWORK);
const zetrixSDK = new ZetrixSDK(ZETRIX_RPC_URL || ZETRIX_NETWORK);
const zetrixEncryption = new ZetrixEncryption();
const zetrixContractDocs = new ZetrixContractDocs();
const zetrixContractGenerator = new ZetrixContractGenerator();

// WebSocket URL mapping
const WS_NETWORK_URLS: Record<ZetrixNetwork, string> = {
  mainnet: "ws://node-ws.zetrix.com",
  testnet: "ws://test-node-ws.zetrix.com",
};

let zetrixWsClient: ZetrixWebSocketClient | null = null;

function getWebSocketClient(): ZetrixWebSocketClient {
  if (!zetrixWsClient) {
    const wsUrl = ZETRIX_WS_URL || WS_NETWORK_URLS[ZETRIX_NETWORK];
    zetrixWsClient = new ZetrixWebSocketClient(wsUrl);
  }
  return zetrixWsClient;
}

const tools: Tool[] = [
  {
    name: "zetrix_check_health",
    description: "Check the health status of the Zetrix node",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_get_account",
    description: "Get Zetrix account information including balance and metadata",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_get_block",
    description: "Get information about a specific block by height",
    inputSchema: {
      type: "object",
      properties: {
        blockNumber: {
          type: "number",
          description: "The block height/number to query",
        },
      },
      required: ["blockNumber"],
    },
  },
  {
    name: "zetrix_get_latest_block",
    description: "Get the latest block information from Zetrix blockchain",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_get_transaction",
    description: "Get transaction details by transaction hash",
    inputSchema: {
      type: "object",
      properties: {
        hash: {
          type: "string",
          description: "The transaction hash",
        },
      },
      required: ["hash"],
    },
  },
  {
    name: "zetrix_get_balance",
    description: "Get the ZETRIX balance of an account. Returns balance in both ZETA (micro units) and ZETRIX (main units). Note: 1 ZETRIX = 1,000,000 ZETA",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_create_keypair",
    description: "Generate a new public-private key pair (for testing only)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_get_account_base",
    description: "Get basic account information without assets and metadata",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_get_account_assets",
    description: "Get asset holdings for an account",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
        code: {
          type: "string",
          description: "Asset code (optional, must be used with issuer)",
        },
        issuer: {
          type: "string",
          description: "Asset issuer address (optional, must be used with code)",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_get_account_metadata",
    description: "Get metadata associated with an account",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
        key: {
          type: "string",
          description: "Specific metadata key (optional)",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_get_transaction_history",
    description: "Get completed transaction records",
    inputSchema: {
      type: "object",
      properties: {
        hash: {
          type: "string",
          description: "Transaction hash (optional)",
        },
        ledgerSeq: {
          type: "number",
          description: "Block sequence number (optional)",
        },
      },
    },
  },
  {
    name: "zetrix_get_transaction_cache",
    description: "Get pending transactions not yet executed",
    inputSchema: {
      type: "object",
      properties: {
        hash: {
          type: "string",
          description: "Transaction hash (optional)",
        },
        limit: {
          type: "number",
          description: "Number of pending transactions to return (optional)",
        },
      },
    },
  },
  {
    name: "zetrix_get_ledger",
    description: "Get block/ledger information with optional details",
    inputSchema: {
      type: "object",
      properties: {
        seq: {
          type: "number",
          description: "Block sequence number (optional)",
        },
        withValidator: {
          type: "boolean",
          description: "Include validator list (optional)",
        },
        withConsValue: {
          type: "boolean",
          description: "Include consensus value (optional)",
        },
        withFee: {
          type: "boolean",
          description: "Include fee configuration (optional)",
        },
      },
    },
  },
  {
    name: "zetrix_multi_query",
    description: "Execute multiple API queries simultaneously",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Array of query objects",
        },
      },
      required: ["items"],
    },
  },
  {
    name: "zetrix_get_transaction_blob",
    description: "Serialize transaction data into hexadecimal format",
    inputSchema: {
      type: "object",
      properties: {
        transaction: {
          type: "object",
          description: "Transaction object with source_address, nonce, fee_limit, gas_price, operations",
        },
      },
      required: ["transaction"],
    },
  },
  {
    name: "zetrix_submit_transaction",
    description: "Submit signed transaction to blockchain for execution",
    inputSchema: {
      type: "object",
      properties: {
        transactionBlob: {
          type: "string",
          description: "Serialized transaction blob",
        },
        signatures: {
          type: "array",
          description: "Array of signature objects with sign_data and public_key",
        },
      },
      required: ["transactionBlob", "signatures"],
    },
  },
  {
    name: "zetrix_call_contract",
    description: "Call smart contract in sandbox environment for debugging",
    inputSchema: {
      type: "object",
      properties: {
        contractAddress: {
          type: "string",
          description: "Deployed contract address (optional)",
        },
        code: {
          type: "string",
          description: "Contract source code (optional)",
        },
        input: {
          type: "string",
          description: "Function parameters (optional)",
        },
        contractBalance: {
          type: "string",
          description: "Contract balance (optional)",
        },
        feeLimit: {
          type: "string",
          description: "Fee limit (optional)",
        },
        gasPrice: {
          type: "string",
          description: "Gas price (optional)",
        },
        optType: {
          type: "number",
          description: "Operation type (optional)",
        },
        sourceAddress: {
          type: "string",
          description: "Source address (optional)",
        },
      },
    },
  },
  {
    name: "zetrix_test_transaction",
    description: "Evaluate transaction fees without blockchain submission",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Array of test transaction items",
        },
      },
      required: ["items"],
    },
  },
  {
    name: "zetrix_ws_connect",
    description: "Connect and register to Zetrix WebSocket for real-time updates",
    inputSchema: {
      type: "object",
      properties: {
        apiList: {
          type: "array",
          description: "Optional list of API message types to register (numbers)",
        },
      },
    },
  },
  {
    name: "zetrix_ws_submit_transaction",
    description: "Submit transaction via WebSocket and get real-time status updates",
    inputSchema: {
      type: "object",
      properties: {
        transaction: {
          type: "object",
          description: "Transaction object",
        },
        signatures: {
          type: "array",
          description: "Array of signature objects with public_key and sign_data",
        },
        trigger: {
          type: "object",
          description: "Optional trigger object",
        },
      },
      required: ["transaction", "signatures"],
    },
  },
  {
    name: "zetrix_ws_subscribe_tx",
    description: "Subscribe to transaction notifications for specific addresses",
    inputSchema: {
      type: "object",
      properties: {
        addresses: {
          type: "array",
          description: "Array of account addresses to subscribe to",
        },
      },
      required: ["addresses"],
    },
  },
  {
    name: "zetrix_ws_disconnect",
    description: "Disconnect from WebSocket",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_ws_status",
    description: "Check WebSocket connection status",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_sdk_create_account",
    description: "Create a new Zetrix account using the official SDK",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_sdk_get_balance",
    description: "Get account balance using the official SDK",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_sdk_is_activated",
    description: "Check if an account is activated on the blockchain",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_sdk_get_nonce",
    description: "Get account nonce (transaction sequence number)",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The Zetrix account address",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "zetrix_sdk_call_contract",
    description: "Call a smart contract function (query only, no state change) using SDK",
    inputSchema: {
      type: "object",
      properties: {
        contractAddress: {
          type: "string",
          description: "The deployed smart contract address",
        },
        input: {
          type: "string",
          description: "JSON string with method and params",
        },
        sourceAddress: {
          type: "string",
          description: "Optional source address for the call",
        },
      },
      required: ["contractAddress"],
    },
  },
  {
    name: "zetrix_sdk_invoke_contract",
    description: "Invoke a smart contract function with state change (requires private key)",
    inputSchema: {
      type: "object",
      properties: {
        sourceAddress: {
          type: "string",
          description: "The account address initiating the transaction",
        },
        privateKey: {
          type: "string",
          description: "Private key for signing the transaction",
        },
        contractAddress: {
          type: "string",
          description: "The smart contract address to invoke",
        },
        amount: {
          type: "string",
          description: "Amount of ZTX to send with invocation (in micro-ZTX)",
        },
        input: {
          type: "string",
          description: "JSON string with method and params",
        },
        metadata: {
          type: "string",
          description: "Optional transaction description",
        },
      },
      required: ["sourceAddress", "privateKey", "contractAddress", "amount", "input"],
    },
  },

  // Encryption Tools
  {
    name: "zetrix_crypto_generate_keypair",
    description: "Generate a new Zetrix key pair with private key, public key, and address",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_crypto_get_public_key",
    description: "Derive public key from private key",
    inputSchema: {
      type: "object",
      properties: {
        privateKey: {
          type: "string",
          description: "The encrypted private key",
        },
      },
      required: ["privateKey"],
    },
  },
  {
    name: "zetrix_crypto_get_address",
    description: "Get Zetrix address from public key",
    inputSchema: {
      type: "object",
      properties: {
        publicKey: {
          type: "string",
          description: "The public key",
        },
      },
      required: ["publicKey"],
    },
  },
  {
    name: "zetrix_crypto_validate_key",
    description: "Validate private key, public key, or address format",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["privateKey", "publicKey", "address"],
          description: "Type of key to validate",
        },
        value: {
          type: "string",
          description: "The key or address to validate",
        },
      },
      required: ["type", "value"],
    },
  },
  {
    name: "zetrix_crypto_sign",
    description: "Sign a message with a private key",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to sign (hex string)",
        },
        privateKey: {
          type: "string",
          description: "The private key to sign with",
        },
      },
      required: ["message", "privateKey"],
    },
  },
  {
    name: "zetrix_crypto_verify",
    description: "Verify a signature against a message and public key",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The original message (hex string)",
        },
        signature: {
          type: "string",
          description: "The signature to verify",
        },
        publicKey: {
          type: "string",
          description: "The public key to verify against",
        },
      },
      required: ["message", "signature", "publicKey"],
    },
  },
  {
    name: "zetrix_crypto_encrypt_key",
    description: "Encrypt a private key with a password for secure storage",
    inputSchema: {
      type: "object",
      properties: {
        privateKey: {
          type: "string",
          description: "The private key to encrypt",
        },
        password: {
          type: "string",
          description: "The password to use for encryption",
        },
      },
      required: ["privateKey", "password"],
    },
  },
  {
    name: "zetrix_crypto_decrypt_key",
    description: "Decrypt an encrypted private key with a password",
    inputSchema: {
      type: "object",
      properties: {
        encryptedData: {
          type: "string",
          description: "The encrypted keystore data",
        },
        password: {
          type: "string",
          description: "The password used for encryption",
        },
      },
      required: ["encryptedData", "password"],
    },
  },

  // Smart Contract Development Tools
  {
    name: "zetrix_contract_get_chain_functions",
    description: "Get documentation for all built-in Chain object functions available in Zetrix smart contracts",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_contract_get_utils_functions",
    description: "Get documentation for all built-in Utils object functions available in Zetrix smart contracts",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_contract_get_structure_guide",
    description: "Get guide on how to structure Zetrix smart contracts with ES5 patterns, classes, and inheritance",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "zetrix_contract_get_token_standard",
    description: "Get token standard specification (ZTP20, ZTP721, or ZTP1155)",
    inputSchema: {
      type: "object",
      properties: {
        standard: {
          type: "string",
          enum: ["ZTP20", "ZTP721", "ZTP1155"],
          description: "Token standard to get documentation for",
        },
      },
      required: ["standard"],
    },
  },
  {
    name: "zetrix_contract_init_dev_environment",
    description: "Initialize a new Zetrix smart contract development environment using create-zetrix-tool. This creates a complete project structure with testing framework, examples, and utilities.",
    inputSchema: {
      type: "object",
      properties: {
        contractName: {
          type: "string",
          description: "Name of the contract project to create (alphanumeric and hyphens only)",
        },
        workingDirectory: {
          type: "string",
          description: "Directory where to create the project (defaults to current directory)",
        },
      },
      required: ["contractName"],
    },
  },
  {
    name: "zetrix_contract_generate_advanced",
    description: "Generate advanced multi-class Zetrix smart contract with interfaces, libraries, utilities, main contract, and comprehensive test specs. **CRITICAL: You MUST call zetrix_contract_init_dev_environment FIRST to create the project structure using npx create-zetrix-tool, then use this tool to generate the specific contract files.** Supports complex architectures with inheritance, composition, and modular design.",
    inputSchema: {
      type: "object",
      properties: {
        contractName: {
          type: "string",
          description: "Name of the main contract (e.g., 'StableCoin', 'NFTMarketplace')",
        },
        contractType: {
          type: "string",
          enum: ["token", "nft", "defi", "governance", "marketplace", "custom"],
          description: "Type of contract to generate",
        },
        features: {
          type: "array",
          items: {
            type: "string",
            enum: ["pausable", "ownable", "roles", "upgradeable", "whitelist", "blacklist", "timelock", "oracle"],
          },
          description: "Advanced features to include",
        },
        tokenStandard: {
          type: "string",
          enum: ["ZTP20", "ZTP721", "ZTP1155"],
          description: "Token standard (required if contractType is 'token' or 'nft')",
        },
        includeTests: {
          type: "boolean",
          description: "Generate comprehensive test specifications (default: true)",
        },
        outputDirectory: {
          type: "string",
          description: "Directory to output the contract files (defaults to current directory)",
        },
      },
      required: ["contractName", "contractType"],
    },
  },
  {
    name: "zetrix_contract_get_testing_guide",
    description: "Get guide on testing Zetrix smart contracts with TEST_INVOKE and TEST_QUERY",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "zetrix_check_health": {
        const result = await zetrixClient.checkHealth();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_account": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getAccount(args.address as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_block": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getBlock(args.blockNumber as number);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_latest_block": {
        const result = await zetrixClient.getLatestBlock();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_transaction": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getTransaction(args.hash as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_balance": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getBalance(args.address as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_create_keypair": {
        const result = await zetrixClient.createKeyPair();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_account_base": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getAccountBase(args.address as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_account_assets": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getAccountAssets(
          args.address as string,
          args.code as string | undefined,
          args.issuer as string | undefined
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_account_metadata": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getAccountMetadata(
          args.address as string,
          args.key as string | undefined
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_transaction_history": {
        const result = await zetrixClient.getTransactionHistory(
          args?.hash as string | undefined,
          args?.ledgerSeq as number | undefined
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_transaction_cache": {
        const result = await zetrixClient.getTransactionCache(
          args?.hash as string | undefined,
          args?.limit as number | undefined
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_ledger": {
        const result = await zetrixClient.getLedger(
          args?.seq as number | undefined,
          args?.withValidator as boolean | undefined,
          args?.withConsValue as boolean | undefined,
          args?.withFee as boolean | undefined
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_multi_query": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.multiQuery(args.items as any[]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_get_transaction_blob": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.getTransactionBlob(args.transaction);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_submit_transaction": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.submitTransaction(
          args.transactionBlob as string,
          args.signatures as Array<{ sign_data: string; public_key: string }>
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_call_contract": {
        const params: any = {};
        if (args?.contractAddress) params.contract_address = args.contractAddress;
        if (args?.code) params.code = args.code;
        if (args?.input) params.input = args.input;
        if (args?.contractBalance) params.contract_balance = args.contractBalance;
        if (args?.feeLimit) params.fee_limit = args.feeLimit;
        if (args?.gasPrice) params.gas_price = args.gasPrice;
        if (args?.optType) params.opt_type = args.optType;
        if (args?.sourceAddress) params.source_address = args.sourceAddress;

        const result = await zetrixClient.callContract(params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_test_transaction": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixClient.testTransaction(args.items as any[]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_ws_connect": {
        const wsClient = getWebSocketClient();
        const result = await wsClient.registerAndConnect(
          args?.apiList as number[] | undefined
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_ws_submit_transaction": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const wsClient = getWebSocketClient();
        const result = await wsClient.submitTransaction(
          args.transaction,
          args.signatures as Array<{ public_key: string; sign_data: string }>,
          args.trigger
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_ws_subscribe_tx": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const wsClient = getWebSocketClient();
        const result = await wsClient.subscribeTransactions(
          args.addresses as string[]
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_ws_disconnect": {
        const wsClient = getWebSocketClient();
        wsClient.disconnect();
        return {
          content: [
            {
              type: "text",
              text: "WebSocket disconnected successfully",
            },
          ],
        };
      }

      case "zetrix_ws_status": {
        const wsClient = getWebSocketClient();
        const isConnected = wsClient.isConnected();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                connected: isConnected,
                wsUrl: ZETRIX_WS_URL || WS_NETWORK_URLS[ZETRIX_NETWORK],
              }, null, 2),
            },
          ],
        };
      }

      case "zetrix_sdk_create_account": {
        const account = await zetrixSDK.createAccount();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(account, null, 2),
            },
          ],
        };
      }

      case "zetrix_sdk_get_balance": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const balance = await zetrixSDK.getBalance(args.address as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(balance, null, 2),
            },
          ],
        };
      }

      case "zetrix_sdk_is_activated": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const isActivated = await zetrixSDK.isAccountActivated(args.address as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ address: args.address, isActivated }, null, 2),
            },
          ],
        };
      }

      case "zetrix_sdk_get_nonce": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const nonce = await zetrixSDK.getNonce(args.address as string);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ address: args.address, nonce }, null, 2),
            },
          ],
        };
      }

      case "zetrix_sdk_call_contract": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixSDK.callContract({
          contractAddress: args.contractAddress as string,
          optType: args.optType as number | undefined,
          input: args.input as string | undefined,
          sourceAddress: args.sourceAddress as string | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_sdk_invoke_contract": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const result = await zetrixSDK.invokeContract({
          sourceAddress: args.sourceAddress as string,
          privateKey: args.privateKey as string,
          contractAddress: args.contractAddress as string,
          amount: args.amount as string,
          input: args.input as string,
          metadata: args.metadata as string | undefined,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_generate_keypair": {
        const keyPair = await zetrixEncryption.generateKeyPair();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(keyPair, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_get_public_key": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const publicKey = await zetrixEncryption.getPublicKeyFromPrivate(
          args.privateKey as string
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ publicKey }, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_get_address": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const address = await zetrixEncryption.getAddressFromPublicKey(
          args.publicKey as string
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ address }, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_validate_key": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        let isValid = false;
        const type = args.type as string;
        const value = args.value as string;

        if (type === "privateKey") {
          isValid = await zetrixEncryption.isValidPrivateKey(value);
        } else if (type === "publicKey") {
          isValid = await zetrixEncryption.isValidPublicKey(value);
        } else if (type === "address") {
          isValid = await zetrixEncryption.isValidAddress(value);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ type, value, isValid }, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_sign": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const signature = await zetrixEncryption.sign(
          args.message as string,
          args.privateKey as string
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(signature, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_verify": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const isValid = await zetrixEncryption.verify(
          args.message as string,
          args.signature as string,
          args.publicKey as string
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ isValid }, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_encrypt_key": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const encryptedData = await zetrixEncryption.encryptPrivateKey(
          args.privateKey as string,
          args.password as string
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ encryptedData }, null, 2),
            },
          ],
        };
      }

      case "zetrix_crypto_decrypt_key": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const privateKey = await zetrixEncryption.decryptPrivateKey(
          args.encryptedData, // Can be object or string
          args.password as string
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ privateKey }, null, 2),
            },
          ],
        };
      }

      case "zetrix_contract_get_chain_functions": {
        const docs = zetrixContractDocs.getChainFunctions();
        return {
          content: [
            {
              type: "text",
              text: docs,
            },
          ],
        };
      }

      case "zetrix_contract_get_utils_functions": {
        const docs = zetrixContractDocs.getUtilsFunctions();
        return {
          content: [
            {
              type: "text",
              text: docs,
            },
          ],
        };
      }

      case "zetrix_contract_get_structure_guide": {
        const docs = zetrixContractDocs.getStructureGuide();
        return {
          content: [
            {
              type: "text",
              text: docs,
            },
          ],
        };
      }

      case "zetrix_contract_get_token_standard": {
        if (!args) {
          throw new Error("Missing arguments");
        }
        const docs = zetrixContractDocs.getTokenStandard(args.standard as string);
        return {
          content: [
            {
              type: "text",
              text: docs,
            },
          ],
        };
      }

      case "zetrix_contract_get_testing_guide": {
        const docs = zetrixContractDocs.getTestingGuide();
        return {
          content: [
            {
              type: "text",
              text: docs,
            },
          ],
        };
      }

      case "zetrix_contract_init_dev_environment": {
        const { contractName, workingDirectory } = args as {
          contractName: string;
          workingDirectory?: string;
        };

        // Validate contract name
        if (!/^[a-zA-Z0-9-_]+$/.test(contractName)) {
          throw new Error("Contract name must contain only alphanumeric characters, hyphens, and underscores");
        }

        const { execSync } = await import("child_process");

        try {
          const cwd = workingDirectory || process.cwd();
          const command = `npx -y create-zetrix-tool ${contractName}`;

          // Execute the command
          const output = execSync(command, {
            cwd,
            encoding: 'utf-8',
            stdio: 'pipe'
          });

          return {
            content: [
              {
                type: "text",
                text: `✅ Successfully initialized Zetrix contract development environment!

Project: ${contractName}
Location: ${cwd}/${contractName}

Output:
${output}

Next steps:
1. cd ${contractName}
2. Review the generated contract templates
3. Start developing your smart contract
4. Use the testing framework to test your contract

The project includes:
- Contract templates
- Testing framework (TEST_INVOKE, TEST_QUERY)
- Example contracts (ZTP20, ZTP721, etc.)
- Utilities and helpers
- Documentation

Repository: https://github.com/armmarov/zetrix-contract-development-tool`,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to initialize development environment: ${errorMessage}`);
        }
      }

      case "zetrix_contract_generate_advanced": {
        const options = args as unknown as ContractGenerationOptions;

        try {
          // CRITICAL: Check if project exists, if not, create it with npx create-zetrix-tool
          const { execSync } = await import("child_process");
          const { existsSync } = await import("fs");
          const { join } = await import("path");

          const projectPath = join(options.outputDirectory || process.cwd(), options.contractName);

          if (!existsSync(projectPath)) {
            // Project doesn't exist, create it with official tool
            const cwd = options.outputDirectory || process.cwd();
            const command = `npx -y create-zetrix-tool ${options.contractName}`;

            console.log(`📦 Initializing project with: ${command}`);
            execSync(command, {
              cwd,
              encoding: 'utf-8',
              stdio: 'inherit'
            });

            console.log(`✅ Project structure created at ${projectPath}`);
          }

          // Generate contract files
          const { files, summary, classDiagram } = zetrixContractGenerator.generate(options);

          // Write files to disk
          zetrixContractGenerator.writeFiles(files);

          return {
            content: [
              {
                type: "text",
                text: `✅ Successfully generated advanced ${options.contractName} contract!

${summary}

Generated contract architecture:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 ${options.contractName}Interface.js
   ↳ Contract API definition
   ↳ Method signatures for main and query functions

📁 ${options.contractName}Lib.js
   ↳ Reusable utility library
   ↳ Validation, storage, and math utilities
   ↳ Can be imported by other contracts

📁 ${options.contractName}Utils.js
   ↳ Feature-specific modules
   ↳ Ownership, pausable, whitelist, blacklist
   ↳ Modular and extensible design

📁 ${options.contractName}.js
   ↳ Main contract implementation
   ↳ init(), main(), query() entry points
   ↳ Business logic and routing
${options.includeTests !== false ? `
📁 ${options.contractName}Tests.md
   ↳ Comprehensive test specifications
   ↳ TEST_INVOKE and TEST_QUERY examples
   ↳ Security and edge case tests
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Contract Type: ${options.contractType.toUpperCase()}
${options.tokenStandard ? `Token Standard: ${options.tokenStandard}` : ''}
Features: ${options.features?.join(", ") || "Basic"}

You can now:
1. Review and customize the generated contract files
2. Add your business logic to ${options.contractName}.js
3. Run the test specifications
4. Deploy to Zetrix blockchain

💡 Tip: The modular architecture allows you to:
   - Extend functionality by adding new utils modules
   - Reuse the library in other contracts
   - Test each module independently
   - Maintain clean separation of concerns`,
              },
            ],
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to generate contract: ${errorMessage}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Zetrix MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
