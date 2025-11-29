# Zetrix MCP Server

A comprehensive Model Context Protocol (MCP) server for interacting with the Zetrix blockchain through Claude Desktop.

## 🚀 Quick Start

**New to this?** Start here:
- **[QUICKSTART.md](docs/QUICKSTART.md)** - Get set up in 5 minutes
- **[EXAMPLES.md](docs/EXAMPLES.md)** - Learn through 20+ examples
- **[SETUP_COMPLETE.md](docs/SETUP_COMPLETE.md)** - Complete overview

**Installation:**
```bash
npm install
npm run build
npm run setup    # Interactive setup wizard
```

Then restart Claude Desktop and start asking about Zetrix!

## Features

This MCP server provides comprehensive tools for Zetrix blockchain interaction:

### Account Operations
- **zetrix_get_account** - Get complete account information including balance and metadata
- **zetrix_get_account_base** - Get basic account info without assets and metadata
- **zetrix_get_account_assets** - Get asset holdings for an account
- **zetrix_get_account_metadata** - Get metadata associated with an account
- **zetrix_get_balance** - Get the ZTX balance of an account
- **zetrix_create_keypair** - Generate new key pair (testing only)

### Block & Ledger Operations
- **zetrix_get_block** - Get information about a specific block by height
- **zetrix_get_latest_block** - Get the latest block information
- **zetrix_get_ledger** - Get ledger information with optional validator/consensus details

### Transaction Operations
- **zetrix_get_transaction** - Get transaction details by hash
- **zetrix_get_transaction_history** - Get completed transaction records
- **zetrix_get_transaction_cache** - Get pending transactions
- **zetrix_get_transaction_blob** - Serialize transaction data to hex format
- **zetrix_submit_transaction** - Submit signed transaction to blockchain
- **zetrix_test_transaction** - Evaluate transaction fees without submission

### Contract Operations
- **zetrix_call_contract** - Call smart contract in sandbox environment for debugging

### Utility Operations
- **zetrix_check_health** - Check the health status of the Zetrix node
- **zetrix_multi_query** - Execute multiple API queries simultaneously

### WebSocket Operations (Real-time)
- **zetrix_ws_connect** - Connect and register to WebSocket for real-time updates
- **zetrix_ws_submit_transaction** - Submit transaction via WebSocket with real-time status
- **zetrix_ws_subscribe_tx** - Subscribe to transaction notifications for addresses
- **zetrix_ws_disconnect** - Disconnect from WebSocket
- **zetrix_ws_status** - Check WebSocket connection status

### Official SDK Operations
Powered by the official [zetrix-sdk-nodejs](https://github.com/Zetrix-Chain/zetrix-sdk-nodejs):

- **zetrix_sdk_create_account** - Create a new Zetrix account (address, private key, public key)
- **zetrix_sdk_get_balance** - Get account balance using the official SDK
- **zetrix_sdk_is_activated** - Check if an account is activated on the blockchain
- **zetrix_sdk_get_nonce** - Get account nonce for transaction sequencing
- **zetrix_sdk_call_contract** - Call smart contract method (query only, no state change)
- **zetrix_sdk_invoke_contract** - Invoke smart contract with transaction signing and submission

### Cryptography Operations
Powered by the official [zetrix-encryption-nodejs](https://github.com/Zetrix-Chain/zetrix-encryption-nodejs):

- **zetrix_crypto_generate_keypair** - Generate new key pair with private key, public key, and address
- **zetrix_crypto_get_public_key** - Derive public key from private key
- **zetrix_crypto_get_address** - Get Zetrix address from public key
- **zetrix_crypto_validate_key** - Validate private key, public key, or address format
- **zetrix_crypto_sign** - Sign a message with a private key
- **zetrix_crypto_verify** - Verify a signature against a message and public key
- **zetrix_crypto_encrypt_key** - Encrypt private key with password for secure storage
- **zetrix_crypto_decrypt_key** - Decrypt encrypted private key with password

### Smart Contract Development
Comprehensive contract development support based on [zetrix-contract-development-tool](https://github.com/armmarov/zetrix-contract-development-tool):

- **zetrix_contract_get_chain_functions** - Documentation for all Chain object functions (storage, transactions, queries)
- **zetrix_contract_get_utils_functions** - Documentation for all Utils object functions (math, crypto, validation)
- **zetrix_contract_get_structure_guide** - Guide on ES5 contract patterns, classes, and inheritance
- **zetrix_contract_get_token_standard** - Token standard specs (ZTP20, ZTP721, ZTP1155)
- **zetrix_contract_get_testing_guide** - Testing framework guide (TEST_INVOKE, TEST_QUERY)

## Supported Networks

- **Mainnet HTTP**: https://node.zetrix.com
- **Mainnet WebSocket**: ws://node-ws.zetrix.com
- **Testnet HTTP**: https://test-node.zetrix.com
- **Testnet WebSocket**: ws://test-node-ws.zetrix.com

## Installation

```bash
npm install
npm run build
```

## Configuration

### Option 1: Use Predefined Network

Set the network (mainnet or testnet) via environment variable:

```bash
export ZETRIX_NETWORK=mainnet  # or testnet
```

### Option 2: Use Custom RPC URL

Specify a custom RPC URL (this overrides ZETRIX_NETWORK):

```bash
export ZETRIX_RPC_URL=https://custom-node.zetrix.com
```

### Using .env file

Copy `.env.example` to `.env` and modify:

```bash
cp .env.example .env
# Edit .env to set ZETRIX_NETWORK or ZETRIX_RPC_URL
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Using with Claude Desktop

Add to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Using Mainnet

```json
{
  "mcpServers": {
    "zetrix": {
      "command": "node",
      "args": ["/absolute/path/to/zetrix-mcp-server/dist/index.js"],
      "env": {
        "ZETRIX_NETWORK": "mainnet"
      }
    }
  }
}
```

#### Using Testnet

```json
{
  "mcpServers": {
    "zetrix": {
      "command": "node",
      "args": ["/absolute/path/to/zetrix-mcp-server/dist/index.js"],
      "env": {
        "ZETRIX_NETWORK": "testnet"
      }
    }
  }
}
```

#### Using Custom RPC URL

```json
{
  "mcpServers": {
    "zetrix": {
      "command": "node",
      "args": ["/absolute/path/to/zetrix-mcp-server/dist/index.js"],
      "env": {
        "ZETRIX_RPC_URL": "https://custom-node.zetrix.com"
      }
    }
  }
}
```

## API Reference

### zetrix_check_health

Check the health status of the Zetrix node. The health check endpoint is `/hello`.

No parameters required.

**Response:**
```json
{
  "healthy": true,
  "network": "mainnet",
  "rpcUrl": "https://node.zetrix.com",
  "timestamp": 1234567890
}
```

### zetrix_get_account

Get account information for a Zetrix address.

```json
{
  "address": "ZTX123..."
}
```

### zetrix_get_block

Get block information by block number.

```json
{
  "blockNumber": 12345
}
```

### zetrix_get_latest_block

Get the latest block information (no parameters required).

### zetrix_get_transaction

Get transaction details by hash.

```json
{
  "hash": "0x123..."
}
```

### zetrix_get_balance

Get account balance in ZTX.

```json
{
  "address": "ZTX123..."
}
```

### zetrix_create_keypair

Generate a new key pair (for testing purposes only).

No parameters required.

### zetrix_get_account_base

Get basic account information without assets and metadata.

```json
{
  "address": "ZTX123..."
}
```

### zetrix_get_account_assets

Get asset holdings for an account.

```json
{
  "address": "ZTX123...",
  "code": "USD",
  "issuer": "ZTX456..."
}
```

Note: `code` and `issuer` are optional but must be used together.

### zetrix_get_account_metadata

Get metadata associated with an account.

```json
{
  "address": "ZTX123...",
  "key": "metadata_key"
}
```

Note: `key` is optional.

### zetrix_get_transaction_history

Get completed transaction records.

```json
{
  "hash": "0x123...",
  "ledgerSeq": 12345
}
```

Note: Both parameters are optional.

### zetrix_get_transaction_cache

Get pending transactions not yet executed.

```json
{
  "hash": "0x123...",
  "limit": 10
}
```

Note: Both parameters are optional.

### zetrix_get_ledger

Get ledger/block information with optional details.

```json
{
  "seq": 12345,
  "withValidator": true,
  "withConsValue": true,
  "withFee": true
}
```

Note: All parameters are optional.

### zetrix_multi_query

Execute multiple API queries simultaneously.

```json
{
  "items": [
    {
      "method": "getAccount",
      "params": { "address": "ZTX123..." }
    },
    {
      "method": "getBlockNumber"
    }
  ]
}
```

### zetrix_get_transaction_blob

Serialize transaction data into hexadecimal format.

```json
{
  "transaction": {
    "source_address": "ZTX123...",
    "nonce": 1,
    "fee_limit": "1000000",
    "gas_price": "1000",
    "operations": [...]
  }
}
```

### zetrix_submit_transaction

Submit signed transaction to blockchain for execution.

```json
{
  "transactionBlob": "0x...",
  "signatures": [
    {
      "sign_data": "0x...",
      "public_key": "0x..."
    }
  ]
}
```

### zetrix_call_contract

Call smart contract in sandbox environment for debugging (does not change blockchain state).

```json
{
  "contractAddress": "ZTX123...",
  "input": "{\"method\":\"query\",\"params\":{}}",
  "sourceAddress": "ZTX456...",
  "feeLimit": "1000000",
  "gasPrice": "1000"
}
```

Note: All parameters are optional. Use either `contractAddress` (deployed contract) or `code` (contract source).

### zetrix_test_transaction

Evaluate transaction fees without blockchain submission.

```json
{
  "items": [
    {
      "transaction_json": {
        "source_address": "ZTX123...",
        "nonce": 1,
        "operations": [...]
      },
      "signature_number": 1
    }
  ]
}
```

### zetrix_ws_connect

Connect and register to Zetrix WebSocket for real-time blockchain updates.

```json
{
  "apiList": [7, 8, 16, 17, 18]
}
```

Note: `apiList` is optional. Message types: CHAIN_SUBMITTRANSACTION(7), CHAIN_SUBSCRIBE_TX(8), CHAIN_LEDGER_HEADER(16), CHAIN_TX_STATUS(17), CHAIN_TX_ENV_STORE(18)

**Response:**
```json
{
  "self_addr": "node_address",
  "ledger_version": 1000,
  "monitor_version": 3000,
  "buchain_version": "3.0.0.0",
  "timestamp": 1234567890
}
```

### zetrix_ws_submit_transaction

Submit transaction via WebSocket and receive real-time status updates.

```json
{
  "transaction": {
    "source_address": "ZTX123...",
    "nonce": 1,
    "fee_limit": "1000000",
    "gas_price": "1000",
    "operations": [...]
  },
  "signatures": [
    {
      "public_key": "0x...",
      "sign_data": "0x..."
    }
  ]
}
```

**Response:**
```json
{
  "status": 0,
  "tx_hash": "0x...",
  "source_address": "ZTX123...",
  "source_account_seq": 1,
  "ledger_seq": 12345,
  "new_account_seq": 2
}
```

Status codes: CONFIRMED(0), PENDING(1), COMPLETE(2), FAILURE(3)

### zetrix_ws_subscribe_tx

Subscribe to real-time transaction notifications for specific addresses.

```json
{
  "addresses": ["ZTX123...", "ZTX456..."]
}
```

After subscribing, you'll receive real-time notifications when transactions occur for these addresses.

### zetrix_ws_disconnect

Disconnect from WebSocket.

No parameters required.

### zetrix_ws_status

Check WebSocket connection status.

No parameters required.

**Response:**
```json
{
  "connected": true,
  "wsUrl": "ws://node-ws.zetrix.com"
}
```

## Development

### Project Structure

```
zetrix-mcp-server/
├── src/
│   ├── index.ts           # Main MCP server implementation
│   └── zetrix-client.ts   # Zetrix blockchain client
├── dist/                  # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

## License

MIT
