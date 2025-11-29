# Zetrix MCP Server - Quick Start Guide

Get up and running with the Zetrix MCP server in Claude Desktop in just 5 minutes!

## Prerequisites

- **Node.js** v18 or higher ([Download here](https://nodejs.org/))
- **Claude Desktop** installed ([Download here](https://claude.ai/download))
- **Git** (optional, for cloning)

---

## Option 1: Automatic Setup (Recommended) ⚡

### Step 1: Install Dependencies

```bash
cd /mnt/d/Projects/mcp/zetrix
npm install
```

### Step 2: Build the Server

```bash
npm run build
```

### Step 3: Run Setup Wizard

```bash
npm run setup
```

The wizard will:
- ✅ Verify installation
- ✅ Locate Claude Desktop config
- ✅ Ask which network you want (Mainnet/Testnet/Both)
- ✅ Update configuration automatically
- ✅ Optionally run tests

### Step 4: Restart Claude Desktop

Completely quit and restart Claude Desktop.

### Step 5: Verify

In Claude Desktop, ask:
> "What MCP tools do you have available?"

You should see 24 Zetrix tools! ✨

---

## Option 2: Manual Setup 🔧

### Step 1: Install & Build

```bash
cd /mnt/d/Projects/mcp/zetrix
npm install
npm run build
```

### Step 2: Find Claude Config File

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

### Step 3: Edit Config File

Choose one of the pre-made configs from the `configs/` folder based on your operating system:

#### For Mainnet:
```bash
# Windows: configs/mcp-config-windows-mainnet.json
# macOS:   configs/mcp-config-macos-mainnet.json
# Linux:   configs/mcp-config-linux-mainnet.json
```

#### For Testnet:
```bash
# Windows: configs/mcp-config-windows-testnet.json
# macOS:   configs/mcp-config-macos-testnet.json
# Linux:   configs/mcp-config-linux-testnet.json
```

#### For Both:
```bash
# Windows: configs/mcp-config-windows-both.json
# macOS:   configs/mcp-config-macos-both.json
# Linux:   configs/mcp-config-linux-both.json
```

**Important:** Update the path in the config to match your installation:

```json
{
  "mcpServers": {
    "zetrix-mainnet": {
      "command": "node",
      "args": [
        "D:\\Projects\\mcp\\zetrix\\dist\\index.js"  // <- Change this!
      ],
      "env": {
        "ZETRIX_NETWORK": "mainnet"
      }
    }
  }
}
```

### Step 4: Restart Claude Desktop

Quit completely and restart.

### Step 5: Test

Ask Claude:
> "Check if the Zetrix node is healthy"

---

## Testing Your Installation

### Run All Tests

```bash
npm test
```

### Test Specific Networks

```bash
# Test mainnet
npm run test:mainnet

# Test testnet
npm run test:testnet
```

### Manual Testing

```bash
# Run the server directly (it should wait for input)
npm run dev
```

You should see:
```
Zetrix MCP Server running on stdio
```

Press `Ctrl+C` to exit.

---

## Quick Examples

Once configured, try these in Claude Desktop:

### 1. Check Node Health
> "Is the Zetrix node healthy?"

### 2. Get Latest Block
> "What's the latest block on Zetrix?"

### 3. Check Balance
> "What's the balance of address ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3?"

### 4. Generate Test Keypair
> "Generate a new Zetrix test keypair"

### 5. WebSocket Connection
> "Connect to Zetrix WebSocket and show me the blockchain version"

---

## Configuration Options

### Environment Variables

You can set these in the Claude config `env` field:

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

## Troubleshooting

### Issue: Tools don't appear in Claude

**Solution:**
1. Check the config file path is correct
2. Verify the server path in `args` is absolute and correct
3. Check Claude Desktop logs: Help → Debug → View Logs
4. Try manually running: `npm run dev`

### Issue: "Cannot find module" error

**Solution:**
```bash
npm run build
```

### Issue: WebSocket connection fails

**Solution:**
1. Check firewall settings (port 7053)
2. Verify network connectivity
3. Try HTTP-only operations first

### Issue: Node.js not found

**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Then verify:
node --version  # Should be v18+
```

---

## What's Available?

### 24 MCP Tools Total

**Account Operations (6):**
- ✓ Get account info
- ✓ Get balance
- ✓ Get assets
- ✓ Get metadata
- ✓ Generate keypairs
- ✓ Get account base

**Block & Ledger (3):**
- ✓ Get block
- ✓ Get latest block
- ✓ Get ledger info

**Transactions (6):**
- ✓ Get transaction
- ✓ Transaction history
- ✓ Transaction cache
- ✓ Create transaction blob
- ✓ Submit transaction
- ✓ Test transaction fees

**Smart Contracts (1):**
- ✓ Call contract (sandbox)

**Utilities (3):**
- ✓ Health check
- ✓ Multi-query
- ✓ Get transaction (legacy)

**WebSocket (5):**
- ✓ Connect
- ✓ Submit transaction
- ✓ Subscribe to addresses
- ✓ Disconnect
- ✓ Check status

---

## Next Steps

1. ✅ **Read EXAMPLES.md** - Learn how to use all features
2. ✅ **Check configs/README.md** - Advanced configuration options
3. ✅ **Explore the docs** - Full API documentation in README.md

---

## Getting Help

### Check Logs

**Claude Desktop Logs:**
Help → Debug → View Logs

**Server Output:**
```bash
npm run dev
# Then type something and press Enter to see if it responds
```

### Run Diagnostics

```bash
# Test the server
npm test

# Check if everything is built
ls dist/  # Should see index.js and other files
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tools not showing | Restart Claude Desktop completely |
| "Module not found" | Run `npm install && npm run build` |
| Test failures | Check network connectivity |
| WebSocket errors | Firewall blocking port 7053 |

---

## Support

- **Documentation:** README.md
- **Examples:** EXAMPLES.md
- **Config Help:** configs/README.md
- **Test Script:** `npm test`
- **Setup Wizard:** `npm run setup`

---

## Success Checklist

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Server built (`npm run build`)
- [ ] Config file updated
- [ ] Claude Desktop restarted
- [ ] Tools visible in Claude (🔨 icon)
- [ ] Tests passing (`npm test`)

Once all checked, you're ready to explore Zetrix with Claude! 🚀

---

## Quick Commands Reference

```bash
npm install           # Install dependencies
npm run build        # Build the server
npm run setup        # Run setup wizard
npm test             # Test everything
npm run dev          # Run server manually
npm run test:mainnet # Test mainnet only
npm run test:testnet # Test testnet only
```

---

Happy exploring! 🎉
