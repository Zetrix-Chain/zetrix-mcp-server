/**
 * Zetrix Smart Contract Documentation Helper
 * Provides reference documentation for contract development
 */

export class ZetrixContractDocs {
  /**
   * Get Chain object functions documentation
   */
  getChainFunctions(): string {
    return `# Zetrix Smart Contract - Chain Object Functions

## Metadata Management
- **Chain.store(key, value)** - Store data in contract storage
- **Chain.load(key)** - Retrieve data from contract storage
- **Chain.del(key)** - Delete data from contract storage

## Account Query Functions
- **Chain.getBalance(address)** - Get account balance (returns string)
- **Chain.getAccountMetadata(address, key)** - Get account metadata
- **Chain.getAccountAsset(address, assetKey)** - Get account assets
- **Chain.getAccountPrivilege(address)** - Get account privileges (JSON)
- **Chain.getContractProperty(address)** - Get contract properties

## Transaction Functions
- **Chain.payCoin(address, amount, input, metadata)** - Transfer ZTX coins
- **Chain.payAsset(address, issuer, code, amount, input, metadata)** - Transfer assets
- **Chain.issueAsset(code, amount)** - Issue new assets

## Contract Operations
- **Chain.contractCall(address, asset, amount, input)** - Call another contract
- **Chain.contractQuery(address, input)** - Query another contract (read-only)
- **Chain.contractCreate(balance, type, code, input)** - Deploy new contract
- **Chain.delegateCall(address, input)** - Execute code in current context
- **Chain.delegateQuery(address, input)** - Query in current context

## Logging
- **Chain.tlog(topic, arg1, arg2, arg3, arg4, arg5)** - Log transaction event

## Built-in Objects
- **Chain.block.number** - Current block number
- **Chain.block.timestamp** - Current block timestamp
- **Chain.tx.initiator** - Transaction initiator
- **Chain.tx.sender** - Transaction sender
- **Chain.tx.gasPrice** - Gas price
- **Chain.tx.hash** - Transaction hash
- **Chain.tx.feeLimit** - Fee limit
- **Chain.msg.initiator** - Message initiator
- **Chain.msg.sender** - Message sender
- **Chain.msg.coinAmount** - Coin amount sent
- **Chain.msg.asset** - Asset sent
- **Chain.msg.nonce** - Message nonce
- **Chain.msg.operationIndex** - Operation index
- **Chain.thisAddress** - Current contract address

See SMART_CONTRACT_DEVELOPMENT.md for examples.`;
  }

  /**
   * Get Utils object functions documentation
   */
  getUtilsFunctions(): string {
    return `# Zetrix Smart Contract - Utils Object Functions

## 256-bit Integer Operations
- **Utils.int256Compare(x, y)** - Compare (returns 1, 0, or -1)
- **Utils.int256Add(x, y)** - Addition (returns string)
- **Utils.int256Sub(x, y)** - Subtraction (returns string)
- **Utils.int256Mul(x, y)** - Multiplication (returns string)
- **Utils.int256Div(x, y)** - Division (returns string)
- **Utils.int256Mod(x, y)** - Modulo (returns string)

## 64-bit Integer Operations
- **Utils.int64Compare(x, y)** - Compare (returns 1, 0, or -1)
- **Utils.int64Add(x, y)** - Addition (returns string)
- **Utils.int64Sub(x, y)** - Subtraction (returns string)
- **Utils.int64Mul(x, y)** - Multiplication (returns string)
- **Utils.int64Div(x, y)** - Division (returns string)
- **Utils.int64Mod(x, y)** - Modulo (returns string)

## Cryptographic Functions
- **Utils.sha256(data, dataType)** - SHA-256 hash (returns base16)
- **Utils.ecVerify(signedData, publicKey, blobData, blobDataType)** - Verify signature
- **Utils.toAddress(publicKey)** - Convert public key to address

## Validation Functions
- **Utils.addressCheck(address)** - Validate address format
- **Utils.stoI64Check(strNumber)** - Validate 64-bit string number
- **Utils.stoI256Check(strNumber)** - Validate 256-bit string number

## Utility Functions
- **Utils.log(info)** - Output trace log
- **Utils.assert(condition, msg)** - Assert with error message
- **Utils.toBaseUnit(value)** - Convert to base unit (× 10^6)
- **Utils.hexToDec(strHex)** - Convert hex to decimal string

## Zero-Knowledge Proof Functions
- **Utils.bpRangeProofVerify(commit, proof)** - Verify range proof
- **Utils.pedersenTallyVerify(inputCommits, outputCommits, excessMsg, excessSign)** - Verify commitment tally

See SMART_CONTRACT_DEVELOPMENT.md for examples.`;
  }

  /**
   * Get contract structure guide
   */
  getStructureGuide(): string {
    return `# Zetrix Smart Contract Structure Guide

## ES5 Class Pattern

\`\`\`javascript
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
        self.publicVar = param1;
    };
};

// Entry points
function init(input) {
    const contract = new MyContract();
    contract.init(input);
}

function main(input) {
    // Handle transactions
}

function query(input) {
    // Handle read-only queries
}
\`\`\`

## Inheritance Pattern

\`\`\`javascript
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
        const result = _parentMethod.call(self);
        return result + ' extended';
    };
};
\`\`\`

## Storage Pattern

\`\`\`javascript
const TokenContract = function() {
    const self = this;

    const TOTAL_SUPPLY = 'totalSupply';
    const BALANCE_PREFIX = 'balance_';

    self.getBalance = function(address) {
        const key = BALANCE_PREFIX + address;
        return Chain.load(key) || '0';
    };

    self.setBalance = function(address, amount) {
        const key = BALANCE_PREFIX + address;
        Chain.store(key, amount);
    };
};
\`\`\`

See SMART_CONTRACT_DEVELOPMENT.md for complete guide.`;
  }

  /**
   * Get token standard documentation
   */
  getTokenStandard(standard: string): string {
    if (standard === 'ZTP20') {
      return `# ZTP20 Token Standard (Fungible Tokens)

## Standard Methods

### Query Methods
- **balanceOf(address)** - Get token balance of address
- **totalSupply()** - Get total token supply
- **allowance(owner, spender)** - Get approved amount

### Transaction Methods
- **transfer(to, amount)** - Transfer tokens
- **approve(spender, amount)** - Approve spending
- **transferFrom(from, to, amount)** - Transfer on behalf

### Events
\`\`\`javascript
Chain.tlog('Transfer', from, to, amount);
Chain.tlog('Approval', owner, spender, amount);
\`\`\`

## Variants Available

1. **ZTP20Core** - Basic fungible token
2. **ZTP20Burnable** - Can destroy tokens
3. **ZTP20Permit** - Gasless approvals
4. **ZTP20Pausable** - Emergency stop functionality
5. **ZTP20Capped** - Maximum supply limit

## Example Implementation

\`\`\`javascript
const ZTP20Core = function() {
    const self = this;

    self.transfer = function(to, amount) {
        const from = Chain.msg.sender;
        Utils.assert(Utils.addressCheck(to), 'Invalid address');

        const fromBalance = self.getBalance(from);
        const toBalance = self.getBalance(to);

        Utils.assert(
            Utils.int256Compare(fromBalance, amount) >= 0,
            'Insufficient balance'
        );

        const newFromBalance = Utils.int256Sub(fromBalance, amount);
        const newToBalance = Utils.int256Add(toBalance, amount);

        self.setBalance(from, newFromBalance);
        self.setBalance(to, newToBalance);

        Chain.tlog('Transfer', from, to, amount);
        return true;
    };
};
\`\`\`

See SMART_CONTRACT_DEVELOPMENT.md for complete details.`;
    } else if (standard === 'ZTP721') {
      return `# ZTP721 Token Standard (Non-Fungible Tokens)

## Standard Methods

### Query Methods
- **balanceOf(owner)** - Get NFT count of owner
- **ownerOf(tokenId)** - Get owner of NFT
- **getApproved(tokenId)** - Get approved address for NFT
- **isApprovedForAll(owner, operator)** - Check operator approval

### Transaction Methods
- **approve(to, tokenId)** - Approve NFT transfer
- **setApprovalForAll(operator, approved)** - Approve all NFTs
- **transferFrom(from, to, tokenId)** - Transfer NFT
- **safeTransferFrom(from, to, tokenId, data)** - Safe transfer NFT

### Events
\`\`\`javascript
Chain.tlog('Transfer', from, to, tokenId);
Chain.tlog('Approval', owner, approved, tokenId);
Chain.tlog('ApprovalForAll', owner, operator, approved);
\`\`\`

## Variants Available

1. **ZTP721Core** - Basic NFT
2. **ZTP721Burnable** - Destroyable NFTs
3. **ZTP721Pausable** - Emergency stop
4. **ZTP721Enumerable** - Token enumeration support

See SMART_CONTRACT_DEVELOPMENT.md for complete details.`;
    } else if (standard === 'ZTP1155') {
      return `# ZTP1155 Token Standard (Multi-Token)

## Standard Methods

### Query Methods
- **balanceOf(account, id)** - Get balance of token ID
- **balanceOfBatch(accounts, ids)** - Get multiple balances
- **isApprovedForAll(account, operator)** - Check operator approval

### Transaction Methods
- **setApprovalForAll(operator, approved)** - Approve operator
- **safeTransferFrom(from, to, id, amount, data)** - Transfer tokens
- **safeBatchTransferFrom(from, to, ids, amounts, data)** - Batch transfer

### Events
\`\`\`javascript
Chain.tlog('TransferSingle', operator, from, to, id, value);
Chain.tlog('TransferBatch', operator, from, to, ids, values);
Chain.tlog('ApprovalForAll', account, operator, approved);
\`\`\`

## Variants Available

1. **ZTP1155Core** - Basic multi-token
2. **ZTP1155Burnable** - Destroyable tokens
3. **ZTP1155Pausable** - Emergency stop
4. **ZTP1155Supply** - Track total supply per ID
5. **ZTP1155URIStorage** - Token metadata URIs

See SMART_CONTRACT_DEVELOPMENT.md for complete details.`;
    }
    return 'Unknown token standard';
  }

  /**
   * Get testing guide
   */
  getTestingGuide(): string {
    return `# Zetrix Smart Contract Testing Guide

## TEST_INVOKE Function

Execute transactions and validate results:

\`\`\`javascript
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
\`\`\`

### Example
\`\`\`javascript
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
\`\`\`

## TEST_QUERY Function

Query contract state and validate:

\`\`\`javascript
TEST_QUERY(
    "Test description",
    contractAddress,
    {
        method: "methodName",
        params: {
            param1: "value1"
        }
    },
    TEST_CONDITION.EQUALS,  // Comparison operator
    expectedValue,
    ["result", "field", "path"]  // JSON path to value
);
\`\`\`

### Example
\`\`\`javascript
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
\`\`\`

## Test Conditions

- **TEST_CONDITION.EQUALS** - Exact value match
- **TEST_CONDITION.GREATER_THAN** - Numeric greater than
- **TEST_CONDITION.LESSER_THAN** - Numeric less than
- **TEST_CONDITION.CONTAINS** - String/array contains

## Test Organization

### Integration Tests (On-Chain)
Located in \`tests/integration/\`
\`\`\`bash
npm test tests/integration/ztp20/test-ztp20Core.js
\`\`\`

### Unit Tests (Local)
Located in \`tests/unit/\`
\`\`\`bash
npm run test-coverage tests/unit/ztp20/test-ztp20.js
\`\`\`

See SMART_CONTRACT_DEVELOPMENT.md for complete testing guide.`;
  }
}
