# MCP Server Configuration Files

This directory contains pre-configured setup files for running the Zetrix MCP server with different network configurations on Windows, macOS, and Linux.

## Available Configurations

All configurations are available for three operating systems:
- **Windows**: Uses Windows-style paths (e.g., `C:\Users\username\...`)
- **macOS**: Uses macOS-style paths (e.g., `/Users/username/...`)
- **Linux**: Uses Linux-style paths (e.g., `/home/username/...`)

### Network Options

1. **Mainnet Only** (`*-mainnet.json`)
   - Connects to Zetrix Mainnet only
   - **HTTP RPC:** https://node.zetrix.com
   - **WebSocket:** ws://node-ws.zetrix.com

2. **Testnet Only** (`*-testnet.json`)
   - Connects to Zetrix Testnet only
   - **HTTP RPC:** https://test-node.zetrix.com
   - **WebSocket:** ws://test-node-ws.zetrix.com

3. **Both Networks** (`*-both.json`)
   - Connects to both Mainnet and Testnet simultaneously
   - Useful for development and testing
   - Both networks available in the same session

## Configuration Files

### Windows
- `mcp-config-windows-mainnet.json` - Mainnet only
- `mcp-config-windows-testnet.json` - Testnet only
- `mcp-config-windows-both.json` - Both networks

### macOS
- `mcp-config-macos-mainnet.json` - Mainnet only
- `mcp-config-macos-testnet.json` - Testnet only
- `mcp-config-macos-both.json` - Both networks

### Linux
- `mcp-config-linux-mainnet.json` - Mainnet only
- `mcp-config-linux-testnet.json` - Testnet only
- `mcp-config-linux-both.json` - Both networks

## Installation Instructions

### Windows

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Locate your MCP client config file:**

   For **Claude Desktop**:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```
   Full path is usually:
   ```
   C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json
   ```

   For **other MCP clients**: Check your client's documentation for config file location.

3. **Choose and copy a configuration:**
   - For Mainnet: Open `mcp-config-windows-mainnet.json`
   - For Testnet: Open `mcp-config-windows-testnet.json`
   - For Both: Open `mcp-config-windows-both.json`

4. **Update the path:**
   Edit the `args` field to match where you cloned this repo:
   ```json
   "args": [
     "C:\\path\\to\\zetrix\\dist\\index.js"
   ]
   ```
   Replace `C:\\path\\to\\zetrix` with your actual installation path.

   **Note**: Use double backslashes `\\` or forward slashes `/` in paths.

5. **Apply the configuration:**
   - Copy the entire contents of the config file
   - Paste into your MCP client's config file
   - If you already have other MCP servers configured, merge the `mcpServers` section
   - Save the file

6. **Restart your MCP client:**
   - Completely quit the application
   - Start it again

### macOS

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Locate your MCP client config file:**

   For **Claude Desktop**:
   ```bash
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

   For **other MCP clients**: Check your client's documentation for config file location.

3. **Choose and copy a configuration:**
   - For Mainnet: Open `mcp-config-macos-mainnet.json`
   - For Testnet: Open `mcp-config-macos-testnet.json`
   - For Both: Open `mcp-config-macos-both.json`

4. **Update the path:**
   Edit the `args` field to match where you cloned this repo:
   ```json
   "args": [
     "/Users/username/zetrix/dist/index.js"
   ]
   ```
   Replace `/Users/username/zetrix` with your actual installation path.

5. **Apply and restart** (same as Windows steps 5-6)

### Linux

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Locate your MCP client config file:**

   For **Claude Desktop**:
   ```bash
   ~/.config/Claude/claude_desktop_config.json
   ```

   For **other MCP clients**: Check your client's documentation for config file location.

3. **Choose and copy a configuration:**
   - For Mainnet: Open `mcp-config-linux-mainnet.json`
   - For Testnet: Open `mcp-config-linux-testnet.json`
   - For Both: Open `mcp-config-linux-both.json`

4. **Update the path:**
   Edit the `args` field to match where you cloned this repo:
   ```json
   "args": [
     "/home/username/zetrix/dist/index.js"
   ]
   ```
   Replace `/home/username/zetrix` with your actual installation path.

5. **Apply and restart** (same as Windows steps 5-6)

## Verification

After restarting your MCP client (e.g., Claude Desktop):

1. Open a new conversation
2. Look for the tools/MCP indicator in the interface
3. For Claude Desktop: Ask "What MCP tools do you have available?"
4. You should see all 42 Zetrix tools listed:
   - 13 HTTP RPC tools (account, block, transaction, contract queries)
   - 10 WebSocket tools (real-time blockchain monitoring)
   - 6 SDK tools (account creation, balance, contract operations)
   - 8 Crypto tools (key generation, signing, encryption)
   - 5 Contract development tools (documentation for Chain/Utils functions, token standards)

## Troubleshooting

### Tools don't appear

1. **Check the config file syntax:**
   - Must be valid JSON
   - Use double quotes for strings
   - Check for missing commas

2. **Verify the path:**
   - Use absolute paths (full path from root)
   - Windows: Use double backslashes `\\` or forward slashes `/`
   - Unix/Mac: Use forward slashes `/`

3. **Check Node.js:**
   ```bash
   node --version
   ```
   Should show v18 or higher

4. **Check the build:**
   ```bash
   cd /path/to/zetrix
   npm run build
   ```

5. **Run tests:**
   ```bash
   npm test
   npm run test:sdk
   npm run test:encryption
   ```

6. **View logs:**
   In Claude Desktop: Help → Debug → View Logs
   For other MCP clients: Check your client's documentation for log locations

### Custom RPC/WebSocket URLs

If you're running your own Zetrix node, modify the config:

```json
{
  "mcpServers": {
    "zetrix-custom": {
      "command": "node",
      "args": [
        "/path/to/zetrix/dist/index.js"
      ],
      "env": {
        "ZETRIX_RPC_URL": "https://your-node.example.com",
        "ZETRIX_WS_URL": "ws://your-node.example.com:7053"
      }
    }
  }
}
```

## Advanced: Multiple Configurations

You can run multiple MCP servers simultaneously:

```json
{
  "mcpServers": {
    "zetrix-mainnet": {
      "command": "node",
      "args": ["/path/to/zetrix/dist/index.js"],
      "env": {"ZETRIX_NETWORK": "mainnet"}
    },
    "zetrix-testnet": {
      "command": "node",
      "args": ["/path/to/zetrix/dist/index.js"],
      "env": {"ZETRIX_NETWORK": "testnet"}
    },
    "other-mcp-server": {
      "command": "npx",
      "args": ["-y", "other-server"]
    }
  }
}
```

## Next Steps

Once configured:
1. Read `../docs/EXAMPLES.md` for usage examples
2. Read `../docs/SMART_CONTRACT_DEVELOPMENT.md` for smart contract development guide
3. Run `npm test` to verify everything works
4. Start using the Zetrix MCP server with your MCP client!

## Support

If you encounter issues:
1. Check the logs (Help → Debug → View Logs in Claude Desktop, or your MCP client's log location)
2. Run the test scripts:
   ```bash
   npm test
   npm run test:sdk
   npm run test:encryption
   ```
3. Check the build output:
   ```bash
   npm run build
   ```
4. Review the main documentation in `../README.md`
