---
hip: <HIP number (this is determined by the HIP editor)>
title: Atomic transactions chains
author: Piotr Swierzy <piotr.swierzy@arianelabs.com> aka @se7enarianelabs
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-07-25
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/531
---

## Abstract

This HIP defines a mechanism to execute atomic transaction chains such that a series of transactions(HAPI calls) depending on each other can be rolled into one transaction that passes the ACID test (atomicity, consistency, isolation, and durability)

## Motivation

The existing implementation of transactions in the Hedera network does not allow multiple different HAPI transactions to be called in one single network transaction that would have all the ACID properties.
This makes it impossible to create more complicated flows without using smart contracts (which do not support all the HAPI transactions at this point) and listening to the mirror node to check the status of the previous transaction.
This way we can also achieve an abstraction away from smart contracts

## Rationale
Atomic transactions chain is from the protobuf point of view just a list of `SignedTransactions` that's, why we based our new protobuf message on it,
we only have to change the `bodyBytes` field to be `repeated`, that way we can store there multiple transaction bodies,
`SignatureMap sigMap` can stay unchanged because it's defined as `repeated SignaturePair sigPair`.

## User stories

As a Hedera token service user, I want to be able to unfreeze an account, send an NFT, and freeze it again in one ACID transaction, that way I can achieve an account-bound NFT(nontransferable NFT) collection, without using the hedera smart contract service.
We can use nontransferable NFTs e.g. as someone’s achievements, the creation of digital references, etc.

As a Hedera token service user, I want to be able to unfreeze an account, send an FT and freeze it again in one ACID transaction, that way I can achieve an account-bound FT(nontransferable FT) collection, without using the hedera smart contract service.
We can use nontransferable FT e.g. as game points, reputation points, etc.

As a Hedera token service user, I want to be able to wipe a token, mint a token, and transfer a token in one ACID transaction.
That way a backend developer could create complicated flows without the need to use smart contracts and the need to handle partially successful flows in the backend,
e.g. the wipe transaction was successful but the mint transaction was not.

As a Hedera service user, I want to be able to create atomic transaction chains, that use multiple Hedera services e. g.
I want to be able to wipe a token, mint a token, transfer a token, and submit a topic message in one ACID transaction.
That way a backend developer could create complicated flows without the need to use smart contracts and the need to handle partially successful flows in the backend,
e.g. the wipe transaction was successful but the mint transaction was not.

## Specification
We could create a new protobuf message based on `SignedTransaction` message:
```
message AtomicTransactionsChainTransaction {
    /**
    * TransactionBodies serialized into bytes, which must be signed
    */
    repeated bytes bodyBytes = 1;

    /**
     * The signatures on the body with the new format, to authorize the transactions
     */
    SignatureMap sigMap = 2;
}
```
## Backwards Compatibility

## Security Implications

## How to Teach This

## Reference Implementation

## Rejected Ideas
We rejected the idea to add the support of conditional branching to the atomic transaction chains,
because we don't think it's useful compared to the increase of complications in implementing the HIP.

## Open Issues

## References

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
