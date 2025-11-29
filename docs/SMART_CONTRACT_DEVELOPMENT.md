# Zetrix Smart Contract Development Guide

Complete guide for developing, testing, and deploying smart contracts on the Zetrix blockchain.

## 📚 Table of Contents

1. [Built-in Functions Reference](#built-in-functions-reference)
2. [Contract Structure and Patterns](#contract-structure-and-patterns)
3. [Testing Framework](#testing-framework)
4. [Token Standards](#token-standards)
5. [Best Practices](#best-practices)

---

## 🔧 Built-in Functions Reference

### Chain Object

The `Chain` object provides blockchain interaction capabilities within smart contracts.

#### Metadata Management

```javascript
// Store data in contract storage
Chain.store(key, value);

// Retrieve data from contract storage
const data = Chain.load(key);

// Delete data from contract storage
Chain.del(key);
```

**Example:**
```javascript
// Store user balance
Chain.store('balance_' + userAddress, '1000000');

// Retrieve user balance
const balance = Chain.load('balance_' + userAddress);
```

#### Account Query Functions

```javascript
// Get account balance (returns string)
const balance = Chain.getBalance(address);

// Get account metadata
const metadata = Chain.getAccountMetadata(address, key);

// Get account assets
const asset = Chain.getAccountAsset(address, assetKey);

// Get account privileges
const privilege = Chain.getAccountPrivilege(address);

// Get contract properties
const props = Chain.getContractProperty(address);
```

#### Transaction Functions

```javascript
// Transfer ZTX coins
Chain.payCoin(toAddress, amount, input, metadata);

// Transfer assets
Chain.payAsset(toAddress, issuer, code, amount, input, metadata);

// Issue new assets
Chain.issueAsset(code, amount);
```

**Example:**
```javascript
// Transfer 1 ZTX (1000000 microZTX)
Chain.payCoin(recipientAddress, '1000000');

// Transfer custom asset
Chain.payAsset(recipientAddress, issuerAddress, 'MYTOKEN', '100');
```

#### Contract Operations

```javascript
// Call another contract
Chain.contractCall(contractAddress, asset, amount, input);

// Query another contract (read-only)
const result = Chain.contractQuery(contractAddress, input);

// Create/deploy a new contract
Chain.contractCreate(balance, type, code, input);

// Delegate call (execute code in current context)
Chain.delegateCall(contractAddress, input);

// Delegate query (query in current context)
const result = Chain.delegateQuery(contractAddress, input);
```

#### Logging and Events

```javascript
// Log transaction events (generates on-chain log)
Chain.tlog(topic, arg1, arg2, arg3, arg4, arg5);
```

**Example:**
```javascript
// Log token transfer event
Chain.tlog('Transfer', senderAddress, receiverAddress, amount);
```

#### Built-in Objects

```javascript
// Current block information
const blockNumber = Chain.block.number;
const blockTimestamp = Chain.block.timestamp;

// Transaction information
const initiator = Chain.tx.initiator;
const sender = Chain.tx.sender;
const gasPrice = Chain.tx.gasPrice;
const txHash = Chain.tx.hash;
const feeLimit = Chain.tx.feeLimit;

// Message information
const msgInitiator = Chain.msg.initiator;
const msgSender = Chain.msg.sender;
const coinAmount = Chain.msg.coinAmount;
const asset = Chain.msg.asset;
const nonce = Chain.msg.nonce;
const operationIndex = Chain.msg.operationIndex;

// Current contract address
const contractAddr = Chain.thisAddress;
```

---

### Utils Object

The `Utils` object provides cryptographic and mathematical utilities.

#### 256-bit Integer Operations

```javascript
// Compare two 256-bit integers (returns 1, 0, or -1)
const cmp = Utils.int256Compare(x, y);

// Arithmetic operations (all return strings)
const sum = Utils.int256Add(x, y);
const diff = Utils.int256Sub(x, y);
const product = Utils.int256Mul(x, y);
const quotient = Utils.int256Div(x, y);
const remainder = Utils.int256Mod(x, y);
```

**Example:**
```javascript
// Calculate total supply
const total = Utils.int256Add('1000000', '500000'); // "1500000"

// Check if balance is sufficient
if (Utils.int256Compare(balance, amount) >= 0) {
    // Sufficient balance
}
```

#### 64-bit Integer Operations

```javascript
const cmp = Utils.int64Compare(x, y);
const sum = Utils.int64Add(x, y);
const diff = Utils.int64Sub(x, y);
const product = Utils.int64Mul(x, y);
const quotient = Utils.int64Div(x, y);
const remainder = Utils.int64Mod(x, y);
```

#### Cryptographic Functions

```javascript
// SHA-256 hashing (returns base16 encoded hash)
const hash = Utils.sha256(data, dataType);

// Verify ECDSA signature
const isValid = Utils.ecVerify(signedData, publicKey, blobData, blobDataType);

// Convert public key to address
const address = Utils.toAddress(publicKey);
```

**Example:**
```javascript
// Hash message
const messageHash = Utils.sha256('Hello World', 1);

// Verify signature
if (Utils.ecVerify(signature, publicKey, message, 1)) {
    // Signature is valid
}
```

#### Validation Functions

```javascript
// Validate address format
const isValidAddr = Utils.addressCheck(address);

// Validate 64-bit string number
const isValid64 = Utils.stoI64Check(strNumber);

// Validate 256-bit string number
const isValid256 = Utils.stoI256Check(strNumber);
```

#### Utility Functions

```javascript
// Output log (trace level)
Utils.log('Debug info');

// Assert condition (throws if false)
Utils.assert(condition, 'Error message');

// Convert to base unit (multiply by 10^6)
const baseUnit = Utils.toBaseUnit(value);

// Convert hex to decimal
const decimal = Utils.hexToDec(strHex);
```

**Example:**
```javascript
// Validate input
Utils.assert(Utils.addressCheck(recipient), 'Invalid recipient address');

// Convert 1 ZTX to microZTX
const microZTX = Utils.toBaseUnit('1'); // "1000000"
```

#### Zero-Knowledge Proof Functions

```javascript
// Verify bulletproof range proof
const isValid = Utils.bpRangeProofVerify(commit, proof);

// Verify Pedersen commitment tally
const isValid = Utils.pedersenTallyVerify(
    inputCommits,
    outputCommits,
    excessMsg,
    excessSign
);
```

---

## 🏗️ Contract Structure and Patterns

### ES5 Class Pattern

Zetrix smart contracts use ES5 JavaScript. Here's how to create classes:

```javascript
const MyContract = function() {
    const self = this;

    // Private variables (local scope)
    const _privateVar = 'private';

    // Public variables
    self.publicVar = 'public';

    // Protected namespace
    self.p = {};

    // Private method
    const _privateMethod = function() {
        return _privateVar;
    };

    // Public method
    self.publicMethod = function() {
        return self.publicVar;
    };

    // Protected method
    self.p.protectedMethod = function() {
        return _privateMethod();
    };

    // Constructor/Initialize
    self.init = function(param1, param2) {
        // Initialization logic
        self.publicVar = param1;
    };
};

// Entry point
function init(input) {
    const contract = new MyContract();
    contract.init(input);
}

function main(input) {
    // Handle contract calls
}

function query(input) {
    // Handle read-only queries
}
```

### Inheritance Pattern

```javascript
const ParentContract = function() {
    const self = this;
    self.p = {};

    self.p.parentMethod = function() {
        return 'parent';
    };
};

const ChildContract = function() {
    const self = this;

    // Call parent constructor
    ParentContract.call(self);

    // Save reference to parent method
    const _parentMethod = self.p.parentMethod;

    // Override parent method
    self.p.parentMethod = function() {
        // Add child logic
        const result = _parentMethod.call(self);
        return result + ' extended';
    };
};
```

### Storage Pattern

```javascript
const TokenContract = function() {
    const self = this;

    // Storage keys
    const TOTAL_SUPPLY = 'totalSupply';
    const BALANCE_PREFIX = 'balance_';

    self.getTotalSupply = function() {
        return Chain.load(TOTAL_SUPPLY) || '0';
    };

    self.setTotalSupply = function(amount) {
        Chain.store(TOTAL_SUPPLY, amount);
    };

    self.getBalance = function(address) {
        const key = BALANCE_PREFIX + address;
        return Chain.load(key) || '0';
    };

    self.setBalance = function(address, amount) {
        const key = BALANCE_PREFIX + address;
        Chain.store(key, amount);
    };
};
```

---

## 🧪 Testing Framework

### TEST_INVOKE Function

Execute transactions and validate results:

```javascript
TEST_INVOKE(
    "Test description",
    contractAddress,
    txInitiator,
    {
        method: "methodName",
        params: {
            param1: "value1",
            param2: "value2"
        }
    },
    TEST_RESULT.SUCCESS  // or TEST_RESULT.FAILED
);
```

**Example:**
```javascript
TEST_INVOKE(
    "Transfer tokens from Alice to Bob",
    contractAddress,
    aliceAddress,
    {
        method: "transfer",
        params: {
            to: bobAddress,
            amount: "1000"
        }
    },
    TEST_RESULT.SUCCESS
);
```

### TEST_QUERY Function

Query contract state and validate:

```javascript
TEST_QUERY(
    "Test description",
    contractAddress,
    {
        method: "methodName",
        params: {
            param1: "value1"
        }
    },
    TEST_CONDITION.EQUALS,  // or GREATER_THAN, LESSER_THAN, CONTAINS
    expectedValue,
    ["result", "field", "path"]  // JSON path to value
);
```

**Example:**
```javascript
TEST_QUERY(
    "Check Bob's balance is 1000",
    contractAddress,
    {
        method: "balanceOf",
        params: {
            address: bobAddress
        }
    },
    TEST_CONDITION.EQUALS,
    "1000",
    ["result", "balance"]
);
```

### Test Conditions

- `TEST_CONDITION.EQUALS` - Exact match
- `TEST_CONDITION.GREATER_THAN` - Numeric greater than
- `TEST_CONDITION.LESSER_THAN` - Numeric less than
- `TEST_CONDITION.CONTAINS` - String/array contains

---

## 📜 Token Standards

### ZTP20 (Fungible Tokens)

Standard methods for ERC20-like tokens:

```javascript
// Query methods
balanceOf(address)
totalSupply()
allowance(owner, spender)

// Transaction methods
transfer(to, amount)
approve(spender, amount)
transferFrom(from, to, amount)

// Events
Chain.tlog('Transfer', from, to, amount);
Chain.tlog('Approval', owner, spender, amount);
```

**Variants:**
- **Core** - Basic functionality
- **Burnable** - Can destroy tokens
- **Permit** - Gasless approvals
- **Pausable** - Emergency stop
- **Capped** - Maximum supply limit

### ZTP721 (NFTs)

Standard methods for ERC721-like tokens:

```javascript
// Query methods
balanceOf(owner)
ownerOf(tokenId)
getApproved(tokenId)
isApprovedForAll(owner, operator)

// Transaction methods
approve(to, tokenId)
setApprovalForAll(operator, approved)
transferFrom(from, to, tokenId)
safeTransferFrom(from, to, tokenId, data)

// Events
Chain.tlog('Transfer', from, to, tokenId);
Chain.tlog('Approval', owner, approved, tokenId);
Chain.tlog('ApprovalForAll', owner, operator, approved);
```

**Variants:**
- **Core** - Basic NFT
- **Burnable** - Destroyable NFTs
- **Pausable** - Emergency stop
- **Enumerable** - Token enumeration

### ZTP1155 (Multi-Token)

Standard methods for ERC1155-like tokens:

```javascript
// Query methods
balanceOf(account, id)
balanceOfBatch(accounts, ids)
isApprovedForAll(account, operator)

// Transaction methods
setApprovalForAll(operator, approved)
safeTransferFrom(from, to, id, amount, data)
safeBatchTransferFrom(from, to, ids, amounts, data)

// Events
Chain.tlog('TransferSingle', operator, from, to, id, value);
Chain.tlog('TransferBatch', operator, from, to, ids, values);
Chain.tlog('ApprovalForAll', account, operator, approved);
```

**Variants:**
- **Core** - Basic multi-token
- **Burnable** - Destroyable tokens
- **Pausable** - Emergency stop
- **Supply** - Track total supply
- **URI Storage** - Token metadata URIs

---

## ✅ Best Practices

### Security

1. **Input Validation**
```javascript
Utils.assert(Utils.addressCheck(to), 'Invalid address');
Utils.assert(Utils.stoI256Check(amount), 'Invalid amount');
Utils.assert(Utils.int256Compare(amount, '0') > 0, 'Amount must be positive');
```

2. **Access Control**
```javascript
const owner = Chain.load('owner');
Utils.assert(Chain.msg.sender === owner, 'Only owner');
```

3. **Reentrancy Protection**
```javascript
Utils.assert(!Chain.load('locked'), 'Reentrant call');
Chain.store('locked', 'true');
// ... operations ...
Chain.store('locked', 'false');
```

### Gas Optimization

1. **Minimize Storage**
```javascript
// Bad: Multiple stores
Chain.store('data1', value1);
Chain.store('data2', value2);

// Good: Single combined store
const data = JSON.stringify({data1: value1, data2: value2});
Chain.store('combined', data);
```

2. **Use Local Variables**
```javascript
// Bad: Multiple loads
if (Chain.load('balance_' + addr) > amount) {
    Chain.store('balance_' + addr, Chain.load('balance_' + addr) - amount);
}

// Good: Load once
const balance = Chain.load('balance_' + addr);
if (balance > amount) {
    Chain.store('balance_' + addr, balance - amount);
}
```

### Code Organization

1. **Separate Concerns**
```javascript
// Storage layer
const Storage = function() {
    const self = this;
    self.get = function(key) { return Chain.load(key); };
    self.set = function(key, val) { Chain.store(key, val); };
};

// Business logic layer
const Logic = function() {
    const self = this;
    const storage = new Storage();
    // ... use storage
};
```

2. **Error Messages**
```javascript
Utils.assert(condition, 'Clear error message explaining what went wrong');
```

3. **Event Logging**
```javascript
// Always log important state changes
Chain.tlog('StateChanged', oldValue, newValue, timestamp);
```

---

## 📚 Additional Resources

- [Zetrix Contract Development Tool](https://github.com/armmarov/zetrix-contract-development-tool)
- [Zetrix Official Documentation](https://docs.zetrix.com/)
- Example contracts in the toolkit's `contracts/library/` directory

---

**Ready to build on Zetrix!** 🚀
