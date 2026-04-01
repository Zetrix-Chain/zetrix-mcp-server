# How to Use Zetrix MCP Server

## For Your Developers - Quick Instructions

### What Is This?

A tool that lets you interact with Zetrix blockchain using natural language through Claude AI. No need to write code - just ask Claude!

---

## Installation (2 Steps)

### Step 1: Install the Package

```bash
npm install -g zetrix-mcp-server
```

### Step 2: Configure Claude Desktop

1. **Open your Claude Desktop config file:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

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

3. **Restart Claude Desktop**

---

## Usage

Open Claude Desktop and start asking questions:

```
"What MCP tools do you have available?"
```

```
"Check if the Zetrix node is healthy"
```

```
"What's the balance of address ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3?"
```

```
"Generate a new Zetrix test account"
```

```
"What's the latest block on Zetrix?"
```

```
"Show me how to create a ZTP20 token contract"
```

---

## What You Can Do (42 Tools)

✅ **Query blockchain** - Get balances, blocks, transactions
✅ **Monitor real-time** - Subscribe to blockchain events
✅ **Manage accounts** - Create accounts, generate keypairs
✅ **Smart contracts** - Call contracts, get documentation
✅ **Cryptography** - Sign/verify, encrypt/decrypt keys

---

## Networks

**Mainnet** (default):
```json
"ZETRIX_NETWORK": "mainnet"
```

**Testnet**:
```json
"ZETRIX_NETWORK": "testnet"
```

**Both** (run two servers):
```json
{
  "mcpServers": {
    "zetrix-mainnet": {
      "command": "npx",
      "args": ["-y", "zetrix-mcp-server"],
      "env": {"ZETRIX_NETWORK": "mainnet"}
    },
    "zetrix-testnet": {
      "command": "npx",
      "args": ["-y", "zetrix-mcp-server"],
      "env": {"ZETRIX_NETWORK": "testnet"}
    }
  }
}
```

---

## Troubleshooting

**Tools don't appear?**
- Verify config file location
- Restart Claude Desktop completely
- Check: `npm list -g zetrix-mcp-server`

**Package not found?**
```bash
npm uninstall -g zetrix-mcp-server
npm install -g zetrix-mcp-server
```

---

## More Information

- **Full Documentation:** `DEVELOPER_GUIDE.md`
- **Quick Start:** `docs/QUICKSTART.md`
- **Examples:** `docs/EXAMPLES.md`
- **Smart Contracts:** `docs/SMART_CONTRACT_DEVELOPMENT.md`
- **GitHub:** https://github.com/Zetrix-Chain/zetrix-mcp-server
- **npm:** https://www.npmjs.com/package/zetrix-mcp-server

---

## That's It!

You can now use Claude to interact with Zetrix blockchain through natural language. No coding required!
