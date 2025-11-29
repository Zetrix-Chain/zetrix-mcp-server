#!/usr/bin/env node

import WebSocket from 'ws';

const urls = [
  'ws://node.zetrix.com:7053',
  'ws://test-node.zetrix.com:7053',
  'ws://node-ws.zetrix.com',
  'ws://test-node-ws.zetrix.com',
  'ws://node-ws.zetrix.com:7053',
  'ws://test-node-ws.zetrix.com:7053',
  'ws://node-ws.zetrix.com:80',
  'ws://test-node-ws.zetrix.com:80',
];

async function testURL(url) {
  return new Promise((resolve) => {
    console.log(`\nTesting: ${url}`);

    const timeout = setTimeout(() => {
      ws.close();
      resolve({ url, success: false, error: 'Timeout' });
    }, 5000);

    const ws = new WebSocket(url);

    ws.on('open', () => {
      clearTimeout(timeout);
      console.log(`✓ Connected to ${url}`);

      // Send CHAIN_HELLO
      const hello = {
        type: 0, // CHAIN_HELLO
        api_list: [7, 8, 16, 17, 18],
        timestamp: Date.now()
      };

      ws.send(JSON.stringify(hello));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log(`✓ Received response from ${url}`);
        console.log(`  Type: ${msg.type}`);
        if (msg.buchain_version) {
          console.log(`  Version: ${msg.buchain_version}`);
        }
        clearTimeout(timeout);
        ws.close();
        resolve({ url, success: true, response: msg });
      } catch (err) {
        console.log(`✗ Parse error: ${err.message}`);
        clearTimeout(timeout);
        ws.close();
        resolve({ url, success: false, error: 'Parse error' });
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      console.log(`✗ Error: ${err.message}`);
      resolve({ url, success: false, error: err.message });
    });

    ws.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

async function main() {
  console.log('Testing Zetrix WebSocket URLs...\n');
  console.log('=' .repeat(60));

  const results = [];

  for (const url of urls) {
    const result = await testURL(url);
    results.push(result);
    await new Promise(r => setTimeout(r, 500)); // Wait between tests
  }

  console.log('\n' + '='.repeat(60));
  console.log('\nSUMMARY:');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✓ Successful: ${successful.length}`);
  successful.forEach(r => console.log(`  - ${r.url}`));

  console.log(`\n✗ Failed: ${failed.length}`);
  failed.forEach(r => console.log(`  - ${r.url} (${r.error})`));

  if (successful.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('RECOMMENDED CONFIGURATION:');
    console.log('='.repeat(60));

    const mainnetNew = successful.find(r => r.url.includes('node-ws.zetrix.com'));
    const testnetNew = successful.find(r => r.url.includes('test-node-ws.zetrix.com'));
    const mainnetOld = successful.find(r => r.url === 'ws://node.zetrix.com:7053');
    const testnetOld = successful.find(r => r.url === 'ws://test-node.zetrix.com:7053');

    const mainnet = mainnetNew || mainnetOld;
    const testnet = testnetNew || testnetOld;

    if (mainnet) console.log(`\nMainnet:  ${mainnet.url}`);
    if (testnet) console.log(`Testnet:  ${testnet.url}`);
  }

  console.log();
}

main();
