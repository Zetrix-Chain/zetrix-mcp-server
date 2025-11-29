import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export interface ContractGenerationOptions {
  contractName: string;
  contractType: "token" | "nft" | "defi" | "governance" | "marketplace" | "custom";
  features?: string[];
  tokenStandard?: "ZTP20" | "ZTP721" | "ZTP1155";
  includeTests?: boolean;
  outputDirectory?: string;
}

export class ZetrixContractGenerator {
  private generateInterface(contractName: string, contractType: string): string {
    return `"use strict";

// ${contractName} Interface
// Defines the standard interface for ${contractName} contract

var ${contractName}Interface = {
  // Query methods (read-only)
  query: {
    getInfo: function() {
      throw "Not implemented";
    },

    getOwner: function() {
      throw "Not implemented";
    },

    getVersion: function() {
      throw "Not implemented";
    }
  },

  // Main methods (state-changing)
  main: {
    initialize: function(params) {
      throw "Not implemented";
    },

    transferOwnership: function(newOwner) {
      throw "Not implemented";
    }
  }
};

// Export interface
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ${contractName}Interface;
}
`;
  }

  private generateLibrary(contractName: string): string {
    return `"use strict";

// ${contractName} Library
// Reusable utility functions for ${contractName}

var ${contractName}Lib = {
  // Validation utilities
  validation: {
    isValidAddress: function(address) {
      return Utils.addressCheck(address);
    },

    isValidAmount: function(amount) {
      if (!Utils.stoI64Check(amount)) return false;
      return Utils.int64Compare(amount, "0") > 0;
    },

    requireValidAddress: function(address, paramName) {
      Utils.assert(
        this.isValidAddress(address),
        paramName + " must be a valid address"
      );
    },

    requireValidAmount: function(amount, paramName) {
      Utils.assert(
        this.isValidAmount(amount),
        paramName + " must be a valid positive amount"
      );
    }
  },

  // Storage utilities
  storage: {
    makeKey: function(prefix, ...parts) {
      return prefix + "_" + parts.join("_");
    },

    loadOrDefault: function(key, defaultValue) {
      var value = Chain.load(key);
      return value === false ? defaultValue : value;
    },

    loadJSON: function(key) {
      var value = Chain.load(key);
      return value === false ? null : JSON.parse(value);
    },

    storeJSON: function(key, obj) {
      Chain.store(key, JSON.stringify(obj));
    }
  },

  // Math utilities
  math: {
    safeAdd: function(a, b) {
      Utils.assert(
        Utils.stoI64Check(a) && Utils.stoI64Check(b),
        "Invalid numbers for addition"
      );
      return Utils.int64Add(a, b);
    },

    safeSub: function(a, b) {
      Utils.assert(
        Utils.stoI64Check(a) && Utils.stoI64Check(b),
        "Invalid numbers for subtraction"
      );
      Utils.assert(
        Utils.int64Compare(a, b) >= 0,
        "Subtraction would result in negative number"
      );
      return Utils.int64Sub(a, b);
    },

    safeMul: function(a, b) {
      Utils.assert(
        Utils.stoI64Check(a) && Utils.stoI64Check(b),
        "Invalid numbers for multiplication"
      );
      return Utils.int64Mul(a, b);
    },

    safeDiv: function(a, b) {
      Utils.assert(
        Utils.stoI64Check(a) && Utils.stoI64Check(b),
        "Invalid numbers for division"
      );
      Utils.assert(
        Utils.int64Compare(b, "0") > 0,
        "Division by zero"
      );
      return Utils.int64Div(a, b);
    }
  }
};

// Export library
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ${contractName}Lib;
}
`;
  }

  private generateUtilsModule(contractName: string, features: string[]): string {
    const hasOwnable = features.includes("ownable");
    const hasPausable = features.includes("pausable");
    const hasRoles = features.includes("roles");
    const hasWhitelist = features.includes("whitelist");
    const hasBlacklist = features.includes("blacklist");

    return `"use strict";

// ${contractName} Utils Module
// Feature-specific utility functions

var ${contractName}Utils = {
  // Constants
  CONSTANTS: {
    CONTRACT_INFO_KEY: "contract_info",
    ${hasOwnable ? 'OWNER_KEY: "owner",' : ''}
    ${hasPausable ? 'PAUSE_KEY: "paused",' : ''}
    ${hasRoles ? 'ROLES_PREFIX: "role_",' : ''}
    ${hasWhitelist ? 'WHITELIST_PREFIX: "whitelist_",' : ''}
    ${hasBlacklist ? 'BLACKLIST_PREFIX: "blacklist_",' : ''}
    VERSION: "1.0.0"
  },

${hasOwnable ? `  // Ownership management
  ownership: {
    getOwner: function() {
      var owner = Chain.load(${contractName}Utils.CONSTANTS.OWNER_KEY);
      return owner === false ? "" : owner;
    },

    setOwner: function(newOwner) {
      Chain.store(${contractName}Utils.CONSTANTS.OWNER_KEY, newOwner);
      Chain.tlog("OwnershipTransferred", this.getOwner(), newOwner);
    },

    requireOwner: function() {
      var owner = this.getOwner();
      Utils.assert(
        Chain.msg.sender === owner,
        "Only owner can perform this action"
      );
    },

    transferOwnership: function(newOwner) {
      this.requireOwner();
      ${contractName}Lib.validation.requireValidAddress(newOwner, "newOwner");
      Utils.assert(
        newOwner !== this.getOwner(),
        "New owner must be different from current owner"
      );
      this.setOwner(newOwner);
    }
  },
` : ''}
${hasPausable ? `  // Pause functionality
  pausable: {
    isPaused: function() {
      var paused = Chain.load(${contractName}Utils.CONSTANTS.PAUSE_KEY);
      return paused === "true";
    },

    requireNotPaused: function() {
      Utils.assert(!this.isPaused(), "Contract is paused");
    },

    requirePaused: function() {
      Utils.assert(this.isPaused(), "Contract is not paused");
    },

    pause: function() {
      ${hasOwnable ? '${contractName}Utils.ownership.requireOwner();' : ''}
      this.requireNotPaused();
      Chain.store(${contractName}Utils.CONSTANTS.PAUSE_KEY, "true");
      Chain.tlog("Paused", Chain.msg.sender);
    },

    unpause: function() {
      ${hasOwnable ? '${contractName}Utils.ownership.requireOwner();' : ''}
      this.requirePaused();
      Chain.store(${contractName}Utils.CONSTANTS.PAUSE_KEY, "false");
      Chain.tlog("Unpaused", Chain.msg.sender);
    }
  },
` : ''}
${hasWhitelist ? `  // Whitelist management
  whitelist: {
    makeKey: function(address) {
      return ${contractName}Utils.CONSTANTS.WHITELIST_PREFIX + address;
    },

    isWhitelisted: function(address) {
      var key = this.makeKey(address);
      var value = Chain.load(key);
      return value === "true";
    },

    requireWhitelisted: function(address) {
      Utils.assert(
        this.isWhitelisted(address),
        "Address is not whitelisted: " + address
      );
    },

    addToWhitelist: function(address) {
      ${hasOwnable ? '${contractName}Utils.ownership.requireOwner();' : ''}
      ${contractName}Lib.validation.requireValidAddress(address, "address");
      Utils.assert(!this.isWhitelisted(address), "Already whitelisted");

      var key = this.makeKey(address);
      Chain.store(key, "true");
      Chain.tlog("Whitelisted", address);
    },

    removeFromWhitelist: function(address) {
      ${hasOwnable ? '${contractName}Utils.ownership.requireOwner();' : ''}
      ${contractName}Lib.validation.requireValidAddress(address, "address");
      Utils.assert(this.isWhitelisted(address), "Not whitelisted");

      var key = this.makeKey(address);
      Chain.store(key, "false");
      Chain.tlog("RemovedFromWhitelist", address);
    }
  },
` : ''}
${hasBlacklist ? `  // Blacklist management
  blacklist: {
    makeKey: function(address) {
      return ${contractName}Utils.CONSTANTS.BLACKLIST_PREFIX + address;
    },

    isBlacklisted: function(address) {
      var key = this.makeKey(address);
      var value = Chain.load(key);
      return value === "true";
    },

    requireNotBlacklisted: function(address) {
      Utils.assert(
        !this.isBlacklisted(address),
        "Address is blacklisted: " + address
      );
    },

    addToBlacklist: function(address) {
      ${hasOwnable ? '${contractName}Utils.ownership.requireOwner();' : ''}
      ${contractName}Lib.validation.requireValidAddress(address, "address");
      Utils.assert(!this.isBlacklisted(address), "Already blacklisted");

      var key = this.makeKey(address);
      Chain.store(key, "true");
      Chain.tlog("Blacklisted", address);
    },

    removeFromBlacklist: function(address) {
      ${hasOwnable ? '${contractName}Utils.ownership.requireOwner();' : ''}
      ${contractName}Lib.validation.requireValidAddress(address, "address");
      Utils.assert(this.isBlacklisted(address), "Not blacklisted");

      var key = this.makeKey(address);
      Chain.store(key, "false");
      Chain.tlog("RemovedFromBlacklist", address);
    }
  }
` : ''}
};

// Export utils
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ${contractName}Utils;
}
`;
  }

  private generateMainContract(options: ContractGenerationOptions): string {
    const { contractName, contractType, features = [], tokenStandard } = options;

    const hasOwnable = features.includes("ownable");
    const hasPausable = features.includes("pausable");
    const hasWhitelist = features.includes("whitelist");
    const hasBlacklist = features.includes("blacklist");

    let contractCode = `"use strict";

// ============================================================================
// ${contractName} - Advanced Zetrix Smart Contract
// Type: ${contractType.toUpperCase()}
${tokenStandard ? `// Standard: ${tokenStandard}` : ''}
// Features: ${features.join(", ") || "None"}
// Version: 1.0.0
// ============================================================================

// ============================================================================
// CONTRACT INITIALIZATION
// ============================================================================

function init(input_str) {
  var input = JSON.parse(input_str);
  var params = input.params;

  // Validate initialization parameters
  Utils.assert(params.name !== undefined, "Contract name is required");
  Utils.assert(params.symbol !== undefined, "Contract symbol is required");
  ${hasOwnable ? 'Utils.assert(params.owner !== undefined, "Owner address is required");' : ''}
  ${hasOwnable ? '${contractName}Lib.validation.requireValidAddress(params.owner, "owner");' : ''}

  // Store contract info
  var contractInfo = {
    name: params.name,
    symbol: params.symbol,
    ${hasOwnable ? 'owner: params.owner,' : ''}
    version: "1.0.0",
    deployTime: Chain.block.timestamp
  };

  ${contractName}Lib.storage.storeJSON(
    ${contractName}Utils.CONSTANTS.CONTRACT_INFO_KEY,
    contractInfo
  );

  ${hasOwnable ? '// Set initial owner\n  Chain.store(${contractName}Utils.CONSTANTS.OWNER_KEY, params.owner);' : ''}
  ${hasPausable ? '// Initialize as unpaused\n  Chain.store(${contractName}Utils.CONSTANTS.PAUSE_KEY, "false");' : ''}

  Chain.tlog("ContractInitialized", params.name, params.symbol);
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

function main(input_str) {
  var input = JSON.parse(input_str);
  var method = input.method;
  var params = input.params;

  ${hasPausable ? '// Check if contract is paused (except for unpause)\n  if (method !== "unpause") {\n    ${contractName}Utils.pausable.requireNotPaused();\n  }' : ''}

  // Route to appropriate method
  if (method === "exampleMethod") {
    return exampleMethod(params);
  }
  ${hasOwnable ? 'else if (method === "transferOwnership") {\n    return ${contractName}Utils.ownership.transferOwnership(params.newOwner);\n  }' : ''}
  ${hasPausable ? 'else if (method === "pause") {\n    return ${contractName}Utils.pausable.pause();\n  } else if (method === "unpause") {\n    return ${contractName}Utils.pausable.unpause();\n  }' : ''}
  ${hasWhitelist ? 'else if (method === "addToWhitelist") {\n    return ${contractName}Utils.whitelist.addToWhitelist(params.address);\n  } else if (method === "removeFromWhitelist") {\n    return ${contractName}Utils.whitelist.removeFromWhitelist(params.address);\n  }' : ''}
  ${hasBlacklist ? 'else if (method === "addToBlacklist") {\n    return ${contractName}Utils.blacklist.addToBlacklist(params.address);\n  } else if (method === "removeFromBlacklist") {\n    return ${contractName}Utils.blacklist.removeFromBlacklist(params.address);\n  }' : ''}
  else {
    throw "Unknown method: " + method;
  }
}

// ============================================================================
// QUERY ENTRY POINT
// ============================================================================

function query(input_str) {
  var input = JSON.parse(input_str);
  var method = input.method;
  var params = input.params || {};
  var result = {};

  if (method === "contractInfo") {
    result = ${contractName}Lib.storage.loadJSON(
      ${contractName}Utils.CONSTANTS.CONTRACT_INFO_KEY
    );
  }
  ${hasOwnable ? 'else if (method === "owner") {\n    result.owner = ${contractName}Utils.ownership.getOwner();\n  }' : ''}
  ${hasPausable ? 'else if (method === "isPaused") {\n    result.isPaused = ${contractName}Utils.pausable.isPaused();\n  }' : ''}
  ${hasWhitelist ? 'else if (method === "isWhitelisted") {\n    result.isWhitelisted = ${contractName}Utils.whitelist.isWhitelisted(params.address);\n  }' : ''}
  ${hasBlacklist ? 'else if (method === "isBlacklisted") {\n    result.isBlacklisted = ${contractName}Utils.blacklist.isBlacklisted(params.address);\n  }' : ''}
  else {
    throw "Unknown query method: " + method;
  }

  return JSON.stringify(result);
}

// ============================================================================
// BUSINESS LOGIC METHODS
// ============================================================================

function exampleMethod(params) {
  // Implement your business logic here
  ${hasOwnable ? '${contractName}Utils.ownership.requireOwner();' : ''}

  // Example: validate input
  Utils.assert(params.value !== undefined, "Value is required");

  // Example: perform operation
  Chain.tlog("ExampleMethod", Chain.msg.sender, params.value);

  return true;
}
`;

    return contractCode;
  }

  private generateTestSpecs(options: ContractGenerationOptions): string {
    const { contractName, features = [] } = options;

    return `# ${contractName} Test Specifications

## Test Environment Setup

\`\`\`javascript
const CONTRACT_ADDRESS = "ztx_contract_address_here";
const OWNER_ADDRESS = "ztx_owner_address_here";
const USER1_ADDRESS = "ztx_user1_address_here";
const USER2_ADDRESS = "ztx_user2_address_here";
\`\`\`

## 1. Initialization Tests

### TEST_INIT_001: Valid Initialization
**Description:** Contract should initialize with valid parameters

\`\`\`javascript
TEST_INVOKE({
  method: "init",
  params: {
    name: "${contractName}",
    symbol: "SYMBOL",
    owner: OWNER_ADDRESS
  },
  expected: {
    success: true,
    logs: ["ContractInitialized"]
  }
});
\`\`\`

### TEST_INIT_002: Missing Required Parameters
**Description:** Initialization should fail without required parameters

\`\`\`javascript
TEST_INVOKE({
  method: "init",
  params: {
    name: "${contractName}"
    // Missing symbol and owner
  },
  expected: {
    success: false,
    error: /required/i
  }
});
\`\`\`

## 2. Query Method Tests

### TEST_QUERY_001: Contract Info
**Description:** Should return contract information

\`\`\`javascript
TEST_QUERY({
  method: "contractInfo",
  params: {},
  expected: {
    success: true,
    result: {
      name: "${contractName}",
      symbol: "SYMBOL",
      version: "1.0.0"
    }
  }
});
\`\`\`

${features.includes("ownable") ? `
## 3. Ownership Tests

### TEST_OWNER_001: Get Owner
**Description:** Should return current owner

\`\`\`javascript
TEST_QUERY({
  method: "owner",
  params: {},
  expected: {
    success: true,
    result: { owner: OWNER_ADDRESS }
  }
});
\`\`\`

### TEST_OWNER_002: Transfer Ownership - Success
**Description:** Owner should be able to transfer ownership

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "transferOwnership",
  params: {
    newOwner: USER1_ADDRESS
  },
  expected: {
    success: true,
    logs: ["OwnershipTransferred"]
  }
});
\`\`\`

### TEST_OWNER_003: Transfer Ownership - Unauthorized
**Description:** Non-owner should not be able to transfer ownership

\`\`\`javascript
TEST_INVOKE({
  sender: USER1_ADDRESS,
  method: "transferOwnership",
  params: {
    newOwner: USER2_ADDRESS
  },
  expected: {
    success: false,
    error: /only owner/i
  }
});
\`\`\`
` : ''}

${features.includes("pausable") ? `
## 4. Pausable Tests

### TEST_PAUSE_001: Pause Contract
**Description:** Owner should be able to pause contract

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "pause",
  params: {},
  expected: {
    success: true,
    logs: ["Paused"]
  }
});
\`\`\`

### TEST_PAUSE_002: Operations While Paused
**Description:** Operations should fail when contract is paused

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "exampleMethod",
  params: { value: "test" },
  expected: {
    success: false,
    error: /paused/i
  }
});
\`\`\`

### TEST_PAUSE_003: Unpause Contract
**Description:** Owner should be able to unpause contract

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "unpause",
  params: {},
  expected: {
    success: true,
    logs: ["Unpaused"]
  }
});
\`\`\`
` : ''}

${features.includes("whitelist") ? `
## 5. Whitelist Tests

### TEST_WHITELIST_001: Add to Whitelist
**Description:** Owner should be able to add address to whitelist

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "addToWhitelist",
  params: {
    address: USER1_ADDRESS
  },
  expected: {
    success: true,
    logs: ["Whitelisted"]
  }
});
\`\`\`

### TEST_WHITELIST_002: Check Whitelisted
**Description:** Should return whitelist status

\`\`\`javascript
TEST_QUERY({
  method: "isWhitelisted",
  params: {
    address: USER1_ADDRESS
  },
  expected: {
    success: true,
    result: { isWhitelisted: true }
  }
});
\`\`\`

### TEST_WHITELIST_003: Remove from Whitelist
**Description:** Owner should be able to remove address from whitelist

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "removeFromWhitelist",
  params: {
    address: USER1_ADDRESS
  },
  expected: {
    success: true,
    logs: ["RemovedFromWhitelist"]
  }
});
\`\`\`
` : ''}

${features.includes("blacklist") ? `
## 6. Blacklist Tests

### TEST_BLACKLIST_001: Add to Blacklist
**Description:** Owner should be able to add address to blacklist

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "addToBlacklist",
  params: {
    address: USER2_ADDRESS
  },
  expected: {
    success: true,
    logs: ["Blacklisted"]
  }
});
\`\`\`

### TEST_BLACKLIST_002: Check Blacklisted
**Description:** Should return blacklist status

\`\`\`javascript
TEST_QUERY({
  method: "isBlacklisted",
  params: {
    address: USER2_ADDRESS
  },
  expected: {
    success: true,
    result: { isBlacklisted: true }
  }
});
\`\`\`
` : ''}

## Edge Cases and Security Tests

### TEST_SECURITY_001: Invalid Address Format
**Description:** Should reject invalid address formats

\`\`\`javascript
TEST_INVOKE({
  sender: OWNER_ADDRESS,
  method: "exampleMethod",
  params: {
    address: "invalid_address"
  },
  expected: {
    success: false,
    error: /valid address/i
  }
});
\`\`\`

### TEST_SECURITY_002: Reentrancy Protection
**Description:** Contract should be protected against reentrancy attacks

### TEST_SECURITY_003: Integer Overflow/Underflow
**Description:** Math operations should handle overflow/underflow safely

## Performance Tests

### TEST_PERF_001: Gas Optimization
**Description:** Verify gas costs are within acceptable limits

### TEST_PERF_002: Batch Operations
**Description:** Test performance with multiple operations

## Integration Tests

### TEST_INT_001: Cross-Contract Calls
**Description:** Test interaction with other contracts

### TEST_INT_002: Event Logging
**Description:** Verify all events are logged correctly
`;
  }

  public generate(options: ContractGenerationOptions): {
    files: { path: string; content: string }[];
    summary: string;
  } {
    const { contractName, features = [], includeTests = true, outputDirectory = "." } = options;

    const files: { path: string; content: string }[] = [];

    // Generate interface
    files.push({
      path: join(outputDirectory, `${contractName}Interface.js`),
      content: this.generateInterface(contractName, options.contractType)
    });

    // Generate library
    files.push({
      path: join(outputDirectory, `${contractName}Lib.js`),
      content: this.generateLibrary(contractName)
    });

    // Generate utils
    files.push({
      path: join(outputDirectory, `${contractName}Utils.js`),
      content: this.generateUtilsModule(contractName, features)
    });

    // Generate main contract
    files.push({
      path: join(outputDirectory, `${contractName}.js`),
      content: this.generateMainContract(options)
    });

    // Generate test specs
    if (includeTests) {
      files.push({
        path: join(outputDirectory, `${contractName}Tests.md`),
        content: this.generateTestSpecs(options)
      });
    }

    const summary = `Generated ${contractName} contract with ${files.length} files:

Files created:
${files.map(f => `- ${f.path}`).join('\n')}

Architecture:
- Interface: Defines contract API
- Library: Reusable utility functions
- Utils: Feature-specific modules (${features.join(", ") || "basic"})
- Main Contract: Core business logic
${includeTests ? '- Test Specs: Comprehensive test cases' : ''}

Features included: ${features.join(", ") || "None"}

Next steps:
1. Review generated contract files
2. Customize business logic in ${contractName}.js
3. Run tests using the test specifications
4. Deploy to Zetrix ${options.tokenStandard ? `(${options.tokenStandard} compliant)` : ''}
`;

    return { files, summary };
  }

  public writeFiles(files: { path: string; content: string }[]): void {
    for (const file of files) {
      const dir = file.path.substring(0, file.path.lastIndexOf("/"));
      if (dir && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(file.path, file.content, "utf-8");
    }
  }
}
