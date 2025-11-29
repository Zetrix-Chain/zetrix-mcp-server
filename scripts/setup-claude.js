#!/usr/bin/env node

/**
 * Zetrix MCP Server - Claude Desktop Setup Helper
 * Automatically configures Claude Desktop to use this MCP server
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

function warning(message) {
  log(COLORS.yellow, '⚠', message);
}

function info(message) {
  log(COLORS.blue, 'ℹ', message);
}

function section(message) {
  console.log(`\n${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}`);
  console.log(`${COLORS.cyan}${message}${COLORS.reset}`);
  console.log(`${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}\n`);
}

function getClaudeConfigPath() {
  const platform = os.platform();
  const homeDir = os.homedir();

  switch (platform) {
    case 'win32':
      return path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
    case 'darwin':
      return path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    case 'linux':
      return path.join(homeDir, '.config', 'Claude', 'claude_desktop_config.json');
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function getServerPath() {
  return path.join(__dirname, 'dist', 'index.js');
}

function promptUser(question) {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(question, (answer) => {
      readline.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  console.log(`${COLORS.magenta}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    Zetrix MCP Server - Claude Desktop Setup Wizard       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}`);

  section('Step 1: Verify Installation');

  // Check if dist/index.js exists
  const serverPath = getServerPath();
  if (!fs.existsSync(serverPath)) {
    error('Server not built! Please run: npm run build');
    process.exit(1);
  }
  success(`Server found at: ${serverPath}`);

  // Check Node.js version
  const nodeVersion = process.version;
  info(`Node.js version: ${nodeVersion}`);
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    warning('Node.js 18 or higher is recommended');
  }

  section('Step 2: Locate Claude Desktop Config');

  const configPath = getClaudeConfigPath();
  info(`Config path: ${configPath}`);

  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    warning(`Config directory doesn't exist: ${configDir}`);
    info('Creating directory...');
    fs.mkdirSync(configDir, { recursive: true });
    success('Directory created');
  }

  section('Step 3: Choose Network Configuration');

  console.log('Which Zetrix network do you want to use?\n');
  console.log('  1) Mainnet only (production)');
  console.log('  2) Testnet only (testing)');
  console.log('  3) Both Mainnet and Testnet');
  console.log('  4) Cancel\n');

  const choice = await promptUser('Enter your choice (1-4): ');

  let config;
  let networkName;

  switch (choice) {
    case '1':
      networkName = 'Mainnet';
      config = {
        mcpServers: {
          'zetrix-mainnet': {
            command: 'node',
            args: [serverPath],
            env: {
              ZETRIX_NETWORK: 'mainnet',
            },
          },
        },
      };
      break;

    case '2':
      networkName = 'Testnet';
      config = {
        mcpServers: {
          'zetrix-testnet': {
            command: 'node',
            args: [serverPath],
            env: {
              ZETRIX_NETWORK: 'testnet',
            },
          },
        },
      };
      break;

    case '3':
      networkName = 'Both (Mainnet + Testnet)';
      config = {
        mcpServers: {
          'zetrix-mainnet': {
            command: 'node',
            args: [serverPath],
            env: {
              ZETRIX_NETWORK: 'mainnet',
            },
          },
          'zetrix-testnet': {
            command: 'node',
            args: [serverPath],
            env: {
              ZETRIX_NETWORK: 'testnet',
            },
          },
        },
      };
      break;

    case '4':
      info('Setup cancelled');
      process.exit(0);
      break;

    default:
      error('Invalid choice');
      process.exit(1);
  }

  section('Step 4: Update Configuration');

  // Check if config file exists
  let existingConfig = {};
  if (fs.existsSync(configPath)) {
    info('Existing config file found');
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      existingConfig = JSON.parse(content);

      // Check if there are existing MCP servers
      if (existingConfig.mcpServers && Object.keys(existingConfig.mcpServers).length > 0) {
        warning('You have existing MCP servers configured');
        console.log('Existing servers:', Object.keys(existingConfig.mcpServers).join(', '));

        const merge = await promptUser('Merge with existing config? (y/n): ');
        if (merge === 'y' || merge === 'yes') {
          // Merge configs
          config.mcpServers = {
            ...existingConfig.mcpServers,
            ...config.mcpServers,
          };
          info('Configs will be merged');
        } else {
          warning('Existing config will be backed up and replaced');
          const backupPath = `${configPath}.backup.${Date.now()}`;
          fs.copyFileSync(configPath, backupPath);
          success(`Backup created: ${backupPath}`);
        }
      }
    } catch (err) {
      warning(`Could not parse existing config: ${err.message}`);
      const proceed = await promptUser('Continue anyway? (y/n): ');
      if (proceed !== 'y' && proceed !== 'yes') {
        info('Setup cancelled');
        process.exit(0);
      }
    }
  } else {
    info('No existing config file, creating new one');
  }

  // Write config
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    success('Configuration file updated!');
  } catch (err) {
    error(`Failed to write config: ${err.message}`);
    process.exit(1);
  }

  section('Step 5: Configuration Summary');

  console.log(`${COLORS.cyan}Network:${COLORS.reset} ${networkName}`);
  console.log(`${COLORS.cyan}Config file:${COLORS.reset} ${configPath}`);
  console.log(`${COLORS.cyan}Server path:${COLORS.reset} ${serverPath}`);

  if (config.mcpServers['zetrix-mainnet']) {
    console.log(`\n${COLORS.green}Mainnet:${COLORS.reset}`);
    console.log(`  HTTP:      https://node.zetrix.com`);
    console.log(`  WebSocket: ws://node.zetrix.com:7053`);
  }

  if (config.mcpServers['zetrix-testnet']) {
    console.log(`\n${COLORS.yellow}Testnet:${COLORS.reset}`);
    console.log(`  HTTP:      https://test-node.zetrix.com`);
    console.log(`  WebSocket: ws://test-node.zetrix.com:7053`);
  }

  section('Next Steps');

  console.log('1. Restart Claude Desktop completely (quit and reopen)');
  console.log('2. Look for the hammer/tool icon (🔨) in Claude Desktop');
  console.log('3. Test by asking: "What MCP tools do you have available?"');
  console.log('4. Read EXAMPLES.md for usage examples\n');

  success('Setup complete! 🎉');

  // Offer to run tests
  console.log();
  const runTests = await promptUser('Run server tests now? (y/n): ');
  if (runTests === 'y' || runTests === 'yes') {
    console.log('\nRunning tests...\n');
    const { spawn } = require('child_process');
    const testProcess = spawn('node', ['test-server.js'], {
      stdio: 'inherit',
      env: { ...process.env, ZETRIX_NETWORK: config.mcpServers['zetrix-mainnet'] ? 'mainnet' : 'testnet' },
    });

    testProcess.on('exit', (code) => {
      if (code === 0) {
        console.log();
        success('All tests passed! Your server is ready to use.');
      } else {
        console.log();
        warning('Some tests failed. Check the output above for details.');
      }
    });
  } else {
    info('You can run tests later with: node test-server.js');
  }
}

main().catch((err) => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
