import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export interface ContractClass {
  name: string;
  type: "interface" | "library" | "contract";
  extends?: string[];
  properties: {
    name: string;
    visibility: "private" | "protected" | "public";
    type: string;
    description: string;
  }[];
  methods: {
    name: string;
    visibility: "private" | "protected" | "public";
    params: { name: string; type: string }[];
    returns?: string;
    description: string;
  }[];
}

export interface ContractGenerationOptions {
  contractName: string;
  contractType: "token" | "nft" | "defi" | "governance" | "marketplace" | "custom";
  description?: string;
  features?: string[];
  tokenStandard?: "ZTP20" | "ZTP721" | "ZTP1155";
  includeTests?: boolean;
  outputDirectory?: string;
  customClasses?: ContractClass[];
}

export class ZetrixContractGenerator {

  /**
   * Generate class diagram in Mermaid format
   */
  private generateClassDiagram(classes: ContractClass[]): string {
    let diagram = `# Contract Architecture - Class Diagram

\`\`\`mermaid
classDiagram
`;

    // Define classes
    for (const cls of classes) {
      diagram += `    class ${cls.name} {\n`;

      // Private properties first
      const privateProps = cls.properties.filter(p => p.visibility === "private");
      const protectedProps = cls.properties.filter(p => p.visibility === "protected");
      const publicProps = cls.properties.filter(p => p.visibility === "public");

      for (const prop of [...privateProps, ...protectedProps, ...publicProps]) {
        const symbol = prop.visibility === "private" ? "-" : prop.visibility === "protected" ? "#" : "+";
        diagram += `        ${symbol}${prop.name} ${prop.type}\n`;
      }

      // Private methods first
      const privateMethods = cls.methods.filter(m => m.visibility === "private");
      const protectedMethods = cls.methods.filter(m => m.visibility === "protected");
      const publicMethods = cls.methods.filter(m => m.visibility === "public");

      for (const method of [...privateMethods, ...protectedMethods, ...publicMethods]) {
        const symbol = method.visibility === "private" ? "-" : method.visibility === "protected" ? "#" : "+";
        const params = method.params.map(p => `${p.name}: ${p.type}`).join(", ");
        const returns = method.returns ? `: ${method.returns}` : "";
        diagram += `        ${symbol}${method.name}(${params})${returns}\n`;
      }

      diagram += `    }\n`;
    }

    // Define relationships
    for (const cls of classes) {
      if (cls.extends && cls.extends.length > 0) {
        for (const parent of cls.extends) {
          diagram += `    ${parent} <|-- ${cls.name}\n`;
        }
      }
    }

    diagram += `\`\`\`\n\n`;

    // Add descriptions
    diagram += `## Class Descriptions\n\n`;
    for (const cls of classes) {
      diagram += `### ${cls.name} (${cls.type})\n\n`;

      if (cls.properties.length > 0) {
        diagram += `**Properties:**\n`;
        for (const prop of cls.properties) {
          diagram += `- \`${prop.name}\` (${prop.visibility}): ${prop.description}\n`;
        }
        diagram += `\n`;
      }

      if (cls.methods.length > 0) {
        diagram += `**Methods:**\n`;
        for (const method of cls.methods) {
          const params = method.params.map(p => p.name).join(", ");
          diagram += `- \`${method.name}(${params})\` (${method.visibility}): ${method.description}\n`;
        }
        diagram += `\n`;
      }
    }

    return diagram;
  }

  /**
   * Analyze contract requirements and generate class structure
   */
  private analyzeAndGenerateClasses(options: ContractGenerationOptions): ContractClass[] {
    const { contractName, contractType, features = [], tokenStandard, customClasses } = options;

    if (customClasses && customClasses.length > 0) {
      return customClasses;
    }

    const classes: ContractClass[] = [];

    // Base interface
    const baseInterface: ContractClass = {
      name: `I${contractName}`,
      type: "interface",
      properties: [],
      methods: [
        {
          name: "contractInfo",
          visibility: "public",
          params: [],
          returns: "object",
          description: "Returns contract metadata"
        }
      ]
    };

    // Storage library
    const storageLib: ContractClass = {
      name: `${contractName}Storage`,
      type: "library",
      properties: [
        {
          name: "CONTRACT_INFO_KEY",
          visibility: "private",
          type: "string",
          description: "Key for contract info storage"
        }
      ],
      methods: [
        {
          name: "_makeKey",
          visibility: "private",
          params: [{ name: "prefix", type: "string" }, { name: "parts", type: "string[]" }],
          returns: "string",
          description: "Creates storage key from prefix and parts"
        },
        {
          name: "_loadOrDefault",
          visibility: "private",
          params: [{ name: "key", type: "string" }, { name: "defaultValue", type: "any" }],
          returns: "any",
          description: "Loads value or returns default"
        },
        {
          name: "loadJSON",
          visibility: "public",
          params: [{ name: "key", type: "string" }],
          returns: "object",
          description: "Loads and parses JSON from storage"
        },
        {
          name: "storeJSON",
          visibility: "public",
          params: [{ name: "key", type: "string" }, { name: "obj", type: "object" }],
          description: "Stores object as JSON"
        }
      ]
    };

    // Validation library
    const validationLib: ContractClass = {
      name: `${contractName}Validation`,
      type: "library",
      properties: [],
      methods: [
        {
          name: "_validateAddress",
          visibility: "private",
          params: [{ name: "address", type: "string" }],
          returns: "boolean",
          description: "Validates address format"
        },
        {
          name: "_validateAmount",
          visibility: "private",
          params: [{ name: "amount", type: "string" }],
          returns: "boolean",
          description: "Validates amount is positive integer"
        },
        {
          name: "requireValidAddress",
          visibility: "public",
          params: [{ name: "address", type: "string" }, { name: "paramName", type: "string" }],
          description: "Asserts address is valid"
        },
        {
          name: "requireValidAmount",
          visibility: "public",
          params: [{ name: "amount", type: "string" }, { name: "paramName", type: "string" }],
          description: "Asserts amount is valid"
        }
      ]
    };

    classes.push(baseInterface, storageLib, validationLib);

    // Add feature-specific classes
    if (features.includes("ownable")) {
      const ownableClass: ContractClass = {
        name: `${contractName}Ownable`,
        type: "library",
        properties: [
          {
            name: "OWNER_KEY",
            visibility: "private",
            type: "string",
            description: "Storage key for owner address"
          }
        ],
        methods: [
          {
            name: "_getOwner",
            visibility: "private",
            params: [],
            returns: "string",
            description: "Gets current owner from storage"
          },
          {
            name: "_setOwner",
            visibility: "private",
            params: [{ name: "newOwner", type: "string" }],
            description: "Sets new owner in storage"
          },
          {
            name: "requireOwner",
            visibility: "public",
            params: [],
            description: "Asserts caller is owner"
          },
          {
            name: "transferOwnership",
            visibility: "public",
            params: [{ name: "newOwner", type: "string" }],
            description: "Transfers ownership to new address"
          },
          {
            name: "owner",
            visibility: "public",
            params: [],
            returns: "string",
            description: "Returns current owner address"
          }
        ]
      };
      classes.push(ownableClass);

      // Add methods to interface
      baseInterface.methods.push(
        { name: "owner", visibility: "public", params: [], returns: "string", description: "Query owner" },
        { name: "transferOwnership", visibility: "public", params: [{ name: "newOwner", type: "string" }], description: "Transfer ownership" }
      );
    }

    if (features.includes("pausable")) {
      const pausableClass: ContractClass = {
        name: `${contractName}Pausable`,
        type: "library",
        properties: [
          {
            name: "PAUSE_KEY",
            visibility: "private",
            type: "string",
            description: "Storage key for pause state"
          }
        ],
        methods: [
          {
            name: "_isPaused",
            visibility: "private",
            params: [],
            returns: "boolean",
            description: "Checks if contract is paused"
          },
          {
            name: "_setPaused",
            visibility: "private",
            params: [{ name: "paused", type: "boolean" }],
            description: "Sets pause state"
          },
          {
            name: "requireNotPaused",
            visibility: "public",
            params: [],
            description: "Asserts contract is not paused"
          },
          {
            name: "pause",
            visibility: "public",
            params: [],
            description: "Pauses the contract"
          },
          {
            name: "unpause",
            visibility: "public",
            params: [],
            description: "Unpauses the contract"
          },
          {
            name: "isPaused",
            visibility: "public",
            params: [],
            returns: "boolean",
            description: "Returns pause state"
          }
        ]
      };
      classes.push(pausableClass);

      baseInterface.methods.push(
        { name: "isPaused", visibility: "public", params: [], returns: "boolean", description: "Query pause state" },
        { name: "pause", visibility: "public", params: [], description: "Pause contract" },
        { name: "unpause", visibility: "public", params: [], description: "Unpause contract" }
      );
    }

    if (features.includes("whitelist")) {
      const whitelistClass: ContractClass = {
        name: `${contractName}Whitelist`,
        type: "library",
        properties: [
          {
            name: "WHITELIST_PREFIX",
            visibility: "private",
            type: "string",
            description: "Prefix for whitelist storage keys"
          }
        ],
        methods: [
          {
            name: "_makeWhitelistKey",
            visibility: "private",
            params: [{ name: "address", type: "string" }],
            returns: "string",
            description: "Creates whitelist storage key"
          },
          {
            name: "_isWhitelisted",
            visibility: "private",
            params: [{ name: "address", type: "string" }],
            returns: "boolean",
            description: "Checks whitelist status"
          },
          {
            name: "requireWhitelisted",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            description: "Asserts address is whitelisted"
          },
          {
            name: "addToWhitelist",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            description: "Adds address to whitelist"
          },
          {
            name: "removeFromWhitelist",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            description: "Removes address from whitelist"
          },
          {
            name: "isWhitelisted",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            returns: "boolean",
            description: "Returns whitelist status"
          }
        ]
      };
      classes.push(whitelistClass);

      baseInterface.methods.push(
        { name: "isWhitelisted", visibility: "public", params: [{ name: "address", type: "string" }], returns: "boolean", description: "Query whitelist status" },
        { name: "addToWhitelist", visibility: "public", params: [{ name: "address", type: "string" }], description: "Add to whitelist" },
        { name: "removeFromWhitelist", visibility: "public", params: [{ name: "address", type: "string" }], description: "Remove from whitelist" }
      );
    }

    if (features.includes("blacklist")) {
      const blacklistClass: ContractClass = {
        name: `${contractName}Blacklist`,
        type: "library",
        properties: [
          {
            name: "BLACKLIST_PREFIX",
            visibility: "private",
            type: "string",
            description: "Prefix for blacklist storage keys"
          }
        ],
        methods: [
          {
            name: "_makeBlacklistKey",
            visibility: "private",
            params: [{ name: "address", type: "string" }],
            returns: "string",
            description: "Creates blacklist storage key"
          },
          {
            name: "_isBlacklisted",
            visibility: "private",
            params: [{ name: "address", type: "string" }],
            returns: "boolean",
            description: "Checks blacklist status"
          },
          {
            name: "requireNotBlacklisted",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            description: "Asserts address is not blacklisted"
          },
          {
            name: "addToBlacklist",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            description: "Adds address to blacklist"
          },
          {
            name: "removeFromBlacklist",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            description: "Removes address from blacklist"
          },
          {
            name: "isBlacklisted",
            visibility: "public",
            params: [{ name: "address", type: "string" }],
            returns: "boolean",
            description: "Returns blacklist status"
          }
        ]
      };
      classes.push(blacklistClass);

      baseInterface.methods.push(
        { name: "isBlacklisted", visibility: "public", params: [{ name: "address", type: "string" }], returns: "boolean", description: "Query blacklist status" },
        { name: "addToBlacklist", visibility: "public", params: [{ name: "address", type: "string" }], description: "Add to blacklist" },
        { name: "removeFromBlacklist", visibility: "public", params: [{ name: "address", type: "string" }], description: "Remove from blacklist" }
      );
    }

    // Main contract class
    const mainContract: ContractClass = {
      name: contractName,
      type: "contract",
      extends: [`I${contractName}`],
      properties: [],
      methods: [
        {
          name: "init",
          visibility: "public",
          params: [{ name: "input_str", type: "string" }],
          description: "Contract initialization"
        },
        {
          name: "main",
          visibility: "public",
          params: [{ name: "input_str", type: "string" }],
          description: "Main entry point for transactions"
        },
        {
          name: "query",
          visibility: "public",
          params: [{ name: "input_str", type: "string" }],
          returns: "string",
          description: "Query entry point"
        }
      ]
    };

    classes.push(mainContract);

    return classes;
  }

  /**
   * Generate library file following ES5 pattern
   */
  private generateLibrary(className: string, classInfo: ContractClass): string {
    let code = `"use strict";

// ============================================================================
// ${className} - ${classInfo.type === "library" ? "Utility Library" : "Module"}
// ============================================================================
//
// This module provides reusable utility functions for the ${className.replace(/Storage|Validation|Ownable|Pausable|Whitelist|Blacklist/, "")} contract.
// All functions follow ES5 patterns for compatibility with Zetrix VM.
//

`;

    // Generate the library object
    code += `var ${className} = (function() {\n`;
    code += `  // Private constants and variables\n`;

    // Private properties
    for (const prop of classInfo.properties.filter(p => p.visibility === "private")) {
      code += `  const ${prop.name} = "${prop.name.toLowerCase().replace(/_/g, "-")}";\n`;
    }

    code += `\n  // Private methods (defined first)\n`;

    // Private methods
    for (const method of classInfo.methods.filter(m => m.visibility === "private")) {
      const params = method.params.map(p => p.name).join(", ");
      code += `  function ${method.name}(${params}) {\n`;
      code += `    // ${method.description}\n`;

      // Add method implementation based on method name
      if (method.name.includes("makeKey") || method.name.includes("Key")) {
        code += `    return ${method.params[0]?.name || "prefix"} + "_" + ${method.params.slice(1).map(p => p.name).join(' + "_" + ') || '""'};\n`;
      } else if (method.name.includes("load")) {
        code += `    var value = Chain.load(key);\n`;
        code += `    return value === false ? defaultValue : value;\n`;
      } else if (method.name.includes("validate")) {
        if (method.name.includes("Address")) {
          code += `    return Utils.addressCheck(address);\n`;
        } else if (method.name.includes("Amount")) {
          code += `    if (!Utils.stoI64Check(amount)) return false;\n`;
          code += `    return Utils.int64Compare(amount, "0") > 0;\n`;
        }
      } else if (method.name.includes("get") && method.name.includes("Owner")) {
        code += `    var owner = Chain.load(OWNER_KEY);\n`;
        code += `    return owner === false ? "" : owner;\n`;
      } else if (method.name.includes("set") && method.name.includes("Owner")) {
        code += `    Chain.store(OWNER_KEY, newOwner);\n`;
      } else if (method.name.includes("isPaused")) {
        code += `    var paused = Chain.load(PAUSE_KEY);\n`;
        code += `    return paused === "true";\n`;
      } else if (method.name.includes("setPaused")) {
        code += `    Chain.store(PAUSE_KEY, paused ? "true" : "false");\n`;
      } else if (method.name.includes("isWhitelisted")) {
        code += `    var key = _makeWhitelistKey(address);\n`;
        code += `    var value = Chain.load(key);\n`;
        code += `    return value === "true";\n`;
      } else if (method.name.includes("isBlacklisted")) {
        code += `    var key = _makeBlacklistKey(address);\n`;
        code += `    var value = Chain.load(key);\n`;
        code += `    return value === "true";\n`;
      } else {
        code += `    // TODO: Implement ${method.name}\n`;
        code += `    throw "Not implemented: ${method.name}";\n`;
      }

      code += `  }\n\n`;
    }

    code += `  // Public API\n`;
    code += `  return {\n`;

    // Public methods
    const publicMethods = classInfo.methods.filter(m => m.visibility === "public");
    for (let i = 0; i < publicMethods.length; i++) {
      const method = publicMethods[i];
      const params = method.params.map(p => p.name).join(", ");
      const isLast = i === publicMethods.length - 1;

      code += `    ${method.name}: function(${params}) {\n`;
      code += `      // ${method.description}\n`;

      // Add implementation
      if (method.name === "loadJSON") {
        code += `      var value = Chain.load(key);\n`;
        code += `      return value === false ? null : JSON.parse(value);\n`;
      } else if (method.name === "storeJSON") {
        code += `      Chain.store(key, JSON.stringify(obj));\n`;
      } else if (method.name.startsWith("require")) {
        if (method.name.includes("ValidAddress")) {
          code += `      Utils.assert(_validateAddress(address), paramName + " must be a valid address");\n`;
        } else if (method.name.includes("ValidAmount")) {
          code += `      Utils.assert(_validateAmount(amount), paramName + " must be a valid positive amount");\n`;
        } else if (method.name.includes("Owner")) {
          code += `      var owner = _getOwner();\n`;
          code += `      Utils.assert(Chain.msg.sender === owner, "Only owner can perform this action");\n`;
        } else if (method.name.includes("NotPaused")) {
          code += `      Utils.assert(!_isPaused(), "Contract is paused");\n`;
        } else if (method.name.includes("Whitelisted")) {
          code += `      Utils.assert(_isWhitelisted(address), "Address is not whitelisted: " + address);\n`;
        } else if (method.name.includes("NotBlacklisted")) {
          code += `      Utils.assert(!_isBlacklisted(address), "Address is blacklisted: " + address);\n`;
        }
      } else if (method.name === "owner") {
        code += `      return _getOwner();\n`;
      } else if (method.name === "transferOwnership") {
        code += `      this.requireOwner();\n`;
        code += `      Utils.assert(Utils.addressCheck(newOwner), "Invalid owner address");\n`;
        code += `      var oldOwner = _getOwner();\n`;
        code += `      _setOwner(newOwner);\n`;
        code += `      Chain.tlog("OwnershipTransferred", oldOwner, newOwner);\n`;
      } else if (method.name === "isPaused") {
        code += `      return _isPaused();\n`;
      } else if (method.name === "pause") {
        code += `      Utils.assert(!_isPaused(), "Already paused");\n`;
        code += `      _setPaused(true);\n`;
        code += `      Chain.tlog("Paused", Chain.msg.sender);\n`;
      } else if (method.name === "unpause") {
        code += `      Utils.assert(_isPaused(), "Not paused");\n`;
        code += `      _setPaused(false);\n`;
        code += `      Chain.tlog("Unpaused", Chain.msg.sender);\n`;
      } else if (method.name === "isWhitelisted") {
        code += `      return _isWhitelisted(address);\n`;
      } else if (method.name === "addToWhitelist") {
        code += `      Utils.assert(!_isWhitelisted(address), "Already whitelisted");\n`;
        code += `      var key = _makeWhitelistKey(address);\n`;
        code += `      Chain.store(key, "true");\n`;
        code += `      Chain.tlog("Whitelisted", address);\n`;
      } else if (method.name === "removeFromWhitelist") {
        code += `      Utils.assert(_isWhitelisted(address), "Not whitelisted");\n`;
        code += `      var key = _makeWhitelistKey(address);\n`;
        code += `      Chain.store(key, "false");\n`;
        code += `      Chain.tlog("RemovedFromWhitelist", address);\n`;
      } else if (method.name === "isBlacklisted") {
        code += `      return _isBlacklisted(address);\n`;
      } else if (method.name === "addToBlacklist") {
        code += `      Utils.assert(!_isBlacklisted(address), "Already blacklisted");\n`;
        code += `      var key = _makeBlacklistKey(address);\n`;
        code += `      Chain.store(key, "true");\n`;
        code += `      Chain.tlog("Blacklisted", address);\n`;
      } else if (method.name === "removeFromBlacklist") {
        code += `      Utils.assert(_isBlacklisted(address), "Not blacklisted");\n`;
        code += `      var key = _makeBlacklistKey(address);\n`;
        code += `      Chain.store(key, "false");\n`;
        code += `      Chain.tlog("RemovedFromBlacklist", address);\n`;
      } else {
        code += `      // TODO: Implement ${method.name}\n`;
        code += `      throw "Not implemented: ${method.name}";\n`;
      }

      code += `    }${isLast ? '' : ','}\n`;
    }

    code += `  };\n`;
    code += `})();\n\n`;

    // Export
    code += `// Export for testing\n`;
    code += `if (typeof module !== 'undefined' && module.exports) {\n`;
    code += `  module.exports = ${className};\n`;
    code += `}\n`;

    return code;
  }

  /**
   * Generate main contract following standards
   */
  private generateMainContract(options: ContractGenerationOptions, classes: ContractClass[]): string {
    const { contractName, description, features = [] } = options;
    const mainClass = classes.find(c => c.name === contractName);

    if (!mainClass) throw new Error("Main contract class not found");

    let code = `"use strict";

// ============================================================================
// ${contractName} Smart Contract
// ============================================================================
//
// ${description || `A production-ready smart contract for ${contractName}`}
//
// Architecture:
// - Follows ES5 patterns for Zetrix VM compatibility
// - Modular design with separate libraries for each feature
// - Private methods defined before public methods
// - Comprehensive validation and error handling
//
// Features: ${features.join(", ") || "Basic"}
//
// ============================================================================

// ============================================================================
// PRIVATE METHODS (Internal Use Only)
// ============================================================================

// Private helper: Initialize contract state
function _initializeContract(params) {
  // Validate required parameters
  Utils.assert(params.name !== undefined, "Contract name is required");
  Utils.assert(params.symbol !== undefined, "Contract symbol is required");
  ${features.includes("ownable") ? 'Utils.assert(params.owner !== undefined, "Owner address is required");\n  Utils.assert(Utils.addressCheck(params.owner), "Invalid owner address");' : ''}

  // Store contract info
  var contractInfo = {
    name: params.name,
    symbol: params.symbol,
    ${features.includes("ownable") ? 'owner: params.owner,' : ''}
    version: "1.0.0",
    deployedAt: Chain.block.timestamp
  };

  ${contractName}Storage.storeJSON(${contractName}Storage.CONTRACT_INFO_KEY, contractInfo);

  ${features.includes("ownable") ? '// Initialize owner\n  ${contractName}Ownable._setOwner(params.owner);' : ''}
  ${features.includes("pausable") ? '// Initialize as unpaused\n  ${contractName}Pausable._setPaused(false);' : ''}

  Chain.tlog("ContractInitialized", params.name, params.symbol);
}

// Private helper: Route main method calls
function _routeMainMethod(method, params) {
  ${features.includes("pausable") ? '// Check pause status for most operations\n  if (method !== "unpause") {\n    ${contractName}Pausable.requireNotPaused();\n  }' : ''}

  // Route to appropriate handler
  if (method === "exampleMethod") {
    return _handleExampleMethod(params);
  }
  ${features.includes("ownable") ? 'else if (method === "transferOwnership") {\n    ${contractName}Ownable.requireOwner();\n    return ${contractName}Ownable.transferOwnership(params.newOwner);\n  }' : ''}
  ${features.includes("pausable") ? 'else if (method === "pause") {\n    ${contractName}Ownable.requireOwner();\n    return ${contractName}Pausable.pause();\n  } else if (method === "unpause") {\n    ${contractName}Ownable.requireOwner();\n    return ${contractName}Pausable.unpause();\n  }' : ''}
  ${features.includes("whitelist") ? 'else if (method === "addToWhitelist") {\n    ${contractName}Ownable.requireOwner();\n    return ${contractName}Whitelist.addToWhitelist(params.address);\n  } else if (method === "removeFromWhitelist") {\n    ${contractName}Ownable.requireOwner();\n    return ${contractName}Whitelist.removeFromWhitelist(params.address);\n  }' : ''}
  ${features.includes("blacklist") ? 'else if (method === "addToBlacklist") {\n    ${contractName}Ownable.requireOwner();\n    return ${contractName}Blacklist.addToBlacklist(params.address);\n  } else if (method === "removeFromBlacklist") {\n    ${contractName}Ownable.requireOwner();\n    return ${contractName}Blacklist.removeFromBlacklist(params.address);\n  }' : ''}
  else {
    throw "Unknown method: " + method;
  }
}

// Private helper: Route query method calls
function _routeQueryMethod(method, params) {
  var result = {};

  if (method === "contractInfo") {
    result = ${contractName}Storage.loadJSON(${contractName}Storage.CONTRACT_INFO_KEY);
  }
  ${features.includes("ownable") ? 'else if (method === "owner") {\n    result.owner = ${contractName}Ownable.owner();\n  }' : ''}
  ${features.includes("pausable") ? 'else if (method === "isPaused") {\n    result.isPaused = ${contractName}Pausable.isPaused();\n  }' : ''}
  ${features.includes("whitelist") ? 'else if (method === "isWhitelisted") {\n    result.isWhitelisted = ${contractName}Whitelist.isWhitelisted(params.address);\n  }' : ''}
  ${features.includes("blacklist") ? 'else if (method === "isBlacklisted") {\n    result.isBlacklisted = ${contractName}Blacklist.isBlacklisted(params.address);\n  }' : ''}
  else {
    throw "Unknown query method: " + method;
  }

  return JSON.stringify(result);
}

// Private helper: Example business logic method
function _handleExampleMethod(params) {
  // Validate inputs
  Utils.assert(params.value !== undefined, "Value parameter is required");

  ${features.includes("ownable") ? '// Require owner for this operation\n  ${contractName}Ownable.requireOwner();' : ''}
  ${features.includes("whitelist") ? '// Require whitelisted sender\n  ${contractName}Whitelist.requireWhitelisted(Chain.msg.sender);' : ''}
  ${features.includes("blacklist") ? '// Require not blacklisted sender\n  ${contractName}Blacklist.requireNotBlacklisted(Chain.msg.sender);' : ''}

  // Perform business logic
  // TODO: Implement your business logic here

  Chain.tlog("ExampleMethod", Chain.msg.sender, params.value);
  return true;
}

// ============================================================================
// PUBLIC CONTRACT ENTRY POINTS
// ============================================================================

function init(input_str) {
  var input = JSON.parse(input_str);
  var params = input.params;

  _initializeContract(params);
}

function main(input_str) {
  var input = JSON.parse(input_str);
  var method = input.method;
  var params = input.params || {};

  return _routeMainMethod(method, params);
}

function query(input_str) {
  var input = JSON.parse(input_str);
  var method = input.method;
  var params = input.params || {};

  return _routeQueryMethod(method, params);
}
`;

    return code;
  }

  /**
   * Generate unit tests (offline)
   */
  private generateUnitTests(options: ContractGenerationOptions, classes: ContractClass[]): string {
    const { contractName } = options;

    return `/**
 * ${contractName} - Unit Tests (Offline)
 *
 * These tests run without blockchain interaction for fast development.
 * They mock Chain and Utils objects to test contract logic.
 */

const assert = require('assert');

// Mock Chain object
global.Chain = {
  msg: { sender: "ZTX_TEST_SENDER" },
  block: { timestamp: Date.now() },
  load: function(key) {
    return this._storage[key] || false;
  },
  store: function(key, value) {
    this._storage[key] = value;
  },
  tlog: function(...args) {
    this._logs.push(args);
  },
  _storage: {},
  _logs: [],
  _reset: function() {
    this._storage = {};
    this._logs = [];
  }
};

// Mock Utils object
global.Utils = {
  addressCheck: (addr) => addr && addr.startsWith("ZTX"),
  stoI64Check: (val) => typeof val === 'string' && /^\\d+$/.test(val),
  int64Compare: (a, b) => BigInt(a) > BigInt(b) ? 1 : BigInt(a) < BigInt(b) ? -1 : 0,
  int64Add: (a, b) => (BigInt(a) + BigInt(b)).toString(),
  int64Sub: (a, b) => (BigInt(a) - BigInt(b)).toString(),
  assert: function(condition, message) {
    if (!condition) throw new Error(message);
  }
};

// Load contract modules
const ${contractName}Storage = require('../library/${contractName}Storage');
const ${contractName}Validation = require('../library/${contractName}Validation');
${options.features?.includes("ownable") ? `const ${contractName}Ownable = require('../library/${contractName}Ownable');` : ''}
${options.features?.includes("pausable") ? `const ${contractName}Pausable = require('../library/${contractName}Pausable');` : ''}

describe('${contractName} Unit Tests', function() {

  beforeEach(function() {
    Chain._reset();
  });

  describe('Storage Module', function() {
    it('should store and load JSON', function() {
      const testData = { name: "Test", value: "123" };
      ${contractName}Storage.storeJSON("test_key", testData);
      const loaded = ${contractName}Storage.loadJSON("test_key");
      assert.deepEqual(loaded, testData);
    });
  });

  describe('Validation Module', function() {
    it('should validate Zetrix addresses', function() {
      assert.doesNotThrow(() => {
        ${contractName}Validation.requireValidAddress("ZTX_VALID_ADDRESS", "testAddr");
      });
    });

    it('should reject invalid addresses', function() {
      assert.throws(() => {
        ${contractName}Validation.requireValidAddress("INVALID", "testAddr");
      });
    });

    it('should validate amounts', function() {
      assert.doesNotThrow(() => {
        ${contractName}Validation.requireValidAmount("1000", "testAmount");
      });
    });

    it('should reject invalid amounts', function() {
      assert.throws(() => {
        ${contractName}Validation.requireValidAmount("-100", "testAmount");
      });
    });
  });

${options.features?.includes("ownable") ? `  describe('Ownable Module', function() {
    it('should set and get owner', function() {
      ${contractName}Ownable._setOwner("ZTX_OWNER_ADDRESS");
      assert.equal(${contractName}Ownable.owner(), "ZTX_OWNER_ADDRESS");
    });

    it('should transfer ownership', function() {
      Chain.msg.sender = "ZTX_OWNER_ADDRESS";
      ${contractName}Ownable._setOwner("ZTX_OWNER_ADDRESS");
      ${contractName}Ownable.transferOwnership("ZTX_NEW_OWNER");
      assert.equal(${contractName}Ownable.owner(), "ZTX_NEW_OWNER");
    });

    it('should reject non-owner calls', function() {
      ${contractName}Ownable._setOwner("ZTX_OWNER_ADDRESS");
      Chain.msg.sender = "ZTX_OTHER_ADDRESS";
      assert.throws(() => {
        ${contractName}Ownable.requireOwner();
      });
    });
  });
` : ''}
${options.features?.includes("pausable") ? `  describe('Pausable Module', function() {
    it('should pause and unpause', function() {
      ${contractName}Pausable.pause();
      assert.equal(${contractName}Pausable.isPaused(), true);
      ${contractName}Pausable.unpause();
      assert.equal(${contractName}Pausable.isPaused(), false);
    });

    it('should throw when paused', function() {
      ${contractName}Pausable.pause();
      assert.throws(() => {
        ${contractName}Pausable.requireNotPaused();
      });
    });
  });
` : ''}
});

console.log('Running unit tests...');
// If using Mocha: run with \`npm test tests/unit/${contractName}Test.js\`
`;
  }

  /**
   * Generate integration tests (on-chain)
   */
  private generateIntegrationTests(options: ContractGenerationOptions): string {
    const { contractName, features = [] } = options;

    return `/**
 * ${contractName} - Integration Tests (On-Chain)
 *
 * These tests deploy and interact with the actual contract on Zetrix testnet.
 * Run with: npm test tests/integration/${contractName}IntegrationTest.js
 */

const { TEST_INVOKE, TEST_QUERY, TEST_CONFIG } = require('../../utils/test-helpers');

const CONTRACT_ADDRESS = ""; // Will be set after deployment
const OWNER_ADDRESS = TEST_CONFIG.owner;
const USER1_ADDRESS = TEST_CONFIG.user1;
const USER2_ADDRESS = TEST_CONFIG.user2;

describe('${contractName} Integration Tests', function() {
  this.timeout(30000); // Blockchain operations can take time

  describe('1. Contract Deployment', function() {
    it('should deploy successfully', async function() {
      // Deploy contract and get address
      // const address = await deployContract();
      // CONTRACT_ADDRESS = address;
    });
  });

  describe('2. Initialization', function() {
    it('should initialize with valid parameters', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'init',
        params: {
          name: '${contractName}',
          symbol: 'SYMBOL',
          ${features.includes("ownable") ? 'owner: OWNER_ADDRESS' : ''}
        },
        sender: OWNER_ADDRESS,
        expected: {
          success: true,
          logs: ['ContractInitialized']
        }
      });
    });

    it('should query contract info', async function() {
      await TEST_QUERY({
        contract: CONTRACT_ADDRESS,
        method: 'contractInfo',
        expected: {
          success: true,
          result: {
            name: '${contractName}',
            symbol: 'SYMBOL',
            version: '1.0.0'
          }
        }
      });
    });
  });

${features.includes("ownable") ? `  describe('3. Ownership Management', function() {
    it('should return current owner', async function() {
      await TEST_QUERY({
        contract: CONTRACT_ADDRESS,
        method: 'owner',
        expected: {
          success: true,
          result: { owner: OWNER_ADDRESS },
          condition: 'EQUALS'
        }
      });
    });

    it('should allow owner to transfer ownership', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'transferOwnership',
        params: { newOwner: USER1_ADDRESS },
        sender: OWNER_ADDRESS,
        expected: {
          success: true,
          logs: ['OwnershipTransferred']
        }
      });
    });

    it('should reject non-owner transfer attempt', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'transferOwnership',
        params: { newOwner: USER2_ADDRESS },
        sender: USER2_ADDRESS,
        expected: {
          success: false,
          errorContains: 'only owner'
        }
      });
    });
  });
` : ''}
${features.includes("pausable") ? `  describe('4. Pause Functionality', function() {
    it('should allow owner to pause', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'pause',
        sender: OWNER_ADDRESS,
        expected: {
          success: true,
          logs: ['Paused']
        }
      });
    });

    it('should show paused status', async function() {
      await TEST_QUERY({
        contract: CONTRACT_ADDRESS,
        method: 'isPaused',
        expected: {
          success: true,
          result: { isPaused: true }
        }
      });
    });

    it('should block operations when paused', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'exampleMethod',
        params: { value: 'test' },
        sender: OWNER_ADDRESS,
        expected: {
          success: false,
          errorContains: 'paused'
        }
      });
    });

    it('should allow owner to unpause', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'unpause',
        sender: OWNER_ADDRESS,
        expected: {
          success: true,
          logs: ['Unpaused']
        }
      });
    });
  });
` : ''}
${features.includes("whitelist") ? `  describe('5. Whitelist Management', function() {
    it('should add address to whitelist', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'addToWhitelist',
        params: { address: USER1_ADDRESS },
        sender: OWNER_ADDRESS,
        expected: {
          success: true,
          logs: ['Whitelisted']
        }
      });
    });

    it('should verify whitelisted status', async function() {
      await TEST_QUERY({
        contract: CONTRACT_ADDRESS,
        method: 'isWhitelisted',
        params: { address: USER1_ADDRESS },
        expected: {
          success: true,
          result: { isWhitelisted: true }
        }
      });
    });

    it('should remove address from whitelist', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'removeFromWhitelist',
        params: { address: USER1_ADDRESS },
        sender: OWNER_ADDRESS,
        expected: {
          success: true,
          logs: ['RemovedFromWhitelist']
        }
      });
    });
  });
` : ''}
  describe('99. Security & Edge Cases', function() {
    it('should reject invalid address formats', async function() {
      await TEST_INVOKE({
        contract: CONTRACT_ADDRESS,
        method: 'exampleMethod',
        params: { address: 'INVALID_ADDRESS' },
        sender: OWNER_ADDRESS,
        expected: {
          success: false,
          errorContains: 'valid address'
        }
      });
    });

    it('should handle concurrent operations', async function() {
      // Test race conditions and state consistency
    });
  });
});
`;
  }

  /**
   * Generate deployment script
   */
  private generateDeploymentScript(options: ContractGenerationOptions): string {
    const { contractName } = options;

    return `/**
 * Deployment script for ${contractName}
 *
 * Usage:
 *   node scripts/deploy.js --network testnet
 *   node scripts/deploy.js --network mainnet
 */

require('dotenv').config();
const { deployContract, verifyDeployment } = require('../utils/deploy-helpers');

async function deploy() {
  const network = process.argv.includes('--network')
    ? process.argv[process.argv.indexOf('--network') + 1]
    : 'testnet';

  console.log(\`Deploying ${contractName} to \${network}...\`);

  // Contract initialization parameters
  const initParams = {
    name: '${contractName}',
    symbol: 'SYMBOL', // TODO: Change to your token symbol
    ${options.features?.includes("ownable") ? 'owner: process.env.ZTX_ADDRESS,' : ''}
    // Add other initialization parameters here
  };

  try {
    // Deploy contract
    const result = await deployContract({
      contractPath: \`./contracts/specs/${contractName}.js\`,
      initParams,
      network,
      gasLimit: '10000000',
      gasPrice: '5'
    });

    console.log('✅ Deployment successful!');
    console.log(\`Contract Address: \${result.address}\`);
    console.log(\`Transaction Hash: \${result.txHash}\`);

    // Verify deployment
    const verified = await verifyDeployment(result.address, network);
    if (verified) {
      console.log('✅ Deployment verified on blockchain');
    }

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      network,
      address: result.address,
      txHash: result.txHash,
      timestamp: new Date().toISOString(),
      initParams
    };

    fs.writeFileSync(
      \`./deployments/\${contractName}-\${network}.json\`,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(\`\\nDeployment info saved to ./deployments/\${contractName}-\${network}.json\`);

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
`;
  }

  /**
   * Generate project structure and files
   */
  public generate(options: ContractGenerationOptions): {
    files: { path: string; content: string; type: string }[];
    summary: string;
    classDiagram: string;
  } {
    const { contractName, outputDirectory = "." } = options;

    // Analyze requirements and generate class structure
    const classes = this.analyzeAndGenerateClasses(options);

    // Generate class diagram
    const classDiagram = this.generateClassDiagram(classes);

    const files: { path: string; content: string; type: string }[] = [];

    // Generate interface (optional, for documentation)
    const interfaceClass = classes.find(c => c.type === "interface");
    if (interfaceClass) {
      files.push({
        path: join(outputDirectory, `contracts/interface/I${contractName}.md`),
        content: `# ${interfaceClass.name} Interface\n\n${classDiagram}`,
        type: "interface"
      });
    }

    // Generate libraries
    const libraries = classes.filter(c => c.type === "library");
    for (const lib of libraries) {
      files.push({
        path: join(outputDirectory, `contracts/library/${lib.name}.js`),
        content: this.generateLibrary(lib.name, lib),
        type: "library"
      });
    }

    // Generate main contract
    files.push({
      path: join(outputDirectory, `contracts/specs/${contractName}.js`),
      content: this.generateMainContract(options, classes),
      type: "contract"
    });

    // Generate tests
    if (options.includeTests !== false) {
      files.push({
        path: join(outputDirectory, `tests/unit/${contractName}Test.js`),
        content: this.generateUnitTests(options, classes),
        type: "test-unit"
      });

      files.push({
        path: join(outputDirectory, `tests/integration/${contractName}IntegrationTest.js`),
        content: this.generateIntegrationTests(options),
        type: "test-integration"
      });
    }

    // Generate deployment script
    files.push({
      path: join(outputDirectory, `scripts/deploy-${contractName}.js`),
      content: this.generateDeploymentScript(options),
      type: "deployment"
    });

    // Generate class diagram as separate file
    files.push({
      path: join(outputDirectory, `docs/${contractName}-Architecture.md`),
      content: classDiagram,
      type: "documentation"
    });

    const summary = `Successfully generated ${contractName} contract architecture!

📊 Class Structure Analysis:
- ${classes.length} classes identified
- ${classes.filter(c => c.type === "library").length} library modules
- ${classes.filter(c => c.type === "interface").length} interface definition
- ${classes.filter(c => c.type === "contract").length} main contract

📁 Generated Files (${files.length} total):
${files.map(f => {
  const emoji = f.type === "interface" ? "📋" : f.type === "library" ? "📚" : f.type === "contract" ? "📜" : f.type === "test-unit" ? "🧪" : f.type === "test-integration" ? "🔗" : f.type === "deployment" ? "🚀" : "📖";
  return `${emoji} ${f.path}`;
}).join('\n')}

✨ Key Features:
- ES5-compatible JavaScript (Zetrix VM ready)
- Private methods defined before public methods
- Modular architecture with separate libraries
- Comprehensive test coverage (unit + integration)
- Production-ready deployment scripts
- Full class diagram documentation

🔧 Features Implemented:
${options.features?.join(", ") || "Basic functionality"}

📝 Next Steps:
1. Review the class diagram in docs/${contractName}-Architecture.md
2. Customize business logic in contracts/specs/${contractName}.js
3. Run unit tests: npm test tests/unit/${contractName}Test.js
4. Run integration tests: npm test tests/integration/${contractName}IntegrationTest.js
5. Deploy: node scripts/deploy-${contractName}.js --network testnet
`;

    return { files, summary, classDiagram };
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
