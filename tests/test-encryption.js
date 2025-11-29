#!/usr/bin/env node

/**
 * Zetrix Encryption Integration Test
 * Tests the official zetrix-encryption-nodejs integration
 */

import { ZetrixEncryption } from '../dist/zetrix-encryption.js';

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

async function testEncryption() {
  section('Testing Zetrix Encryption Integration');

  const encryption = new ZetrixEncryption();
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Generate Key Pair
  let testKeyPair = null;
  try {
    totalTests++;
    info('Test 1: Generating a new key pair...');
    testKeyPair = await encryption.generateKeyPair();

    if (testKeyPair.privateKey && testKeyPair.publicKey && testKeyPair.address) {
      success('Key pair generated successfully');
      info(`  Address: ${testKeyPair.address}`);
      info(`  Private Key: ${testKeyPair.privateKey.substring(0, 20)}...`);
      info(`  Public Key: ${testKeyPair.publicKey.substring(0, 40)}...`);
      passedTests++;
    } else {
      error('Key pair missing required fields');
    }
  } catch (err) {
    error(`Key pair generation failed: ${err.message}`);
  }

  if (!testKeyPair) {
    error('Cannot continue tests without a key pair');
    process.exit(1);
  }

  // Test 2: Get Public Key from Private Key
  try {
    totalTests++;
    info('Test 2: Deriving public key from private key...');
    const derivedPublicKey = await encryption.getPublicKeyFromPrivate(testKeyPair.privateKey);

    if (derivedPublicKey === testKeyPair.publicKey) {
      success('Public key derivation successful (matches original)');
      passedTests++;
    } else {
      error('Derived public key does not match original');
    }
  } catch (err) {
    error(`Public key derivation failed: ${err.message}`);
  }

  // Test 3: Get Address from Public Key
  try {
    totalTests++;
    info('Test 3: Deriving address from public key...');
    const derivedAddress = await encryption.getAddressFromPublicKey(testKeyPair.publicKey);

    if (derivedAddress === testKeyPair.address) {
      success('Address derivation successful (matches original)');
      passedTests++;
    } else {
      error('Derived address does not match original');
    }
  } catch (err) {
    error(`Address derivation failed: ${err.message}`);
  }

  // Test 4: Validate Private Key
  try {
    totalTests++;
    info('Test 4: Validating private key...');
    const isValidPrivKey = await encryption.isValidPrivateKey(testKeyPair.privateKey);

    if (isValidPrivKey) {
      success('Private key validation passed');
      passedTests++;
    } else {
      error('Private key validation failed (should be valid)');
    }
  } catch (err) {
    error(`Private key validation error: ${err.message}`);
  }

  // Test 5: Validate Public Key
  try {
    totalTests++;
    info('Test 5: Validating public key...');
    const isValidPubKey = await encryption.isValidPublicKey(testKeyPair.publicKey);

    if (isValidPubKey) {
      success('Public key validation passed');
      passedTests++;
    } else {
      error('Public key validation failed (should be valid)');
    }
  } catch (err) {
    error(`Public key validation error: ${err.message}`);
  }

  // Test 6: Validate Address
  try {
    totalTests++;
    info('Test 6: Validating address...');
    const isValidAddr = await encryption.isValidAddress(testKeyPair.address);

    if (isValidAddr) {
      success('Address validation passed');
      passedTests++;
    } else {
      error('Address validation failed (should be valid)');
    }
  } catch (err) {
    error(`Address validation error: ${err.message}`);
  }

  // Test 7: Sign a Message
  let testSignature = null;
  try {
    totalTests++;
    info('Test 7: Signing a test message...');
    const testMessage = '48656c6c6f20576f726c64'; // "Hello World" in hex
    testSignature = await encryption.sign(testMessage, testKeyPair.privateKey);

    if (testSignature.signData && testSignature.publicKey) {
      success('Message signing successful');
      info(`  Signature: ${testSignature.signData.substring(0, 40)}...`);
      passedTests++;
    } else {
      error('Signature missing required fields');
    }
  } catch (err) {
    error(`Message signing failed: ${err.message}`);
  }

  // Test 8: Verify Signature
  if (testSignature) {
    try {
      totalTests++;
      info('Test 8: Verifying the signature...');
      const testMessage = '48656c6c6f20576f726c64';
      const isValid = await encryption.verify(
        testMessage,
        testSignature.signData,
        testSignature.publicKey
      );

      if (isValid) {
        success('Signature verification passed');
        passedTests++;
      } else {
        error('Signature verification failed (should be valid)');
      }
    } catch (err) {
      error(`Signature verification error: ${err.message}`);
    }
  } else {
    info('Test 8: Skipping verification test (no signature)');
    totalTests++;
  }

  // Test 9: Encrypt Private Key
  let encryptedData = null;
  try {
    totalTests++;
    info('Test 9: Encrypting private key with password...');
    const testPassword = 'TestPassword123!';
    encryptedData = await encryption.encryptPrivateKey(testKeyPair.privateKey, testPassword);

    if (encryptedData && typeof encryptedData === 'object') {
      success('Private key encryption successful');
      info(`  Encrypted data type: ${typeof encryptedData}`);
      passedTests++;
    } else {
      error(`Encryption produced invalid data: ${typeof encryptedData}`);
    }
  } catch (err) {
    error(`Private key encryption failed: ${err.message}`);
  }

  // Test 10: Decrypt Private Key
  if (encryptedData) {
    try {
      totalTests++;
      info('Test 10: Decrypting private key with password...');
      const testPassword = 'TestPassword123!';
      const decryptedKey = await encryption.decryptPrivateKey(encryptedData, testPassword);

      if (decryptedKey === testKeyPair.privateKey) {
        success('Private key decryption successful (matches original)');
        passedTests++;
      } else {
        error('Decrypted key does not match original');
      }
    } catch (err) {
      error(`Private key decryption failed: ${err.message}`);
    }
  } else {
    info('Test 10: Skipping decryption test (no encrypted data)');
    totalTests++;
  }

  // Summary
  section('Test Summary');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${COLORS.green}${passedTests}${COLORS.reset}`);
  console.log(`Failed: ${COLORS.red}${totalTests - passedTests}${COLORS.reset}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (passedTests === totalTests) {
    success('All encryption tests passed! ✨');
    console.log();
    info('The official zetrix-encryption-nodejs is working correctly!');
    info('You can now use all 8 encryption tools in Claude Desktop:');
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_generate_keypair`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_get_public_key`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_get_address`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_validate_key`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_sign`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_verify`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_encrypt_key`);
    console.log(`  ${COLORS.cyan}•${COLORS.reset} zetrix_crypto_decrypt_key`);
    console.log();
    return true;
  } else {
    error('Some encryption tests failed. Please check the errors above.');
    console.log();
    return false;
  }
}

// Run tests
testEncryption()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    error(`Fatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
