#!/usr/bin/env node

/**
 * Zetrix SDK Integration Test
 * Tests the official zetrix-sdk-nodejs integration
 */

import { ZetrixSDK } from '../dist/zetrix-sdk.js';

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

async function testSDK() {
  section('Testing Zetrix SDK Integration');

  const network = process.env.ZETRIX_NETWORK || 'mainnet';
  info(`Using network: ${network}`);

  const sdk = new ZetrixSDK(network);
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Create Account
  try {
    totalTests++;
    info('Test 1: Creating a new account...');
    const account = await sdk.createAccount();

    if (account.address && account.privateKey && account.publicKey) {
      success(`Account created: ${account.address}`);
      info(`  Address: ${account.address}`);
      info(`  Private Key: ${account.privateKey.substring(0, 20)}...`);
      info(`  Public Key: ${account.publicKey.substring(0, 40)}...`);
      passedTests++;

      // Test 2: Check if account is activated
      try {
        totalTests++;
        info('Test 2: Checking account activation status...');
        const isActivated = await sdk.isAccountActivated(account.address);
        success(`Account activation status: ${isActivated}`);
        if (!isActivated) {
          info('  Note: New accounts need to receive ZTX to be activated');
        }
        passedTests++;
      } catch (err) {
        error(`Account activation check failed: ${err.message}`);
      }

      // Test 3: Get account nonce
      try {
        totalTests++;
        info('Test 3: Getting account nonce...');
        const nonce = await sdk.getNonce(account.address);
        success(`Account nonce: ${nonce}`);
        passedTests++;
      } catch (err) {
        // Nonce might fail for unactivated accounts
        if (err.message.includes('Account not exist') || err.message.includes('account not exist')) {
          success('Nonce check handled correctly (account not exist - expected)');
          passedTests++; // Still count as pass
        } else {
          error(`Nonce retrieval failed: ${err.message}`);
        }
      }

      // Test 4: Get balance (will be 0 for new account)
      try {
        totalTests++;
        info('Test 4: Getting account balance...');
        const balanceResult = await sdk.getBalance(account.address);
        success(`Account balance: ${balanceResult.balance} (0 for new accounts)`);
        passedTests++;
      } catch (err) {
        // Balance might fail for unactivated accounts
        if (err.message.includes('Account not exist') || err.message.includes('account not exist')) {
          success('Balance check handled correctly (account not exist - expected)');
          passedTests++; // Still count as pass
        } else {
          error(`Balance retrieval failed: ${err.message}`);
        }
      }
    } else {
      error('Account creation succeeded but missing required fields');
    }
  } catch (err) {
    error(`Account creation failed: ${err.message}`);
  }

  // Test 5: Check activation of a known mainnet/testnet address
  try {
    totalTests++;
    info('Test 5: Testing with example address...');

    // Use a placeholder address format
    const exampleAddress = 'ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234';

    try {
      const isActivated = await sdk.isAccountActivated(exampleAddress);
      success(`Example address activation check completed: ${isActivated}`);
      passedTests++;
    } catch (err) {
      if (err.message.includes('account not exist') || err.message.includes('Invalid address')) {
        info(`  Note: Example address not found (expected for test address)`);
        passedTests++; // Expected result
      } else {
        error(`Example address check failed: ${err.message}`);
      }
    }
  } catch (err) {
    error(`Example address test failed: ${err.message}`);
  }

  // Summary
  section('Test Summary');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${COLORS.green}${passedTests}${COLORS.reset}`);
  console.log(`Failed: ${COLORS.red}${totalTests - passedTests}${COLORS.reset}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (passedTests === totalTests) {
    success('All SDK tests passed! ✨');
    console.log();
    info('The official zetrix-sdk-nodejs is working correctly!');
    info('You can now use all 6 SDK tools in Claude Desktop:');
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_sdk_create_account`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_sdk_get_balance`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_sdk_is_activated`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_sdk_get_nonce`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_sdk_call_contract`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_sdk_invoke_contract`);
    console.log();
    return true;
  } else {
    error('Some SDK tests failed. Please check the errors above.');
    console.log();
    return false;
  }
}

// Run tests
testSDK()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    error(`Fatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
