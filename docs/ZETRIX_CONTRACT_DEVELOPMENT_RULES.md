# Zetrix Smart Contract Development Rules

**CRITICAL: These rules MUST be followed for ALL contract generation requests**

## Rule 1: Project Initialization

**ALWAYS use npx create-zetrix-tool:**
```bash
npx create-zetrix-tool <CONTRACT_NAME>
cd <CONTRACT_NAME>
npm install
```

**NEVER manually create folder structure** - The official tool provides:
- Complete project structure with all utilities
- Official BasicOperation, merge.js, deploy/upgrade scripts
- Testing infrastructure (unit and integration)
- Example contracts (ZTP20, ZTP721, ZTP1155)

## Rule 2: File Organization

### Main Contract Location
**MUST be in contracts/ root, NOT in specs/ folder:**
```
✅ CORRECT: contracts/GovernanceDAO.js
❌ WRONG:   contracts/specs/GovernanceDAO.js
```

### Library Test Specs
**MUST be in contracts/specs/ folder:**
```
✅ CORRECT: contracts/specs/proposal-management-spec.js
❌ WRONG:   contracts/library/proposal-management-spec.js
```

### Complete Structure
```
contracts/
├── YourMainContract.js          # Main deployable contract (ROOT!)
├── library/
│   ├── your-library.js           # Reusable library
│   └── another-library.js
└── specs/
    ├── your-library-spec.js      # Test spec for library
    └── another-library-spec.js
```

## Rule 3: Environment Configuration

### .env File - NODE_URL Format
**CRITICAL: Remove https:// protocol from NODE_URL:**

```bash
✅ CORRECT:
NODE_URL=test-node.zetrix.com
TESTNET_RPC_URL=test-node.zetrix.com
MAINNET_RPC_URL=node.zetrix.com

❌ WRONG:
NODE_URL=https://test-node.zetrix.com  # SDK adds https:// automatically
```

**Reason:** The zetrix-sdk-nodejs automatically adds the protocol. Including it causes connection errors.

## Rule 4: Loop Syntax - Zetrix JSLint Requirements

### ✅ CORRECT - Loop Pattern:
```javascript
// Declare iterator variable first
let i;
// Use separate initialization, i += 1 (NOT i++)
for (i = 0; i < array.length; i += 1) {
    // Loop body
}
```

### ❌ WRONG - Common Mistakes:
```javascript
// Don't use inline declaration
for (let i = 0; i < array.length; i++) { }  // WRONG!

// Don't use i++
for (let i = 0; i < array.length; i++) { }  // WRONG!

// Don't use var in loop
for (var i = 0; i < array.length; i += 1) { }  // WRONG!
```

**Reason:** Zetrix blockchain JSLint validator requires:
1. Variable declared on separate line with `let`
2. Iterator increment using `i += 1` not `i++`
3. This is the official pattern used in ZTP1155 and other token contracts

## Rule 5: Array Validation - No Array.isArray()

### ✅ CORRECT - Check .length property:
```javascript
if (!params.targets || !params.targets.length || params.targets.length === 0) {
    return { valid: false, error: 'Invalid targets' };
}

// Check array length match
if (params.values.length !== params.targets.length) {
    return { valid: false, error: 'Array length mismatch' };
}
```

### ❌ WRONG - Using Array.isArray():
```javascript
if (!Array.isArray(params.targets)) { }  // WRONG! Undeclared 'Array'
```

**Reason:** Zetrix VM doesn't allow access to global `Array` object. Use `.length` property checks instead.

## Rule 6: Function Declaration Order - Avoid Forward References

### ✅ CORRECT - Define functions before use:
```javascript
const MyLibrary = function () {
    // Define helper functions FIRST
    const _helperFunction = function() {
        // Implementation
    };

    const _anotherHelper = function() {
        // Implementation
    };

    // Then define functions that use them
    const _mainFunction = function() {
        _helperFunction();  // OK - defined above
        _anotherHelper();   // OK - defined above
    };

    // Public API
    self.publicMethod = function() {
        _mainFunction();
    };
};
```

### ❌ WRONG - Forward references:
```javascript
const _mainFunction = function() {
    _helperFunction();  // ERROR: '_helperFunction' is out of scope
};

const _helperFunction = function() {  // Defined too late!
    // Implementation
};
```

**Reason:** Zetrix JSLint validator doesn't allow forward references. All functions must be declared before they are called.

## Rule 7: Code Pattern - ES5 Constructor (NOT IIFE)

### ✅ CORRECT - ES5 Constructor Pattern:
```javascript
const MyLibrary = function () {
    const BasicOperationUtil = new BasicOperation();
    const self = this;

    // Private methods
    const _privateMethod = function() {
        // Implementation
    };

    // Public methods
    self.publicMethod = function() {
        // Can call _privateMethod()
    };
};
```

### ❌ WRONG - IIFE Pattern:
```javascript
var MyLibrary = (function() {
    return {
        publicMethod: function() {}
    };
})();
```

## Rule 8: Storage Operations - ALWAYS Use BasicOperation

### ✅ CORRECT - Using BasicOperation:
```javascript
const BasicOperationUtil = new BasicOperation();

// Store object
BasicOperationUtil.saveObj(key, objectValue);

// Load object
let obj = BasicOperationUtil.loadObj(key);
if (obj === false) {
    // Not found
}

// Build composite keys
let key = BasicOperationUtil.getKey('prefix', param1, param2, param3);
// Results in: 'prefix_param1_param2_param3'
```

### ❌ WRONG - Direct Chain.store for objects:
```javascript
Chain.store('myObj', JSON.stringify(obj)); // Inconsistent!
```

### Exception - Simple string values:
```javascript
// OK for simple strings
Chain.store('simpleKey', 'stringValue');
let value = Chain.load('simpleKey');
```

## Rule 9: Reuse Existing Libraries

**ALWAYS check and reuse official libraries:**

### Available from template:
- `utils/basic-operation.js` - **MUST USE** for object storage
- `library/pausable.js` - Emergency pause
- `library/nonces.js` - Nonce management
- `library/math.js` - 256-bit arithmetic
- `library/bytes.js` - Byte manipulation
- `library/logic-op.js` - Logic operations

### Token Standards:
- `library/ztp20/*` - Fungible tokens
- `library/ztp721/*` - NFTs
- `library/ztp1155/*` - Multi-token

**NEVER recreate what already exists!**

## Rule 10: Main Contract Structure

**MUST follow this exact pattern:**

```javascript
'use strict';

import 'library/my-library';
import 'library/pausable';

const MyLib = new MyLibrary();
const PausableMgmt = new Pausable();

function init(input) {
    let params = JSON.parse(input).params;

    // Validate and initialize
    Utils.assert(params.name, 'Name required');
    Chain.store('name', params.name);

    return true;
}

// Individual method functions
function myMethod(paramObj) {
    PausableMgmt.requireNotPaused();
    return MyLib.doSomething(paramObj.value);
}

function myQuery(paramObj) {
    return MyLib.getSomething(paramObj.id);
}

function main(input_str) {
    let funcList = {
        'myMethod': myMethod
    };

    let inputObj = JSON.parse(input_str);
    Utils.assert(
        funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function',
        'Cannot find func:' + inputObj.method
    );
    funcList[inputObj.method](inputObj.params);
}

function query(input_str) {
    let funcList = {
        'myQuery': myQuery
    };

    let inputObj = JSON.parse(input_str);
    Utils.assert(
        funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function',
        'Cannot find func:' + inputObj.method
    );
    return JSON.stringify(funcList[inputObj.method](inputObj.params));
}
```

**Key Requirements:**
- ✅ Use `import` statements (resolved by merge.js)
- ✅ Instantiate libraries at top
- ✅ Define individual method functions
- ✅ Use `funcList` routing in main/query
- ✅ NEVER use switch-case for routing

## Rule 11: Library Test Spec Pattern

**Create in contracts/specs/ for EACH library:**

```javascript
'use strict';

import 'library/my-library';

const MyLib = new MyLibrary();

function init() {
    // Initialize test data
    Chain.store('testKey', 'testValue');
    Chain.tlog('MyLibrarySpecInitialized');
    return true;
}

function testMethod(paramObj) {
    return MyLib.publicMethod(paramObj.param1);
}

function main(input_str) {
    let funcList = {
        'testMethod': testMethod
    };

    let inputObj = JSON.parse(input_str);
    Utils.assert(
        funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function',
        'Cannot find func:' + inputObj.method
    );
    funcList[inputObj.method](inputObj.params);
}

function query(input_str) {
    let funcList = {
        'testQuery': function(paramObj) {
            return MyLib.queryMethod(paramObj.id);
        }
    };

    let inputObj = JSON.parse(input_str);
    Utils.assert(
        funcList.hasOwnProperty(inputObj.method) && typeof funcList[inputObj.method] === 'function',
        'Cannot find func:' + inputObj.method
    );
    return JSON.stringify(funcList[inputObj.method](inputObj.params));
}
```

## Rule 12: Token Standard Contracts - Implement Interfaces

**For ZTP20/ZTP721/ZTP1155, MUST implement proper interfaces:**

```javascript
import 'interface/IZEP165';
import 'interface/ztp20/IZTP20';
import 'interface/ztp20/IZTP20Metadata';

const ZTP20Inst = new ZTP20();

function init() {
    ZTP20Inst.p.init('Token Name', 'SYMBOL', 'Description', '6', '1000000000000', '1.0.0');

    // Verify interface implementation
    Utils.assert(implementsInterface(ZTP20Inst, IZTP20), "Does not implement IZTP20");
    Utils.assert(implementsInterface(ZTP20Inst, IZTP20Metadata), "Does not implement IZTP20Metadata");
    Utils.assert(implementsInterface(ZTP20Inst, IZEP165), "Does not implement IZEP165");

    return true;
}
```

## Rule 13: Testing Before Completion

**ALWAYS test deployment before considering task complete:**

```bash
# Test deployment
node scripts/deploy-<contract-name>.js

# Check for:
# ✅ No merge errors
# ✅ Generated file created in generated/
# ✅ No syntax errors
# ✅ Contract ready for blockchain
```

## Rule 14: Common Mistakes to AVOID

### ❌ DON'T: Use inline loop declaration or i++
```javascript
for (let i = 0; i < array.length; i++) { }  // WRONG!
for (var i = 0; i < array.length; i += 1) { }  // WRONG!
```

### ❌ DON'T: Use Array.isArray()
```javascript
if (Array.isArray(params.targets)) { }  // WRONG! Undeclared 'Array'
```

### ❌ DON'T: Forward reference functions
```javascript
const _main = function() {
    _helper();  // ERROR: out of scope
};
const _helper = function() { };  // Too late!
```

### ❌ DON'T: Use IIFE pattern
```javascript
var MyLib = (function() { return {}; })();
```

### ❌ DON'T: Use arrow functions
```javascript
const myFunc = () => { };
```

### ❌ DON'T: Use ES6+ classes
```javascript
class MyContract { }
```

### ❌ DON'T: Place main contract in specs/
```javascript
contracts/specs/MyMainContract.js  // WRONG!
```

### ❌ DON'T: Manually handle object storage
```javascript
Chain.store('obj', JSON.stringify(obj));  // Use BasicOperation!
```

### ❌ DON'T: Pass context objects
```javascript
function myMethod(context, params) {  // WRONG!
    Chain.load(context.contractAddress + ':key');
}
```

### ❌ DON'T: Use switch-case for routing
```javascript
function main(input) {
    switch(data.method) {  // WRONG! Use funcList
        case 'method1': ...
    }
}
```

## Rule 15: Deployment Checklist

Before deployment, verify:

- [ ] Used `npx create-zetrix-tool` for setup
- [ ] Main contract in `contracts/` root (not specs/)
- [ ] All libraries use ES5 constructor pattern
- [ ] Using `BasicOperation` for object storage
- [ ] Reused existing libraries where applicable
- [ ] **NODE_URL in .env has NO https:// protocol** (just domain)
- [ ] **Loop syntax: `let i; for (i = 0; i < len; i += 1)`**
- [ ] **NO Array.isArray() - use `.length` checks instead**
- [ ] **Functions defined BEFORE they are called** (no forward refs)
- [ ] Implemented interfaces if token standard
- [ ] Main contract uses funcList routing
- [ ] No ES6+ syntax (arrow functions, classes, etc.)
- [ ] Import paths are correct
- [ ] Tested deployment successfully
- [ ] Generated merged contract has no JSLint errors

## Quick Reference

### Project Setup
```bash
npx create-zetrix-tool <CONTRACT_NAME>
```

### File Structure
```
contracts/<ContractName>.js           # Main (ROOT!)
contracts/library/<library-name>.js   # Libraries
contracts/specs/<library-name>-spec.js # Test specs
```

### Code Pattern
```javascript
const MyLib = function () {
    const BasicOperationUtil = new BasicOperation();
    const self = this;
    self.method = function() { };
};
```

### Storage
```javascript
BasicOperationUtil.saveObj(key, obj);
let obj = BasicOperationUtil.loadObj(key);
let key = BasicOperationUtil.getKey('pre', p1, p2);
```

### Loop Syntax
```javascript
let i;
for (i = 0; i < array.length; i += 1) {
    // body
}
```

### Array Validation
```javascript
// Check array exists and has length
if (!params.targets || !params.targets.length) {
    // Invalid
}
```

### Main Contract
```javascript
import 'library/my-lib';
const Lib = new MyLibrary();

function init(input) { }
function main(input_str) { /* funcList */ }
function query(input_str) { /* funcList */ }
```

## Error Messages to Watch For

If you see these during development, you made a mistake:

### JSLint Errors (from blockchain validator):
- **"Unexpected 'let'"** (in for loop) → Use `let i;` on separate line, then `for (i = 0; ...)`
- **"Expected 'let' and instead saw 'var'"** → Use `let` not `var` for variables
- **"Undeclared 'Array'"** → Don't use `Array.isArray()`, use `.length` checks
- **"'_functionName' is out of scope"** → Define helper functions BEFORE functions that call them
- **"expected_a_b"** with i++ → Use `i += 1` instead of `i++`

### Deployment Errors:
- "Cannot find module 'basic-operation'" → Wrong import path
- "deployOperation is not a function" → Wrong import syntax
- "IIFE detected" → Need ES5 constructor
- "Arrow function found" → Use function expressions
- "getaddrinfo EAI_AGAIN" → Network issue or wrong NODE_URL format
- Merge errors → Check import paths
- "context is not defined" → Don't pass context, use Chain directly

## Remember

**These rules exist because:**
1. Zetrix VM requires ES5 compatibility
2. Official tools handle imports/merging correctly
3. BasicOperation ensures consistent storage
4. File organization helps testing and maintenance
5. Patterns are proven in official contracts (ZTP20, etc.)

**When in doubt, refer to official examples:**
- `contracts/library/ztp20/ztp20.js` - Library pattern
- `contracts/specs/ztp20/ztp20-core-spec.js` - Main contract pattern
- `contracts/library/pausable.js` - Simple library
- `contracts/utils/basic-operation.js` - Storage utility

---

**These rules are MANDATORY for all Zetrix contract development through this MCP server.**
