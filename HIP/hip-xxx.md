---
hip: XXX
title: Add support for gasConsumed field in REST APIs related to transaction information
author: Ivan Kavaldzhiev <ivan.kavaldzhiev@limechain.tech>, Stoyan Panayotov <stoyan.panayotov@limechain.tech>
working-group: Steven Sheehy <steven.sheehy@swirldslabs.com>, Nana Essilfie-Conduah <nana@swirldslabs.com>, Danno Ferrin <danno.ferrin@swirldslabs.com>, David Bakin <david.bakin@swirldslabs.com>
type: Standards Track
category: Mirror
needs-council-approval: No
status: Draft
created: 17.01.2024
---

## Abstract

Currently, consensus nodes export a `gasUsed` field for each transaction, part of the record streaming. As a result, the `contract_result` table in the mirror node database contains a `gas_used` field for each transaction. This field value is calculated using the gas refund policy applied in the consensus node.
This means that the value in this field represents how much gas the user was actually charged, not the amount of gas that the EVM consumed during the execution. This value can greatly differ from the actual amount that was used by the EVM. 

Let's say we use a 20% refund policy for the `gasLimit` that is sent by the user.

That means if the EVM consumes for example 32 500 gas, but the user is passing 400 000 gas limit, they will be charged the `max(32 500, 320 000)`, so it would be 320 000. That is the value calculated after we return the 20% of the gasLimit back to the user, which is 80 000.
The logic compares the bigger of the two values - the gas consumed by the EVM and the 80% of the `gasLimit` that the user has passed.

In this way we lose track of the actual gas that was consumed by the EVM.

This HIP will add a new field `gas_consumed` to the `contract_result` table in the mirror node, which will contain the actually consumed gas by the EVM.

## Motivation

Adding a `gas_consumed` field in the `contract_result` table would enrich user experience by providing more information about the transaction. 
This would allow users to better understand the gas refund policy and the actual gas consumption of their transactions. This would also allow users to understand how heavy their executed transaction was for the EVM.

## Rationale

Consensus nodes export ContractActions sidecar records for each transaction after the introducing of [HIP-513](./hip-513.md). Each sidecar record contains a `gasUsed` field for the given action that the record represents (different type of call or contract creation).
This value directly represents the gas consumed by the EVM, without taking into account the gas refund policy. This makes it possible to calculate the overall gas consumption for the transaction, during the ContractActions sidecar record importing.  

If we sum up all of the `gasUsed` values of each ContractActions sidecar for a given transaction on top of the initial intrinsic gas, which is the initial gas, charged prior to the transaction execution, then we would get accurate value for the `gasConsumed` field.

## User stories

1. As a user, I want to see how much gas was consumed by the EVM during the execution of my transaction, when I retrieve a transaction info from the mirror-node REST APIs, so that I know if I can optimise my transaction cost
2. As a user, I want to see and compare how much gas I was charged for and how much gas was consumed by the EVM, when I inspect my transaction in hashscan

## Specification

In order to calculate the `gasUsed` field, the mirror node should have `CONTRACT_ACTION` and `CONTRACT_BYTECODE` sidecars enabled. Then, we would use an enhancement logic in the `mirror-node-importer`,
which will iterate over all `ContractAction` sidecar records for the transaction we want to import and calculate the `gasConsumed` field for.

The new logic would have a mechanism to first calculate the intrinsic gas cost for the transaction being imported. We can inspect if the transaction has a `ContractByteCode` sidecar
related to it. If yes, we have a contract creation transaction and we would calculate the intrinsic gas cost based on the length of the init bytecode. If we don't have such a sidecar,
then the transaction represents a contract call and we would use the default intrinsic gas cost for contract calls, which is 21 000.

On top of the intrinsic gas cost, we would iterate over all `ContractAction`
sidecars and sum up the `gasUsed` field for each of them. The result would be the `gasConsumed` field for the transaction.

The `gas_used` field in `contract_result` table would still have the same semantics and represent the gas that was charged to the user.

## Backwards Compatibility

This HIP we will extend the REST APIs responses related to transaction info with an additional field `gasConsumed`. This won't be a breaking change, but the users should have in mind the introduction of the new field.

## Security Implications

None

## How to Teach This

Respective documentation will be added.

## Reference Implementation

Please follow [this issue](https://github.com/hashgraph/hedera-mirror-node/issues/7543)

## Rejected Ideas

While discussing the implementation of this HIP, we considered the following alternative:

Adding a new `gasConsumed` field to the Record Stream V6 format, which would be a breaking change in the protobuf format and would require a new version of the Record Stream to be introduced.

## References

- [HIP-513](https://hips.hedera.com/hip/hip-513) - Smart Contract Traceability Extension

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
