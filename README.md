# Zetrix MCP Server

A comprehensive Model Context Protocol (MCP) server for interacting with the Zetrix blockchain. Provides **55 tools** across 7 categories — HTTP RPC, WebSocket (protobuf), SDK transactions, cryptography, and smart contract development.

## Zetrix Currency Information

**Native Coin:** ZETRIX
- **Main Unit:** ZETRIX
- **Base Unit:** ZETA
- **Conversion:** 1 ZETRIX = 1,000,000 ZETA
- **Gas Price:** Evaluated dynamically via `testTransaction`

## Quick Start

```bash
npx zetrix-mcp-server
```

Or install globally:

```bash
npm install -g zetrix-mcp-server
```

**Guides:**
- [QUICKSTART.md](docs/QUICKSTART.md) — Get set up in 5 minutes
- [EXAMPLES.md](docs/EXAMPLES.md) — Learn through 20+ examples
- [TEST_REPORT.md](docs/TEST_REPORT.md) — Comprehensive test results for all 55 tools

## Features (55 Tools)

### HTTP RPC (16 tools)

| Tool | Description |
|---|---|
| `zetrix_check_health` | Check node health status |
| `zetrix_get_account` | Get account info including balance and metadata |
| `zetrix_get_block` | Get block by height |
| `zetrix_get_latest_block` | Get latest block |
| `zetrix_get_transaction` | Get transaction by hash |
| `zetrix_get_balance` | Get balance in ZETA and ZETRIX |
| `zetrix_create_keypair` | Generate new keypair (testing only) |
| `zetrix_get_account_base` | Get basic account info |
| `zetrix_get_account_assets` | Get asset holdings |
| `zetrix_get_account_metadata` | Get account metadata |
| `zetrix_get_transaction_history` | Get completed transactions |
| `zetrix_get_transaction_cache` | Get pending transactions |
| `zetrix_get_ledger` | Get ledger/block info |
| `zetrix_multi_query` | Execute multiple queries |
| `zetrix_get_transaction_blob` | Serialize transaction to hex |
| `zetrix_submit_transaction` | Submit signed transaction |

### Contract Query (2 tools)

| Tool | Description |
|---|---|
| `zetrix_call_contract` | Call contract in sandbox (read-only) |
| `zetrix_test_transaction` | Evaluate fees without submitting |

### WebSocket — Real-time (5 tools)

Uses **protobuf binary encoding** for communication with Zetrix nodes.

| Tool | Description |
|---|---|
| `zetrix_ws_connect` | Connect and register via protobuf CHAIN_HELLO |
| `zetrix_ws_submit_transaction` | Submit transaction with real-time status |
| `zetrix_ws_subscribe_tx` | Subscribe to transaction notifications |
| `zetrix_ws_disconnect` | Disconnect from WebSocket |
| `zetrix_ws_status` | Check connection status |

### SDK Query (5 tools)

| Tool | Description |
|---|---|
| `zetrix_sdk_create_account` | Create new account |
| `zetrix_sdk_get_balance` | Get balance via SDK |
| `zetrix_sdk_is_activated` | Check if account is activated |
| `zetrix_sdk_get_nonce` | Get account nonce |
| `zetrix_sdk_call_contract` | Call contract via SDK (read-only) |

### SDK Transactions (11 tools)

All transaction tools use `evaluateFee` (testTransaction) for dynamic gas pricing. Optional `gasPrice`/`feeLimit` overrides supported on all operations.

| Tool | Description |
|---|---|
| `zetrix_sdk_send_gas` | Send native ZETRIX to another address |
| `zetrix_sdk_activate_account` | Activate a new account with initial balance |
| `zetrix_sdk_set_metadata` | Set key-value metadata on an account |
| `zetrix_sdk_set_privilege` | Set account weights, thresholds, and signers |
| `zetrix_sdk_issue_asset` | Issue a new custom token |
| `zetrix_sdk_send_asset` | Transfer a custom token |
| `zetrix_sdk_create_contract` | Deploy a smart contract (with optional owner) |
| `zetrix_sdk_invoke_contract` | Invoke contract with gas payment |
| `zetrix_sdk_invoke_contract_by_asset` | Invoke contract with asset transfer |
| `zetrix_sdk_upgrade_contract` | Upgrade contract code and/or transfer ownership |
| `zetrix_sdk_create_log` | Create an on-chain event log |

### Cryptography (8 tools)

| Tool | Description |
|---|---|
| `zetrix_crypto_generate_keypair` | Generate new keypair (address, private key, public key) |
| `zetrix_crypto_get_public_key` | Derive public key from private key |
| `zetrix_crypto_get_address` | Get address from public key |
| `zetrix_crypto_validate_key` | Validate private key, public key, or address format |
| `zetrix_crypto_sign` | Sign a message (hex) with a private key |
| `zetrix_crypto_verify` | Verify a signature |
| `zetrix_crypto_encrypt_key` | Encrypt private key with password |
| `zetrix_crypto_decrypt_key` | Decrypt encrypted private key |

### Smart Contract Development (7 tools)

| Tool | Description |
|---|---|
| `zetrix_contract_get_chain_functions` | Chain object function documentation |
| `zetrix_contract_get_utils_functions` | Utils object function documentation |
| `zetrix_contract_get_structure_guide` | Contract structure and ES5 patterns guide |
| `zetrix_contract_get_token_standard` | Token standard specs (ZTP20, ZTP721, ZTP1155) |
| `zetrix_contract_init_dev_environment` | Initialize dev project via `create-zetrix-tool` |
| `zetrix_contract_generate_advanced` | Generate multi-class contract architecture |
| `zetrix_contract_get_testing_guide` | Testing guide (TEST_INVOKE, TEST_QUERY) |

## Supported Networks

| Network | HTTP RPC | WebSocket |
|---|---|---|
| Mainnet | `https://node.zetrix.com` | `wss://ws-node.zetrix.com` |
| Testnet | `https://test-node.zetrix.com` | `wss://test-ws-node.zetrix.com` |

## Configuration

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ZETRIX_NETWORK` | Network selection (`mainnet` or `testnet`) | `mainnet` |
| `ZETRIX_RPC_URL` | Custom HTTP RPC endpoint (overrides network default) | — |
| `ZETRIX_WS_URL` | Custom WebSocket endpoint (overrides network default) | — |

### Claude Desktop / Claude Code

Add to your MCP configuration:

**Testnet:**
```json
{
  "mcpServers": {
    "zetrix": {
      "command": "npx",
      "args": ["-y", "zetrix-mcp-server"],
      "env": {
        "ZETRIX_NETWORK": "testnet"
      }
    }
  }
}
```

**Mainnet:**
```json
{
  "mcpServers": {
    "zetrix": {
      "command": "npx",
      "args": ["-y", "zetrix-mcp-server"],
      "env": {
        "ZETRIX_NETWORK": "mainnet"
      }
    }
  }
}
```

**Testnet with custom RPC and WebSocket URLs:**
```json
{
  "mcpServers": {
    "zetrix": {
      "command": "npx",
      "args": ["-y", "zetrix-mcp-server"],
      "env": {
        "ZETRIX_NETWORK": "testnet",
        "ZETRIX_RPC_URL": "https://your-testnet-node.example.com",
        "ZETRIX_WS_URL": "wss://your-testnet-ws.example.com"
      }
    }
  }
}
```

**Mainnet with custom RPC and WebSocket URLs:**
```json
{
  "mcpServers": {
    "zetrix": {
      "command": "npx",
      "args": ["-y", "zetrix-mcp-server"],
      "env": {
        "ZETRIX_NETWORK": "mainnet",
        "ZETRIX_RPC_URL": "https://your-mainnet-node.example.com",
        "ZETRIX_WS_URL": "wss://your-mainnet-ws.example.com"
      }
    }
  }
}
```

> **Note:** `ZETRIX_RPC_URL` and `ZETRIX_WS_URL` override the default endpoints for the selected network. You can override just one or both. If not set, the defaults from the table above are used.

## Development

### Project Structure

```
zetrix-mcp-server/
├── src/
│   ├── index.ts                  # MCP server (55 tool definitions + handlers)
│   ├── zetrix-client.ts          # HTTP RPC client
│   ├── zetrix-sdk.ts             # SDK wrapper (11 transaction operations)
│   ├── zetrix-websocket.ts       # WebSocket client (protobuf binary)
│   ├── zetrix-encryption.ts      # Crypto operations
│   ├── zetrix-contract-docs.ts   # Contract documentation
│   └── zetrix-contract-generator.ts # Contract code generator
├── tests/
│   ├── test-server.js            # HTTP RPC tests
│   ├── test-sdk.js               # SDK tests
│   └── test-encryption.js        # Crypto tests
├── docs/
│   ├── TEST_REPORT.md            # Comprehensive test results
│   ├── DEVELOPER_GUIDE.md        # Developer documentation
│   ├── ZETRIX_CONTRACT_DEVELOPMENT_RULES.md
│   ├── QUICKSTART.md             # 5-minute setup guide
│   └── EXAMPLES.md               # 20+ usage examples
└── dist/                         # Compiled output
```

### Build

```bash
npm install
npm run build
```

### Test

```bash
npm test                           # HTTP RPC tests
ZETRIX_NETWORK=testnet npm test    # Run on testnet
npm run test:sdk                   # SDK tests
npm run test:encryption            # Crypto tests
```

## License

MIT
