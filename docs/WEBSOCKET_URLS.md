# Zetrix WebSocket URLs - Official Configuration

## ✅ Official WebSocket URLs

The Zetrix MCP server is configured with the official WebSocket endpoints:

### Mainnet
```
ws://node-ws.zetrix.com
```

### Testnet
```
ws://test-node-ws.zetrix.com
```

## Current Configuration

The WebSocket URLs are configured in `src/index.ts`:

```typescript
const WS_NETWORK_URLS: Record<ZetrixNetwork, string> = {
  mainnet: "ws://node-ws.zetrix.com",
  testnet: "ws://test-node-ws.zetrix.com",
};
```

## How WebSocket URLs Are Selected

The server automatically selects the correct WebSocket URL based on your network configuration:

1. **If you set `ZETRIX_WS_URL`:** Uses that URL (overrides everything)
2. **If you set `ZETRIX_NETWORK=mainnet`:** Uses `ws://node-ws.zetrix.com`
3. **If you set `ZETRIX_NETWORK=testnet`:** Uses `ws://test-node-ws.zetrix.com`
4. **Default:** Uses mainnet URL

## Configuration Examples

### Option 1: Use Default Network URLs

**Mainnet:**
```json
{
  "mcpServers": {
    "zetrix": {
      "command": "node",
      "args": ["D:\\Projects\\mcp\\zetrix\\dist\\index.js"],
      "env": {
        "ZETRIX_NETWORK": "mainnet"
      }
    }
  }
}
```
Uses: `ws://node-ws.zetrix.com`

**Testnet:**
```json
{
  "mcpServers": {
    "zetrix": {
      "command": "node",
      "args": ["D:\\Projects\\mcp\\zetrix\\dist\\index.js"],
      "env": {
        "ZETRIX_NETWORK": "testnet"
      }
    }
  }
}
```
Uses: `ws://test-node-ws.zetrix.com`

### Option 2: Custom WebSocket URL

If you need to use a custom WebSocket server:

```json
{
  "mcpServers": {
    "zetrix": {
      "command": "node",
      "args": ["D:\\Projects\\mcp\\zetrix\\dist\\index.js"],
      "env": {
        "ZETRIX_NETWORK": "mainnet",
        "ZETRIX_WS_URL": "ws://your-custom-ws-server.com:port"
      }
    }
  }
}
```

## WebSocket Features

All WebSocket features work with these URLs:

✅ **zetrix_ws_connect** - Connect and register for real-time updates
✅ **zetrix_ws_submit_transaction** - Submit transaction with real-time status
✅ **zetrix_ws_subscribe_tx** - Subscribe to address transaction notifications
✅ **zetrix_ws_disconnect** - Gracefully disconnect
✅ **zetrix_ws_status** - Check connection status

## Testing WebSocket Connection

To verify the WebSocket connection works:

### In Claude Desktop

After setting up, ask Claude:
```
Connect to Zetrix WebSocket
```

Claude will use `zetrix_ws_connect` and report the connection status.

### Manual Test

```javascript
import WebSocket from 'ws';

const url = 'ws://node-ws.zetrix.com';
const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('✓ Connected to', url);
  ws.send(JSON.stringify({
    type: 0,  // CHAIN_HELLO
    api_list: [7, 8, 16, 17, 18],
    timestamp: Date.now()
  }));
});

ws.on('message', (data) => {
  console.log('✓ Response:', JSON.parse(data.toString()));
  ws.close();
});

ws.on('error', (err) => {
  console.error('✗ Error:', err.message);
});
```

## Network Information

| Network | HTTP RPC | WebSocket |
|---------|----------|-----------|
| **Mainnet** | https://node.zetrix.com | ws://node-ws.zetrix.com |
| **Testnet** | https://test-node.zetrix.com | ws://test-node-ws.zetrix.com |

## Changing WebSocket URLs

If you need to update the WebSocket URLs in the future:

### Method 1: Environment Variable (No rebuild needed)

Update your Claude Desktop config:
```json
{
  "env": {
    "ZETRIX_WS_URL": "ws://new-url.zetrix.com"
  }
}
```

### Method 2: Edit Source Code (Requires rebuild)

1. Edit `src/index.ts`
2. Change the URLs in `WS_NETWORK_URLS`
3. Run `npm run build`
4. Restart Claude Desktop

## Troubleshooting

### "ENOTFOUND" Error

If you get DNS resolution errors:
- ✅ Check spelling of the URL
- ✅ Verify you have internet connection
- ✅ Try accessing the HTTP endpoint first to verify network
- ✅ Contact Zetrix support if domain doesn't resolve

### Connection Timeout

If connection times out:
- ✅ Check firewall settings
- ✅ Verify port isn't blocked
- ✅ Try from different network
- ✅ Check with Zetrix team if service is online

### SSL/TLS Errors

Currently using `ws://` (unencrypted). If you need secure:
- Use `wss://` instead of `ws://`
- Verify Zetrix supports secure WebSocket
- May need to configure certificates

## WebSocket Protocol Details

The Zetrix WebSocket uses these message types:

- **CHAIN_HELLO (0)** - Registration and version info
- **CHAIN_SUBMITTRANSACTION (7)** - Submit transactions
- **CHAIN_SUBSCRIBE_TX (8)** - Subscribe to transaction notifications
- **CHAIN_LEDGER_HEADER (16)** - Ledger close notifications
- **CHAIN_TX_STATUS (17)** - Transaction status updates
- **CHAIN_TX_ENV_STORE (18)** - Transaction execution results

All of these are supported by the MCP server!

## Summary

✅ **Mainnet WebSocket:** `ws://node-ws.zetrix.com`
✅ **Testnet WebSocket:** `ws://test-node-ws.zetrix.com`
✅ **Configuration:** Automatic based on `ZETRIX_NETWORK`
✅ **Override:** Use `ZETRIX_WS_URL` environment variable
✅ **Features:** All 5 WebSocket tools available

The server is ready to use with the correct official Zetrix WebSocket endpoints!
