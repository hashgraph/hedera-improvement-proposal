---
hip: <HIP number (this is determined by the HIP editor)>
title: Record stream specification for expiring smart contracts
author: Michael Tinker (@tinker-michaelj), Steven Sheehy (@steven-sheehy)
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft 
created: 2022-04-19
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/446
replaces: Some details of HIP-16
---

## Abstract

[HIP-16](https://hips.hedera.com/hip/hip-16) defined the lifecycle of expiring Hedera 
entities. But it did not fully specify the `(TransactionBody, TransactionRecord)` 
pairs the ledger will use to externalize lifecycle events to mirror nodes via the 
record stream.

In this HIP we use examples to specify how the record stream will externalize state 
changes for smart contract expiration. These state changes include:
1. Auto-renewal of a contract
2. Treasury return of an expired contract's non-deleted NFTs
3. Treasury return of an expired contract's non-deleted fungible token balances
4. Auto-removal of a contract

## Motivation

For a mirror node to track the state changes that happen as the ledger auto-renews and 
auto-removes smart contracts, it must understand how these changes are externalized 
in the record stream. Although HIP-16 offers an [example auto-renewal record](https://github.com/hashgraph/hedera-services/blob/master/docs/autorenew-feature.md#autorenewal-record) and an [example auto-removal record](https://github.com/hashgraph/hedera-services/blob/master/docs/autorenew-feature.md#entity-removal-record), 
it is silent on the `TransactionBody`'s that would accompany these records in the stream. 
It also does not address the important case of an expired contract that still owns NFTs, 
as NFTs were only _introduced_ in HIP-17.

## Rationale

- We chose the `ContractUpdateTransactionBody`, `ContractDeleteTransactionBody`, and
`CryptoTransferTransactionBody` messages to externalize as much of the auto-renew 
semantics as possible, because mirror nodes can already ingest these messages. 
- We added the new `bool permanent_removal` field to the `ContractDeleteTransactionBody` 
message to be quite explicit when a record is of a contract auto-removal, and not a
`ContractDelete` user transaction submitted via HAPI. (Mirror nodes will need to 
update their ingestion logic for the `permanent_removal=true` case.) 
- We chose to define the system `TransactionID` messages by adding a `nonce` to the 
`TransactionID` of the last user transaction handled by the ledger, because this 
scheme is the simplest known method of creating a globally unique identifier of a 
"synthetic" transaction.

## User stories

- As a mirror node operator, I need the record stream to include all state changes 
the ledger makes when auto-renewing or auto-removing a smart contract.
  
## Specification

_TODO_

## Backwards Compatibility

Entity expiration has never been enabled in a production environment, so this
specification should not break any mirror node implementation.

## Security Implications

If many contracts all expired in a small interval, each with many associated tokens 
with non-zero balances, the work involved in their expiration could increase 
creation-to-consensus time for user transactions submitted during the interval. 
However, the cost to create each second's worth of expiring contracts would be 
hundreds or even thousands of USD, making this an unattractive attack vector.

## How to Teach This

Use the examples in the above specification to illustrate how state changes from 
smart contract expiration appear in the record stream.

## Reference Implementation

Implementation is ongoing in Services branch `eth-tx-interop` via a set of changes to 
the [`com.hedera.services.state.expiry`](https://github.com/hashgraph/hedera-services/tree/eth-tx-interop/hedera-node/src/main/java/com/hedera/services/state/expiry) package.

## Rejected Ideas

We briefly considered a new type of record stream entry that consists of just a
`TransactionRecord` instead of a `(TransactionBody, TransactionRecord)`, but the 
increased complexity of mirror node support made it an unattractive option.

## Open Issues

To track active work, please follow the progress of issues in [this list](https://github.com/hashgraph/hedera-services/issues?q=is%3Aopen+is%3Aissue+label%3A%22contract+auto-renew%2Fremove+%28hip-16%29%22).

## References

- [HIP-16](https://hips.hedera.com/hip/hip-16)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
