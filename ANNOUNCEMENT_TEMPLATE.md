# Announcement Template

Use this template to announce the Zetrix MCP Server to your developers.

---

## Email/Slack Template

```
Subject: 🚀 New Tool: Zetrix MCP Server - Interact with Blockchain via Claude AI

Hi Team,

We've just launched a new tool that makes blockchain development much easier!

🎯 What is it?
The Zetrix MCP Server lets you interact with the Zetrix blockchain using natural language through Claude AI - no need to write blockchain integration code!

💡 What can you do?
- Query account balances, blocks, and transactions
- Create and manage accounts
- Monitor blockchain events in real-time
- Call smart contracts
- Get smart contract development help
- Sign/verify messages, encrypt/decrypt keys

Just ask Claude in plain English!

⚡ Quick Start (2 minutes):

1. Install:
   npm install -g zetrix-mcp-server

2. Configure Claude Desktop - add this to your config file:
   {
     "mcpServers": {
       "zetrix": {
         "command": "npx",
         "args": ["-y", "zetrix-mcp-server"],
         "env": {"ZETRIX_NETWORK": "mainnet"}
       }
     }
   }

3. Restart Claude Desktop and try:
   "What's the latest block on Zetrix?"
   "Create a test account for me"
   "Show me how to create a ZTP20 token"

📚 Documentation:
- Quick Guide: HOW_TO_USE.md
- Full Guide: DEVELOPER_GUIDE.md
- GitHub: https://github.com/Zetrix-Chain/zetrix-mcp-server
- npm: https://www.npmjs.com/package/zetrix-mcp-server

❓ Questions?
Check the guides or reach out to [your contact info]

Happy coding! 🚀

```

---

## Short Version (Chat/Slack)

```
🚀 New tool alert!

We now have a Zetrix MCP Server that lets you interact with Zetrix blockchain through Claude AI.

Install: npm install -g zetrix-mcp-server
Docs: https://github.com/Zetrix-Chain/zetrix-mcp-server

No more writing blockchain integration code - just ask Claude!

Try asking:
- "Get balance for address ZTX..."
- "Create a test account"
- "Show me the latest block"

Check HOW_TO_USE.md for setup instructions.
```

---

## Internal Documentation Link

```
📖 Zetrix MCP Server Documentation

Quick Start: /docs/zetrix-mcp-server/HOW_TO_USE.md
Full Guide: /docs/zetrix-mcp-server/DEVELOPER_GUIDE.md
Examples: /docs/zetrix-mcp-server/docs/EXAMPLES.md

Package: https://www.npmjs.com/package/zetrix-mcp-server
Source: https://github.com/Zetrix-Chain/zetrix-mcp-server
```

---

## Team Meeting Presentation (Speaking Points)

```
1. Introduction (1 min)
   - "We've built an MCP server for Zetrix blockchain"
   - "Lets you use Claude AI to interact with blockchain"
   - "42 tools available for various blockchain operations"

2. Demo (2 min)
   - Show Claude Desktop with MCP configured
   - Ask: "What's the latest block on Zetrix?"
   - Ask: "Create a test account"
   - Ask: "Show me ZTP20 token standard"

3. Benefits (1 min)
   - No need to write blockchain integration code
   - Natural language interface
   - Faster development
   - Great for learning and prototyping

4. How to Use (1 min)
   - Install: npm install -g zetrix-mcp-server
   - Configure Claude Desktop (show config)
   - Restart and start using
   - Full docs in repo

5. Q&A
```

---

## README Section to Add to Your Main Docs

```markdown
## Zetrix MCP Server

We provide an official MCP (Model Context Protocol) server for interacting with the Zetrix blockchain through AI assistants like Claude.

### Features
- 42 blockchain tools accessible via natural language
- HTTP RPC, WebSocket, SDK, Crypto, and Smart Contract tools
- Support for Mainnet and Testnet
- Cross-platform (Windows, macOS, Linux)

### Installation
```bash
npm install -g zetrix-mcp-server
```

### Quick Start
Configure your MCP client (e.g., Claude Desktop) with:
```json
{
  "mcpServers": {
    "zetrix": {
      "command": "npx",
      "args": ["-y", "zetrix-mcp-server"],
      "env": {"ZETRIX_NETWORK": "mainnet"}
    }
  }
}
```

### Documentation
- [How to Use](https://github.com/Zetrix-Chain/zetrix-mcp-server/blob/master/HOW_TO_USE.md)
- [Developer Guide](https://github.com/Zetrix-Chain/zetrix-mcp-server/blob/master/DEVELOPER_GUIDE.md)
- [Full Documentation](https://github.com/Zetrix-Chain/zetrix-mcp-server)
- [npm Package](https://www.npmjs.com/package/zetrix-mcp-server)
```

---

## Social Media Posts

### Twitter/X

```
🚀 Announcing Zetrix MCP Server!

Interact with #Zetrix blockchain using natural language through @AnthropicAI Claude.

42 tools for:
✅ Account queries
✅ Real-time monitoring
✅ Smart contracts
✅ Cryptography

Install: npm i -g zetrix-mcp-server

Docs: https://github.com/Zetrix-Chain/zetrix-mcp-server

#Web3 #AI #Blockchain #MCP
```

### LinkedIn

```
Excited to announce the Zetrix MCP Server! 🚀

We've built a Model Context Protocol server that enables developers to interact with the Zetrix blockchain using natural language through AI assistants like Claude.

What makes this special:
• 42 specialized blockchain tools
• No code needed - just natural language
• Real-time monitoring capabilities
• Complete smart contract development support
• Cross-platform support

Perfect for:
👨‍💻 DApp developers
🔐 Smart contract developers
📊 Blockchain analysts
🎓 Students learning Web3

Get started in 2 minutes:
npm install -g zetrix-mcp-server

Check it out:
📦 https://www.npmjs.com/package/zetrix-mcp-server
💻 https://github.com/Zetrix-Chain/zetrix-mcp-server

#Blockchain #AI #Web3 #Development #Zetrix
```

---

## FAQ for Developers

**Q: Do I need to know how to code to use this?**
A: No! Just install it, configure Claude Desktop, and ask questions in natural language.

**Q: What can I do with it?**
A: Query blockchain data, create accounts, monitor transactions, call smart contracts, get development help, and more - 42 tools total.

**Q: Does it work with testnet?**
A: Yes! Just set `ZETRIX_NETWORK: "testnet"` in your config.

**Q: Can I use it with other MCP clients besides Claude?**
A: Yes! It works with any MCP-compatible client.

**Q: Is it free?**
A: Yes! Open source under MIT license.

**Q: How do I get help?**
A: Check the documentation files or open an issue on GitHub.

**Q: Can I contribute?**
A: Absolutely! Pull requests welcome on GitHub.

---

Use these templates to announce the tool to your team!
