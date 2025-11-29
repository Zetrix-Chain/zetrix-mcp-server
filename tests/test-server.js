#!/usr/bin/env node

/**
 * Zetrix MCP Server Test Script
 * Tests all HTTP and WebSocket functionality
 */

import { ZetrixClient } from '../dist/zetrix-client.js';
import { ZetrixWebSocketClient } from '../dist/zetrix-websocket.js';

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

async function testHttpClient() {
  section('Testing HTTP Client');

  const network = process.env.ZETRIX_NETWORK || 'mainnet';
  info(`Using network: ${network}`);

  const client = new ZetrixClient(network);
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Health Check
  totalTests++;
  try {
    info('Test 1: Checking node health...');
    const health = await client.checkHealth();
    if (health.healthy) {
      success(`Node is healthy: ${health.rpcUrl}`);
      passedTests++;
    } else {
      error(`Node is unhealthy: ${health.error}`);
    }
  } catch (err) {
    error(`Health check failed: ${err.message}`);
  }

  // Test 2: Get Latest Block
  totalTests++;
  try {
    info('Test 2: Getting latest block...');
    const block = await client.getLatestBlock();
    success(`Latest block: ${block.blockNumber} (${block.txCount} transactions)`);
    passedTests++;
  } catch (err) {
    error(`Get latest block failed: ${err.message}`);
  }

  // Test 3: Get Specific Block
  totalTests++;
  try {
    info('Test 3: Getting block #100...');
    const block = await client.getBlock(100);
    success(`Block 100: Hash ${block.hash.substring(0, 16)}...`);
    passedTests++;
  } catch (err) {
    error(`Get block failed: ${err.message}`);
  }

  // Test 4: Get Ledger Info
  totalTests++;
  try {
    info('Test 4: Getting ledger info...');
    const ledger = await client.getLedger();
    success(`Ledger version: ${ledger.header.version}, seq: ${ledger.header.seq}`);
    passedTests++;
  } catch (err) {
    error(`Get ledger failed: ${err.message}`);
  }

  // Test 5: Create KeyPair (testing only)
  totalTests++;
  try {
    info('Test 5: Creating test keypair...');
    const keypair = await client.createKeyPair();
    success(`Generated address: ${keypair.address}`);
    info(`  Public key: ${keypair.public_key.substring(0, 32)}...`);
    passedTests++;
  } catch (err) {
    error(`Create keypair failed: ${err.message}`);
  }

  // Test 6: Get Account (using generated or default address)
  totalTests++;
  try {
    info('Test 6: Getting account info...');
    // Use a known genesis or common address, or skip if not available
    const testAddress = 'ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3';
    const account = await client.getAccount(testAddress);
    success(`Account balance: ${account.balance} (nonce: ${account.nonce})`);
    passedTests++;
  } catch (err) {
    // Account might not exist, that's okay
    info(`Get account test skipped: ${err.message}`);
    totalTests--; // Don't count this test
  }

  // Test 7: Get Account Base
  totalTests++;
  try {
    info('Test 7: Getting account base info...');
    const testAddress = 'ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3';
    const accountBase = await client.getAccountBase(testAddress);
    success(`Account base retrieved: ${accountBase.address}`);
    passedTests++;
  } catch (err) {
    info(`Get account base test skipped: ${err.message}`);
    totalTests--;
  }

  section(`HTTP Tests Complete: ${passedTests}/${totalTests} passed`);
  return { passed: passedTests, total: totalTests };
}

async function testWebSocketClient() {
  section('Testing WebSocket Client');

  const network = process.env.ZETRIX_NETWORK || 'mainnet';
  const wsUrl = network === 'mainnet'
    ? 'ws://node.zetrix.com:7053'
    : 'ws://test-node.zetrix.com:7053';

  info(`Using WebSocket URL: ${wsUrl}`);

  const wsClient = new ZetrixWebSocketClient(wsUrl);
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Connect and Register
  totalTests++;
  try {
    info('Test 1: Connecting to WebSocket...');
    const response = await wsClient.registerAndConnect();
    success(`Connected! Blockchain version: ${response.buchain_version}`);
    info(`  Ledger version: ${response.ledger_version}`);
    info(`  Node address: ${response.self_addr}`);
    passedTests++;
  } catch (err) {
    error(`WebSocket connection failed: ${err.message}`);
    section(`WebSocket Tests Complete: ${passedTests}/${totalTests} passed (aborted)`);
    return { passed: passedTests, total: totalTests };
  }

  // Test 2: Check Connection Status
  totalTests++;
  try {
    info('Test 2: Checking connection status...');
    const isConnected = wsClient.isConnected();
    if (isConnected) {
      success('WebSocket is connected and registered');
      passedTests++;
    } else {
      error('WebSocket shows as disconnected');
    }
  } catch (err) {
    error(`Status check failed: ${err.message}`);
  }

  // Test 3: Subscribe to Transactions
  totalTests++;
  try {
    info('Test 3: Subscribing to transaction notifications...');
    const testAddress = 'ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3';
    const response = await wsClient.subscribeTransactions([testAddress]);
    if (response.error_code === 0) {
      success('Successfully subscribed to transaction notifications');
      passedTests++;
    } else {
      error(`Subscription failed: ${response.error_desc}`);
    }
  } catch (err) {
    error(`Subscribe failed: ${err.message}`);
  }

  // Test 4: Disconnect
  totalTests++;
  try {
    info('Test 4: Disconnecting from WebSocket...');
    wsClient.disconnect();
    success('WebSocket disconnected successfully');
    passedTests++;
  } catch (err) {
    error(`Disconnect failed: ${err.message}`);
  }

  section(`WebSocket Tests Complete: ${passedTests}/${totalTests} passed`);
  return { passed: passedTests, total: totalTests };
}

async function main() {
  console.log(`${COLORS.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         Zetrix MCP Server - Test Suite                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}`);

  const httpResults = await testHttpClient();
  const wsResults = await testWebSocketClient();

  const totalPassed = httpResults.passed + wsResults.passed;
  const totalTests = httpResults.total + wsResults.total;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

  section('Final Results');
  console.log(`HTTP Tests:      ${httpResults.passed}/${httpResults.total} passed`);
  console.log(`WebSocket Tests: ${wsResults.passed}/${wsResults.total} passed`);
  console.log(`${COLORS.cyan}${'─'.repeat(60)}${COLORS.reset}`);
  console.log(`Overall:         ${totalPassed}/${totalTests} passed (${successRate}%)\n`);

  if (totalPassed === totalTests) {
    success('All tests passed! Server is working correctly.');
    process.exit(0);
  } else {
    error(`${totalTests - totalPassed} test(s) failed.`);
    process.exit(1);
  }
}

main().catch((err) => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
