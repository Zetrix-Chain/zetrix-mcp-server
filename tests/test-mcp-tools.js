#!/usr/bin/env node
/**
 * Test MCP Server - Verify tools are available
 */

import { spawn } from 'child_process';

console.log('Testing Zetrix MCP Server...\n');

// Start the MCP server
const server = spawn('node', ['dist/index.js'], {
  env: { ...process.env, ZETRIX_NETWORK: 'mainnet' }
});

let output = '';
let hasError = false;

// Send MCP list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdout.on('data', (data) => {
  output += data.toString();

  // Try to parse complete JSON-RPC messages
  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.trim().startsWith('{')) {
      try {
        const response = JSON.parse(line);
        if (response.result && response.result.tools) {
          console.log(`✅ MCP Server is working!\n`);
          console.log(`📊 Tools Available: ${response.result.tools.length}\n`);

          // Group tools by category
          const categories = {};
          response.result.tools.forEach(tool => {
            const prefix = tool.name.split('_')[1]; // zetrix_http_* -> http
            if (!categories[prefix]) categories[prefix] = [];
            categories[prefix].push(tool.name);
          });

          console.log('Categories:');
          Object.keys(categories).forEach(cat => {
            console.log(`  ${cat}: ${categories[cat].length} tools`);
          });

          console.log('\n✅ All tools loaded successfully!');
          server.kill();
          process.exit(0);
        }
      } catch (e) {
        // Not complete JSON yet
      }
    }
  });
});

server.stderr.on('data', (data) => {
  console.error('❌ Error:', data.toString());
  hasError = true;
});

server.on('close', (code) => {
  if (hasError) {
    console.error('\n❌ Server failed to start properly');
    process.exit(1);
  }
});

// Send the request after a short delay
setTimeout(() => {
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Test timed out - server may not be responding');
  server.kill();
  process.exit(1);
}, 10000);
