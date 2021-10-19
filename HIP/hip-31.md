- hip: 31
- title: Introduction of System Precompiles
- author: Yoan Sredkov <yoansredkov@gmail.com>
- type: Standards
- category: Services
- type: Draft
- created: 18 October 2021
- discussions-to: TODO LINK
- updated: 19 October 2021
- requires:
- replaces:
- superseded-by:

## Abstract

Design a way to export `N` transaction records for a smart contract, which triggers `N-1` functionalities
while being called. 

## Motivation

When calling a smart contract via `ContractCall`, there is a possibility that the contract itself can use HTS or HCS
as a system precompile. The functionalities in those services require exporting transaction records for the job done.
This HIP provides a way to export those "nested/child" records with the `ContractCall` record as well.

## User stories

As a developer, I want to know the exact functionalities which the contract has triggered while being called, as well
as the time of their execution.

## Specification

The record of the `ContractCall` execution will be called `parent` record.
Each `System Precompile` will have to export transaction records for each executed operation. Those records will be called `child` records.

As we need uniqueness in those records, and more specifically - the `TransactionID`, we need to add a new property - `uint64 index`.
This index will serve the purpose of helping in calculating the `consensusTimestamp` of the child transaction, e.g:
- `childTX.consensusTimestamp = parentTX.consensusTimestamp + index (added as nanoseconds)`.
The index is 0 on the parent and never 0 on children. Ordering is the same as the execution order in the smart contract.

- The following paragraphs describe the changes to the API, as well as the mapping of the properties between the child/parent records:

**Legend:**
```diff
+ Green represents new property/message added
! Orange represents modified property/message
```
- **Parent TX record** → The Contract Create/Call operation
- **Child TX Record / Precompile TX Record** → The TX records created because of Contract Create/Call called a `System Precompile`

### ContractCall/Create Transaction

```protobuf
message TransactionRecord {
  TransactionReceipt receipt = 1;
  bytes transactionHash = 2;
  Timestamp consensusTimestamp = 3;
  TransactionID transactionID = 4;
  string memo = 5;
  uint64 transactionFee = 6;
  oneof body {
    ContractFunctionResult contractCallResult = 7;
    ContractFunctionResult contractCreateResult = 8;
  }
  TransferList transferList = 10; // Include only top-level net hbar transfers + transaction fee
  repeated TokenTransferList tokenTransferLists = 11; // Will always be empty
  ScheduleID scheduleRef = 12; // Will always be empty
  repeated AssessedCustomFee assessed_custom_fees = 13; // Probably empty, as ContractCall does not have custom fees 
  repeated TokenAssociation automatic_token_associations = 14; // Will always be empty
}
```

```protobuf
message TransactionReceipt {
  ResponseCodeEnum status = 1;
  AccountID accountID = 2; // Will always be empty
  FileID fileID = 3; // Will always be empty
  ContractID contractID = 4; // Will be populated on ContractCreate. Newly created Contract
  ExchangeRateSet exchangeRate = 5; 
  TopicID topicID = 6; // Will always be empty
  uint64 topicSequenceNumber = 7; // Will always be 0
  bytes topicRunningHash = 8; // Will always be empty
  uint64 topicRunningHashVersion = 9; // Will always be 0
  TokenID tokenID = 10; // Will always be empty
  uint64 newTotalSupply = 11; // Will always be 0
  ScheduleID scheduleID = 12; // Will always be empty
  TransactionID scheduledTransactionID = 13; // Will always be empty
  repeated int64 serialNumbers = 14; // Will always be empty
}
```

```diff
message TransactionID {
	Timestamp transactionValidStart = 1;
	AccountID accountID = 2;
	bool scheduled = 3; // Might be true if ContractCreate/Call is Scheduled TX
+  int64 index = 4; // Will always be 0
}
```

### System Precompile TX Records

```protobuf
message TransactionRecord {
  TransactionReceipt receipt = 1;
  bytes transactionHash = 2; // TODO we need to think about it. Option 1 -> Empty; Option 2 -> See what Scheduled TXns do
  Timestamp consensusTimestamp = 3; // Will be parentConsensusTime + {index} nano
  TransactionID transactionID = 4;
  string memo = 5; // Will always be empty. We might extend System Precompiles to support memo but its not must have
  uint64 transactionFee = 6; // always zero as the parent txn contains aggregated fee
  oneof body { 
    ContractFunctionResult contractCallResult = 7; // Will always be empty
    ContractFunctionResult contractCreateResult = 8; // Will always be empty
  }
  TransferList transferList = 10; // All the created Hbar transfers from the nested/child operations + their respective fees
  repeated TokenTransferList tokenTransferLists = 11; // Will be populated in the case of HTS Transfer System precompile call
  ScheduleID scheduleRef = 12; // Will always be empty 
  repeated AssessedCustomFee assessed_custom_fees = 13; // Might be populated in the case of HTS Transfer System precompile - when a HTS token has custom fees. 
  repeated TokenAssociation automatic_token_associations = 14; // Might be populated in the case of HTS Transfer System Precompile
}
```

```protobuf
message TransactionReceipt {
  ResponseCodeEnum status = 1;
  AccountID accountID = 2; // Populated in CryptoCreate Precompile. The id of the newly created account
  FileID fileID = 3; // Populated in FileCreate Precompile. The id of the newly created file
  ContractID contractID = 4; // Will always be empty
  ExchangeRateSet exchangeRate = 5; // Same as parent TX record
  TopicID topicID = 6; // Populated in ConsensusCreateTopic Precompile. The id of the newly created topic
  uint64 topicSequenceNumber = 7; // Populated in ConsensusSubmitMessage Precompile. The new sequence number of the topic the received the message
  bytes topicRunningHash = 8; // Populated in ConsensusSubmitMessage Precompile
  uint64 topicRunningHashVersion = 9; // Populated in ConsensusSubmitMessage Precompile
  TokenID tokenID = 10; // Populated in TokenCreate Precompile
  uint64 newTotalSupply = 11; // Populated in TokenUpdate Precompile
  ScheduleID scheduleID = 12; // Populated in ScheduleCreate Precompile
  TransactionID scheduledTransactionID = 13; // Populated in ScheduleCreate or Schedule Sign Precompiles
  repeated int64 serialNumbers = 14; // Populated in TokenMint Precompiles
}
```


```diff
message TransactionID {
	Timestamp transactionValidStart = 1;
	AccountID accountID = 2;
	bool scheduled = 3; // Will always be false
+  int64 index = 4; // Incrementing integer starting from 0. Represents the number of System Precompiles triggered by the parent transaction.
}
```

### Visual explanation of the process:
![Flow](../assets/hip-31/CC%20txn%20record%20design.png)



## Things to discuss:
- HBar transfers when caused by custom fees?
- Transaction hash of child records?