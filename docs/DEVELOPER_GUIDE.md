# Developer Guide - Using Zetrix MCP Server

## For Developers: How to Use This MCP Server

This guide explains how to install and use the Zetrix MCP Server with Claude Desktop or any MCP-compatible client.

---

## What is This?

The **Zetrix MCP Server** gives you 42 powerful blockchain tools that you can use through natural language with Claude or other AI assistants. Instead of writing code to interact with the Zetrix blockchain, you can simply ask Claude to do it for you.

### What Can You Do?

- **Query blockchain data** - Get account balances, blocks, transactions
- **Monitor in real-time** - Subscribe to blockchain events via WebSocket
- **Manage accounts** - Create accounts, generate keypairs, sign transactions
- **Work with smart contracts** - Call contracts, get documentation, learn token standards
- **Handle cryptography** - Sign/verify messages, encrypt/decrypt keys

---

## Quick Start (5 Minutes)

### Step 1: Install the Package

```bash
npm install -g zetrix-mcp-server
```

That's it! The package is now installed globally on your system.

### Step 2: Configure Your MCP Client

#### For Claude Desktop Users:

1. **Find your Claude Desktop config file:**

   **Windows:**
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

   **macOS:**
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

   **Linux:**
   ```
   ~/.config/Claude/claude_desktop_config.json
   ```

2. **Add this configuration:**

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

   **For Testnet**, use:
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

   **For Both Networks:**
   ```json
   {
     "mcpServers": {
       "zetrix-mainnet": {
         "command": "npx",
         "args": ["-y", "zetrix-mcp-server"],
         "env": {
           "ZETRIX_NETWORK": "mainnet"
         }
       },
       "zetrix-testnet": {
         "command": "npx",
         "args": ["-y", "zetrix-mcp-server"],
         "env": {
           "ZETRIX_NETWORK": "testnet"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

   Completely quit and restart Claude Desktop.

### Step 3: Test It!

Open Claude Desktop and try these commands:

```
"What MCP tools do you have available?"
```

You should see 42 Zetrix tools listed!

Then try:
```
"Check if the Zetrix node is healthy"
"What's the latest block on Zetrix?"
"Generate a new Zetrix account for me"
```

---

## Available Tools (42 Total)

### 🌐 HTTP RPC Tools (13)

**Account Operations:**
- `zetrix_get_account` - Get account information
- `zetrix_get_balance` - Get account balance
- `zetrix_get_account_assets` - Get account assets/tokens
- `zetrix_get_account_metadata` - Get account metadata
- `zetrix_get_account_base` - Get account base info
- `zetrix_get_nonce` - Get account nonce

**Blockchain Data:**
- `zetrix_get_block` - Get block by number
- `zetrix_get_latest_block` - Get latest block
- `zetrix_get_ledger` - Get ledger info

**Transactions:**
- `zetrix_get_transaction` - Get transaction by hash
- `zetrix_get_transaction_history` - Get transaction history
- `zetrix_get_transaction_cache` - Get cached transactions

**Utilities:**
- `zetrix_check_health` - Check node health

### 📡 WebSocket Tools (10)

**Real-time Monitoring:**
- `zetrix_ws_connect` - Connect to WebSocket
- `zetrix_ws_submit_transaction` - Submit transaction via WebSocket
- `zetrix_ws_subscribe_tx` - Subscribe to address transactions
- `zetrix_ws_disconnect` - Disconnect from WebSocket
- `zetrix_ws_status` - Check WebSocket status

### 💼 SDK Tools (6)

**Account Management:**
- `zetrix_sdk_create_account` - Create new account with keypair
- `zetrix_sdk_get_balance` - Get balance via SDK
- `zetrix_sdk_is_activated` - Check if account is activated
- `zetrix_sdk_get_nonce` - Get nonce via SDK

**Smart Contracts:**
- `zetrix_sdk_call_contract` - Call contract (read-only)
- `zetrix_sdk_invoke_contract` - Invoke contract (write)

### 🔐 Crypto Tools (8)

**Key Management:**
- `zetrix_crypto_generate_keypair` - Generate Ed25519 keypair
- `zetrix_crypto_get_public_key` - Derive public key from private key
- `zetrix_crypto_get_address` - Derive address from public key

**Validation:**
- `zetrix_crypto_is_valid_private_key` - Validate private key
- `zetrix_crypto_is_valid_public_key` - Validate public key
- `zetrix_crypto_is_valid_address` - Validate Zetrix address

**Signing & Encryption:**
- `zetrix_crypto_sign` - Sign message with private key
- `zetrix_crypto_verify` - Verify signature
- `zetrix_crypto_encrypt_key` - Encrypt private key with password
- `zetrix_crypto_decrypt_key` - Decrypt private key

### 📄 Smart Contract Development Tools (5)

**Documentation:**
- `zetrix_contract_get_chain_functions` - Get Chain object functions
- `zetrix_contract_get_utils_functions` - Get Utils object functions
- `zetrix_contract_get_structure_guide` - Get contract structure guide
- `zetrix_contract_get_token_standard` - Get token standards (ZTP20/ZTP721/ZTP1155)
- `zetrix_contract_get_testing_guide` - Get testing framework guide

---

## Usage Examples

### Example 1: Check Account Balance

**You ask Claude:**
```
"What's the balance of address ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3?"
```

**Claude uses:** `zetrix_get_balance`

**Claude responds:**
```
The account has a balance of 1,000.000000 ZTX
```

### Example 2: Get Latest Block

**You ask Claude:**
```
"What's the latest block on Zetrix mainnet?"
```

**Claude uses:** `zetrix_get_latest_block`

**Claude responds:**
```
The latest block is #6,338,274 with 25 transactions.
Block hash: 7c5a2b8e9f...
Timestamp: 2025-11-29 14:30:15 UTC
```

### Example 3: Create New Account

**You ask Claude:**
```
"Generate a new Zetrix account for testing"
```

**Claude uses:** `zetrix_sdk_create_account`

**Claude responds:**
```
Created new Zetrix account:
Address: ZTX3XJRDLKgs9mZan2BNp79dopVmHwPo9J9AB
Public Key: b00179a65bef764c7e766fa7aecc5394...
Private Key: [safely displayed]

⚠️ Important: Save this private key securely!
```

### Example 4: Monitor Address in Real-time

**You ask Claude:**
```
"Connect to WebSocket and monitor address ZTX3Ta7... for new transactions"
```

**Claude uses:** `zetrix_ws_connect` → `zetrix_ws_subscribe_tx`

**Claude responds:**
```
✓ Connected to Zetrix WebSocket
✓ Subscribed to address ZTX3Ta7...
Now monitoring for transactions. I'll notify you when new transactions arrive.
```

### Example 5: Smart Contract Development Help

**You ask Claude:**
```
"Show me how to create a ZTP20 token contract on Zetrix"
```

**Claude uses:** `zetrix_contract_get_token_standard`

**Claude responds:**
```
Here's the ZTP20 token standard for Zetrix:

[Provides complete token contract template with functions like:
- init()
- transfer()
- approve()
- transferFrom()
- balanceOf()
- etc.]

Would you like me to explain any specific function?
```

---

## Configuration Options

### Environment Variables

You can customize the server with these environment variables:

```json
{
  "env": {
    "ZETRIX_NETWORK": "mainnet",           // or "testnet"
    "ZETRIX_RPC_URL": "https://...",       // optional custom HTTP RPC
    "ZETRIX_WS_URL": "ws://...:7053"       // optional custom WebSocket
  }
}
```

### Network URLs

**Mainnet:**
- HTTP: `https://node.zetrix.com`
- WebSocket: `ws://node-ws.zetrix.com`

**Testnet:**
- HTTP: `https://test-node.zetrix.com`
- WebSocket: `ws://test-node-ws.zetrix.com`

---

## Advanced Usage

### Using with Other MCP Clients

The Zetrix MCP Server works with any MCP-compatible client, not just Claude Desktop.

**Generic configuration:**
```json
{
  "command": "npx",
  "args": ["-y", "zetrix-mcp-server"],
  "env": {
    "ZETRIX_NETWORK": "mainnet"
  }
}
```

### Running Locally

If you want to run the server directly:

```bash
# Clone the repo
git clone https://github.com/Zetrix-Chain/zetrix-mcp-server.git
cd zetrix-mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

Then configure your MCP client to use the local path:
```json
{
  "command": "node",
  "args": ["/path/to/zetrix-mcp-server/dist/index.js"]
}
```

---

## Troubleshooting

### Tools Don't Appear

**Solution:**
1. Make sure the package is installed: `npm list -g zetrix-mcp-server`
2. Check your config file path is correct
3. Restart your MCP client completely
4. Check client logs for errors

### Connection Errors

**Solution:**
1. Check your internet connection
2. Verify the network is set correctly (mainnet/testnet)
3. Try the health check: "Check if the Zetrix node is healthy"

### Package Not Found

**Solution:**
```bash
# Reinstall the package
npm uninstall -g zetrix-mcp-server
npm install -g zetrix-mcp-server
```

### WebSocket Issues

**Solution:**
1. Check firewall settings (port 7053)
2. Try using HTTP-only tools first
3. Verify WebSocket URL is correct

---

## Development Workflows

### For DApp Developers

Use Claude to:
- Query blockchain data for your DApp
- Test smart contract interactions
- Generate test accounts
- Monitor transaction confirmations

**Example:**
```
"Create 5 test accounts for my DApp and show me their addresses"
"Call the balanceOf function on contract ZTX... for address ZTX..."
```

### For Smart Contract Developers

Use Claude to:
- Get documentation on Chain/Utils functions
- Learn token standards
- Get testing examples

**Example:**
```
"Show me all available Chain functions for smart contracts"
"How do I use Chain.store and Chain.load in my contract?"
"Give me a ZTP721 NFT contract template"
```

### For Blockchain Analysts

Use Claude to:
- Query historical data
- Monitor addresses
- Analyze transactions

**Example:**
```
"Get the last 10 transactions for address ZTX..."
"What was the block at height 1000000?"
"Subscribe to address ZTX... and alert me of any transactions"
```

---

## Best Practices

### Security

1. **Never share private keys** - When Claude shows private keys, save them securely
2. **Use testnet first** - Test with testnet before using mainnet
3. **Validate addresses** - Use the validation tools before sending transactions

### Performance

1. **Use appropriate tools** - HTTP for queries, WebSocket for monitoring
2. **Close WebSocket connections** - Disconnect when done monitoring
3. **Batch requests** - Ask Claude to do multiple related queries at once

### Development

1. **Start with examples** - Try the example queries first
2. **Check documentation** - Use the contract documentation tools
3. **Test incrementally** - Test each step before moving forward

---

## Getting Help

### Documentation

- **Complete API Reference:** See `README.md` in the repo
- **Quick Start:** See `docs/QUICKSTART.md`
- **Usage Examples:** See `docs/EXAMPLES.md`
- **Smart Contract Guide:** See `docs/SMART_CONTRACT_DEVELOPMENT.md`

### Support

- **GitHub Issues:** https://github.com/Zetrix-Chain/zetrix-mcp-server/issues
- **npm Package:** https://www.npmjs.com/package/zetrix-mcp-server
- **Repository:** https://github.com/Zetrix-Chain/zetrix-mcp-server

### Community

- Share your use cases
- Report bugs or issues
- Suggest new features
- Contribute improvements

---

## What to Tell Your Developers

**Simple version:**

> "We have a Zetrix MCP Server that lets you interact with the Zetrix blockchain using natural language through Claude.
>
> Install it with: `npm install -g zetrix-mcp-server`
>
> Then configure Claude Desktop (instructions in DEVELOPER_GUIDE.md) and you can ask Claude things like:
> - 'Get the balance for this address'
> - 'Create a test account'
> - 'Show me the ZTP20 token standard'
>
> No need to write blockchain integration code - just talk to Claude!"

---

## Quick Reference Card

```
📦 Installation:     npm install -g zetrix-mcp-server
🔧 Config Location:  ~/.config/Claude/claude_desktop_config.json (Linux)
                     ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
                     %APPDATA%\Claude\claude_desktop_config.json (Windows)
🌐 Networks:         mainnet | testnet
🔨 Tools Available:  42 (HTTP RPC, WebSocket, SDK, Crypto, Contracts)
📚 Documentation:    README.md, docs/QUICKSTART.md, docs/EXAMPLES.md
💬 Support:          GitHub Issues
```

---

## Next Steps

1. ✅ Install the package
2. ✅ Configure your MCP client
3. ✅ Restart the client
4. ✅ Test with: "What MCP tools do you have?"
5. ✅ Start building!

**Happy coding! 🚀**
