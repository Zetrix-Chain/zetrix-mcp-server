# Zetrix MCP Server - Usage Examples

This guide shows you how to use the Zetrix MCP server with Claude Desktop through natural language conversations.

## Table of Contents

1. [Basic Queries](#basic-queries)
2. [Account Operations](#account-operations)
3. [Block & Transaction Exploration](#block--transaction-exploration)
4. [Advanced Multi-Query](#advanced-multi-query)
5. [WebSocket Real-time Monitoring](#websocket-real-time-monitoring)
6. [Smart Contract Interaction](#smart-contract-interaction)
7. [Transaction Workflow](#transaction-workflow)
8. [Official SDK Operations](#official-sdk-operations)
9. [Cryptography Operations](#cryptography-operations)

---

## Basic Queries

### Check Node Health

**You:**
```
Is the Zetrix mainnet node online and healthy?
```

**Claude will:**
- Use `zetrix_check_health`
- Return health status, network info, and timestamp

**Expected Response:**
```
Yes, the Zetrix mainnet node is healthy and responding at https://node.zetrix.com
```

---

### Get Latest Block Information

**You:**
```
What's the latest block on Zetrix? Show me the block number, hash, and transaction count.
```

**Claude will:**
- Use `zetrix_get_latest_block`
- Parse and format the response

**Expected Response:**
```
The latest block is #1,234,567 with hash 0xabc123...
It contains 15 transactions and was created at [timestamp].
```

---

## Account Operations

### Check Account Balance

**You:**
```
What's the ZTX balance for address ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3?
```

**Claude will:**
- Use `zetrix_get_balance`
- Convert from micro-ZTX to ZTX

**Expected Response:**
```
The account ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3 has:
- Balance: 1,000,000,000 micro-ZTX
- Equivalent: 1,000.000000 ZTX
```

---

### Get Complete Account Information

**You:**
```
Show me all information for account ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3 including assets and metadata
```

**Claude will:**
- Use `zetrix_get_account`
- Display balance, nonce, assets, and metadata

**Expected Response:**
```
Account Details:
- Address: ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3
- Balance: 1,000.000000 ZTX
- Nonce: 42
- Assets: [list of assets if any]
- Metadata: [list of metadata if any]
```

---

### Get Account Assets Only

**You:**
```
What tokens or assets does ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3 hold?
```

**Claude will:**
- Use `zetrix_get_account_assets`
- List all assets with amounts

---

### Generate Test Keypair

**You:**
```
Generate a new Zetrix keypair for testing purposes
```

**Claude will:**
- Use `zetrix_create_keypair`
- Return address, public key, and private key

**⚠️ Warning:** Only for testing! Never use these keys on mainnet.

---

## Block & Transaction Exploration

### Get Specific Block

**You:**
```
Show me details for block number 12345
```

**Claude will:**
- Use `zetrix_get_block` with blockNumber: 12345
- Display block header and transaction info

---

### Get Transaction Details

**You:**
```
What are the details of transaction 0xabc123def456...?
```

**Claude will:**
- Use `zetrix_get_transaction`
- Show source address, operations, status, fees

---

### Explore Recent Transaction History

**You:**
```
Show me recent transactions from block 12345
```

**Claude will:**
- Use `zetrix_get_transaction_history` with ledgerSeq: 12345
- List all transactions in that block

---

### Check Pending Transactions

**You:**
```
Are there any pending transactions in the mempool?
```

**Claude will:**
- Use `zetrix_get_transaction_cache`
- Show pending/unconfirmed transactions

---

## Advanced Multi-Query

### Get Multiple Accounts at Once

**You:**
```
Check the balances of these three addresses at once:
- ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3
- ZTX4Ub8e5fHzBYE52J3lGDe3fyIiNf94sxwD4
- ZTX5Vc9f6gIaCZF63K4mHEf4gzJjOg05tywE5
```

**Claude will:**
- Use `zetrix_multi_query` with three getAccount requests
- Process results in parallel

**Example:**
```json
{
  "items": [
    {"method": "getAccount", "params": {"address": "ZTX3Ta..."}},
    {"method": "getAccount", "params": {"address": "ZTX4Ub..."}},
    {"method": "getAccount", "params": {"address": "ZTX5Vc..."}}
  ]
}
```

---

### Get Block and Latest Block Number Together

**You:**
```
Show me block 100 details and also tell me what the latest block number is
```

**Claude will:**
- Use `zetrix_multi_query`
- Combine getBlockInfo and getBlockNumber

---

## WebSocket Real-time Monitoring

### Connect to WebSocket

**You:**
```
Connect to the Zetrix WebSocket so we can monitor real-time events
```

**Claude will:**
- Use `zetrix_ws_connect`
- Establish connection and register for events

**Expected Response:**
```
Connected to Zetrix WebSocket!
- Node: [node_address]
- Blockchain version: 3.0.0.0
- Ledger version: 1000
```

---

### Subscribe to Address Transactions

**You:**
```
Subscribe to real-time transaction notifications for address ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3
```

**Claude will:**
1. Use `zetrix_ws_connect` (if not connected)
2. Use `zetrix_ws_subscribe_tx`

**Note:** You'll be notified when transactions occur for this address in real-time.

---

### Monitor Multiple Addresses

**You:**
```
I want to monitor transactions for these addresses:
- ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3
- ZTX4Ub8e5fHzBYE52J3lGDe3fyIiNf94sxwD4

Let me know immediately when any transactions happen.
```

**Claude will:**
- Subscribe to both addresses via WebSocket
- Notify you of any incoming/outgoing transactions

---

### Check WebSocket Status

**You:**
```
Are we still connected to the WebSocket?
```

**Claude will:**
- Use `zetrix_ws_status`
- Show connection state and URL

---

### Disconnect WebSocket

**You:**
```
Disconnect from the WebSocket, we're done monitoring
```

**Claude will:**
- Use `zetrix_ws_disconnect`
- Clean up connection

---

## Smart Contract Interaction

### Call Contract Method (Read-only)

**You:**
```
Call the contract at ZTXcontract123... with the query method and show me the result
```

**Claude will:**
- Use `zetrix_call_contract`
- Execute in sandbox (no state changes)

**Example:**
```json
{
  "contractAddress": "ZTXcontract123...",
  "input": "{\"method\":\"query\",\"params\":{}}",
  "sourceAddress": "ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3"
}
```

---

### Test Contract Code

**You:**
```
I have this contract code [paste code]. Test it with input {"amount": 100} without deploying it.
```

**Claude will:**
- Use `zetrix_call_contract` with `code` parameter
- Run in sandbox environment
- Show execution results, logs, and gas usage

---

## Transaction Workflow

### Step 1: Prepare Transaction Blob

**You:**
```
Create a transaction blob for sending 10 ZTX from ZTX3Ta... to ZTX4Ub... with nonce 5
```

**Claude will:**
- Use `zetrix_get_transaction_blob`
- Create serialized transaction

**Example Structure:**
```json
{
  "transaction": {
    "source_address": "ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3",
    "nonce": 5,
    "fee_limit": "1000000",
    "gas_price": "1000",
    "operations": [
      {
        "type": 7,
        "pay_coin": {
          "dest_address": "ZTX4Ub8e5fHzBYE52J3lGDe3fyIiNf94sxwD4",
          "amount": "10000000"
        }
      }
    ]
  }
}
```

---

### Step 2: Test Transaction Fees

**You:**
```
Before I submit this transaction, how much will the fees be?
```

**Claude will:**
- Use `zetrix_test_transaction`
- Estimate fees without submitting

---

### Step 3: Submit Transaction (HTTP)

**You:**
```
Submit this signed transaction: [transaction_blob] with signature [signature]
```

**Claude will:**
- Use `zetrix_submit_transaction`
- Return transaction hash

---

### Step 4: Submit Transaction via WebSocket (Real-time)

**You:**
```
Submit this transaction via WebSocket so I can see the status updates in real-time
```

**Claude will:**
- Use `zetrix_ws_submit_transaction`
- Monitor for CHAIN_TX_STATUS updates
- Report: CONFIRMED → PENDING → COMPLETE or FAILURE

---

## Complex Workflow Example

### Complete Account Analysis

**You:**
```
Give me a complete analysis of address ZTX3Ta7d4GyAXD41H2kFCTd2eXhDesM83rvC3:
1. Current balance
2. All assets held
3. Recent transaction history
4. Account metadata
5. Compare to the average account balance on the network
```

**Claude will:**
1. Use `zetrix_multi_query` to get account info, assets, and metadata
2. Use `zetrix_get_transaction_history` for recent txs
3. Use `zetrix_get_latest_block` and analyze average
4. Compile comprehensive report

---

### Monitor and Alert Workflow

**You:**
```
Monitor address ZTX3Ta... via WebSocket. If the balance goes below 100 ZTX, alert me immediately.
```

**Claude will:**
1. Connect to WebSocket
2. Subscribe to address
3. Set up monitoring logic
4. Alert when condition is met

---

## Natural Language Conversation Flow

The power of MCP is that you can have natural conversations:

```
You: "What's the latest block?"
Claude: "Block #1,234,567 with 15 transactions"

You: "Show me transaction details from that block"
Claude: [uses block number from context]

You: "Which address sent the most ZTX?"
Claude: [analyzes transactions and reports]

You: "Check that address's current balance"
Claude: [looks up the address]

You: "Monitor it for new transactions"
Claude: [subscribes via WebSocket]
```

---

## Tips for Best Results

1. **Be Specific:** Include addresses, block numbers, or transaction hashes
2. **Use Context:** Claude remembers previous results in the conversation
3. **Combine Requests:** Ask for multiple things at once for efficiency
4. **Real-time Needs:** Mention "WebSocket" or "real-time" for live monitoring
5. **Testing:** Always mention "test" or "testnet" when experimenting

---

## Error Handling

If something goes wrong:

**You:**
```
Why did that transaction fail?
```

**Claude will:**
- Check error codes and descriptions
- Explain the failure reason
- Suggest fixes

---

## Performance Tips

### Use Multi-Query for Bulk Operations

**Instead of:**
```
Get account ZTX3Ta...
Get account ZTX4Ub...
Get account ZTX5Vc...
```

**Do:**
```
Get all three accounts at once: ZTX3Ta..., ZTX4Ub..., ZTX5Vc...
```

### Use WebSocket for Monitoring

**Instead of polling:**
```
Check address ZTX3Ta... balance every 10 seconds
```

**Do:**
```
Subscribe to ZTX3Ta... via WebSocket and notify me when transactions occur
```

---

## Official SDK Operations

The Zetrix MCP server integrates the official [zetrix-sdk-nodejs](https://github.com/Zetrix-Chain/zetrix-sdk-nodejs) for advanced operations.

### Create a New Account

**You:**
```
Create a new Zetrix account for me
```

**Claude will:**
- Use `zetrix_sdk_create_account`
- Generate a new account with private key, public key, and address
- **IMPORTANT**: Save the private key securely!

**Expected Response:**
```json
{
  "address": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234",
  "privateKey": "privbsGZFUoRv8aXqzR8X2gYF4m1...",
  "publicKey": "b00135e99d67a4c2e10527f766e08bc6afd4420951628149eb..."
}
```

---

### Check Account Balance with SDK

**You:**
```
Using the SDK, get the balance for ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234
```

**Claude will:**
- Use `zetrix_sdk_get_balance`
- Return the account balance

**Expected Response:**
```json
{
  "address": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234",
  "balance": "10000000000"
}
```

---

### Check if Account is Activated

**You:**
```
Is the account ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234 activated on the blockchain?
```

**Claude will:**
- Use `zetrix_sdk_is_activated`
- Check if the account exists and is active

**Expected Response:**
```json
{
  "address": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234",
  "isActivated": true
}
```

---

### Get Account Nonce

**You:**
```
What's the current nonce for account ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234?
```

**Claude will:**
- Use `zetrix_sdk_get_nonce`
- Return the account's transaction nonce (sequence number)

**Expected Response:**
```json
{
  "address": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234",
  "nonce": 42
}
```

---

### Call Smart Contract (Query)

**You:**
```
Call the contract at ZTX3Uaci... with the method "getBalance" and input parameter "0x123456"
```

**Claude will:**
- Use `zetrix_sdk_call_contract`
- Execute read-only contract call (no gas, no state change)

**Example:**
```
Call contract ZTX3Uaci4N6fA7... with method query and input:
{
  "method": "getBalance",
  "params": {
    "address": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234"
  }
}
```

---

### Invoke Smart Contract (Transaction)

**You:**
```
Invoke the contract at ZTX3Uaci... to transfer tokens. Use my private key privbs...
Source address: ZTX3Ta7d...
Amount: 1000000
Input: {"method":"transfer","to":"ZTX3Xb...","amount":"500"}
```

**Claude will:**
- Use `zetrix_sdk_invoke_contract`
- Build, sign, and submit the contract transaction
- Return transaction hash and result

**Expected Response:**
```json
{
  "hash": "d4de93a5491462b5fc46254652e5f084c9f7c3f815c5b7b2..."
}
```

---

### Complete SDK Workflow Example

**You:**
```
I want to create a new Zetrix account, check if it's activated, and if not, tell me what I need to do
```

**Claude will:**
1. Use `zetrix_sdk_create_account` to generate new account
2. Use `zetrix_sdk_is_activated` to check activation status
3. Explain that new accounts need to receive ZTX to activate

**Conversation:**
```
Claude: I've created a new Zetrix account for you:

Address: ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234
Private Key: privbsGZFUoRv8aXqzR8X2gYF4m1... (SAVE THIS SECURELY!)
Public Key: b00135e99d67a4c2e10527f766e08bc6afd4420951628149eb...

I've checked the activation status, and the account is not yet activated.

To activate this account, you need to:
1. Send at least 0.01 ZTX to this address from an existing account
2. Once the transaction is confirmed, the account will be activated
3. Then you can use this account to send transactions

Would you like me to monitor this address for activation?
```

---

## Best Practices

### Always Save Private Keys

**When creating accounts:**
```
Create a Zetrix account and save the private key in a secure note
```

**Never:**
```
Create 100 Zetrix accounts
```

---

### Use SDK for Signing Operations

**For contract invocations requiring signing:**
```
Use the SDK to invoke contract ZTX3Uaci... with my private key
```

**Instead of:**
```
Manually build and sign a transaction blob
```

---

### Query vs Invoke

**For reading data (no cost):**
```
Call the contract to query the balance (read-only)
```
→ Uses `zetrix_sdk_call_contract`

**For writing data (costs gas):**
```
Invoke the contract to transfer tokens (transaction)
```
→ Uses `zetrix_sdk_invoke_contract`

---

## Cryptography Operations

The Zetrix MCP server integrates the official [zetrix-encryption-nodejs](https://github.com/Zetrix-Chain/zetrix-encryption-nodejs) for cryptographic operations.

### Generate a New Key Pair

**You:**
```
Generate a new Zetrix key pair for me using the crypto library
```

**Claude will:**
- Use `zetrix_crypto_generate_keypair`
- Generate private key, public key, and address
- Return all cryptographic materials

**Expected Response:**
```json
{
  "privateKey": "privbsGZFUoRv8aXqzR8X2gYF4m1...",
  "publicKey": "b00135e99d67a4c2e10527f766e08bc6afd4420951628149eb...",
  "address": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234"
}
```

---

### Derive Public Key from Private Key

**You:**
```
Get the public key for private key privbsGZFUoRv8aXqzR8X2gYF4m1...
```

**Claude will:**
- Use `zetrix_crypto_get_public_key`
- Derive the corresponding public key

**Expected Response:**
```json
{
  "publicKey": "b00135e99d67a4c2e10527f766e08bc6afd4420951628149eb..."
}
```

---

### Get Address from Public Key

**You:**
```
What's the Zetrix address for public key b00135e99d67a4c2e10527f766e08bc6afd...?
```

**Claude will:**
- Use `zetrix_crypto_get_address`
- Calculate the Zetrix address

**Expected Response:**
```json
{
  "address": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234"
}
```

---

### Validate Keys and Addresses

**You:**
```
Validate if ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234 is a valid Zetrix address
```

**Claude will:**
- Use `zetrix_crypto_validate_key`
- Check format validity

**Expected Response:**
```json
{
  "type": "address",
  "value": "ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234",
  "isValid": true
}
```

**Other validation examples:**
```
Validate private key privbsGZFUoRv8aXqzR8X2gYF4m1...
Validate public key b00135e99d67a4c2e10527f766e08bc6afd...
```

---

### Sign a Message

**You:**
```
Sign the message "48656c6c6f20576f726c64" with my private key privbsGZFUoRv8aXqzR8X2gYF4m1...
```

**Claude will:**
- Use `zetrix_crypto_sign`
- Create digital signature
- Return signature and public key

**Expected Response:**
```json
{
  "signData": "9C86CE621A1C9368E93F332C55FDF423C087631B51E95D0...",
  "publicKey": "b00135e99d67a4c2e10527f766e08bc6afd4420951628149eb..."
}
```

**Note:** Message must be a hex string.

---

### Verify a Signature

**You:**
```
Verify signature 9C86CE621A1C9368E93F332C55FDF423C087631B51E95D0...
for message "48656c6c6f20576f726c64"
with public key b00135e99d67a4c2e10527f766e08bc6afd...
```

**Claude will:**
- Use `zetrix_crypto_verify`
- Verify the signature is valid

**Expected Response:**
```json
{
  "isValid": true
}
```

---

### Encrypt Private Key with Password

**You:**
```
Encrypt my private key privbsGZFUoRv8aXqzR8X2gYF4m1... with password "MySecurePassword123"
```

**Claude will:**
- Use `zetrix_crypto_encrypt_key`
- Encrypt the private key for secure storage
- Return encrypted keystore data

**Expected Response:**
```json
{
  "encryptedData": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y96Qsv..."
}
```

**Important:** Save the encrypted data securely!

---

### Decrypt Encrypted Private Key

**You:**
```
Decrypt the encrypted key U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y96Qsv...
with password "MySecurePassword123"
```

**Claude will:**
- Use `zetrix_crypto_decrypt_key`
- Decrypt and return the private key

**Expected Response:**
```json
{
  "privateKey": "privbsGZFUoRv8aXqzR8X2gYF4m1..."
}
```

---

### Complete Cryptography Workflow

**You:**
```
I want to:
1. Generate a new key pair
2. Sign a message with it
3. Verify the signature
4. Encrypt the private key with password "secure123"
```

**Claude will:**
1. Use `zetrix_crypto_generate_keypair` to create keys
2. Use `zetrix_crypto_sign` to sign your message
3. Use `zetrix_crypto_verify` to verify the signature
4. Use `zetrix_crypto_encrypt_key` to secure the private key

**Conversation:**
```
Claude: I'll help you with the complete cryptographic workflow!

Step 1: Generated new key pair
  Address: ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234
  Private Key: privbsGZFUoRv8aXqzR8X2gYF4m1...
  Public Key: b00135e99d67a4c2e10527f766e08bc6afd...

Step 2: Signed your message
  Signature: 9C86CE621A1C9368E93F332C55FDF423C087631B51E95D0...

Step 3: Verified the signature
  Is Valid: true ✓

Step 4: Encrypted private key with password
  Encrypted Data: U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y96Qsv...

Save the encrypted data securely. You can decrypt it anytime with your password!
```

---

## Security Best Practices

### Protect Private Keys

**Always:**
```
Generate a key pair and encrypt the private key with a strong password
```

**Never:**
```
Share your private key in plain text
```

---

### Use Encryption for Storage

**For long-term storage:**
```
Encrypt my private key with password "VeryStrongPassword456!"
and save it to my keystore
```

**When needed:**
```
Decrypt my keystore data with password "VeryStrongPassword456!"
```

---

### Validate Before Using

**Before signing:**
```
Validate private key privbsGZFUoRv8aXqzR8X2gYF4m1... before I use it to sign
```

**Before sending:**
```
Validate address ZTX3Ta7d4G5bS3Xh8nJDLfC3jXN8yqH1234 before sending funds
```

---

Ready to explore the Zetrix blockchain with Claude! 🚀
