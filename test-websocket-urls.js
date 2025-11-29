#!/usr/bin/env node

/**
 * Test Zetrix WebSocket URLs
 * Compares old and new URL formats
 */

import { ZetrixWebSocketClient } from './dist/zetrix-websocket.js';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${COLORS.reset} ${message}`);
}

function success(message) {
  log(COLORS.green, '✓', message);
}

function error(message) {
  log(COLORS.red, '✗', message);
}

function info(message) {
  log(COLORS.blue, 'ℹ', message);
}

function section(message) {
  console.log(`\n${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}`);
  console.log(`${COLORS.cyan}${message}${COLORS.reset}`);
  console.log(`${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}\n`);
}

async function testWebSocketURL(url, name) {
  info(`Testing: ${url}`);

  const client = new ZetrixWebSocketClient(url);

  try {
    const response = await Promise.race([
      client.registerAndConnect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);

    success(`${name} - Connected successfully!`);
    console.log(`  Blockchain version: ${response.buchain_version}`);
    console.log(`  Ledger version: ${response.ledger_version}`);
    console.log(`  Node address: ${response.self_addr}`);

    client.disconnect();
    return { success: true, url, name, response };
  } catch (err) {
    error(`${name} - Failed: ${err.message}`);
    client.disconnect();
    return { success: false, url, name, error: err.message };
  }
}

async function main() {
  console.log(`${COLORS.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║      Zetrix WebSocket URL Comparison Test                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}`);

  const tests = [
    // Old URLs
    { url: 'ws://node.zetrix.com:7053', name: 'Mainnet (OLD - node.zetrix.com:7053)' },
    { url: 'ws://test-node.zetrix.com:7053', name: 'Testnet (OLD - test-node.zetrix.com:7053)' },

    // New URLs with default port
    { url: 'ws://node-ws.zetrix.com', name: 'Mainnet (NEW - node-ws.zetrix.com)' },
    { url: 'ws://test-node-ws.zetrix.com', name: 'Testnet (NEW - test-node-ws.zetrix.com)' },

    // New URLs with explicit port 7053
    { url: 'ws://node-ws.zetrix.com:7053', name: 'Mainnet (NEW - node-ws.zetrix.com:7053)' },
    { url: 'ws://test-node-ws.zetrix.com:7053', name: 'Testnet (NEW - test-node-ws.zetrix.com:7053)' },

    // New URLs with port 80 (default WS)
    { url: 'ws://node-ws.zetrix.com:80', name: 'Mainnet (NEW - node-ws.zetrix.com:80)' },
    { url: 'ws://test-node-ws.zetrix.com:80', name: 'Testnet (NEW - test-node-ws.zetrix.com:80)' },
  ];

  const results = [];

  for (const test of tests) {
    section(test.name);
    const result = await testWebSocketURL(test.url, test.name);
    results.push(result);

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  section('Summary');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`${COLORS.green}Successful connections: ${successful.length}${COLORS.reset}`);
  successful.forEach(r => {
    console.log(`  ✓ ${r.name}`);
    console.log(`    URL: ${r.url}`);
  });

  console.log(`\n${COLORS.red}Failed connections: ${failed.length}${COLORS.reset}`);
  failed.forEach(r => {
    console.log(`  ✗ ${r.name}`);
    console.log(`    URL: ${r.url}`);
    console.log(`    Error: ${r.error}`);
  });

  section('Recommendation');

  if (successful.length > 0) {
    console.log('Working WebSocket URLs found!\n');

    // Find the best URLs (prefer new URLs without explicit port)
    const mainnetNew = successful.find(r => r.url === 'ws://node-ws.zetrix.com');
    const testnetNew = successful.find(r => r.url === 'ws://test-node-ws.zetrix.com');

    const mainnetNewWithPort = successful.find(r => r.url === 'ws://node-ws.zetrix.com:7053');
    const testnetNewWithPort = successful.find(r => r.url === 'ws://test-node-ws.zetrix.com:7053');

    const mainnetOld = successful.find(r => r.url === 'ws://node.zetrix.com:7053');
    const testnetOld = successful.find(r => r.url === 'ws://test-node.zetrix.com:7053');

    console.log('Recommended configuration:\n');

    const mainnetUrl = mainnetNew?.url || mainnetNewWithPort?.url || mainnetOld?.url;
    const testnetUrl = testnetNew?.url || testnetNewWithPort?.url || testnetOld?.url;

    console.log(`${COLORS.cyan}Mainnet:${COLORS.reset}  ${mainnetUrl}`);
    console.log(`${COLORS.cyan}Testnet:${COLORS.reset}  ${testnetUrl}`);

    if (mainnetNew || testnetNew) {
      success('\nNew URLs work! No explicit port needed.');
    } else if (mainnetNewWithPort || testnetNewWithPort) {
      info('\nNew URLs work with port 7053.');
    } else {
      info('\nOld URLs are working. New URLs may not be available yet.');
    }
  } else {
    error('No working WebSocket URLs found!');
    console.log('\nPossible issues:');
    console.log('  - Firewall blocking connections');
    console.log('  - Network connectivity issues');
    console.log('  - WebSocket servers may be down');
  }

  console.log();
}

main().catch((err) => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
