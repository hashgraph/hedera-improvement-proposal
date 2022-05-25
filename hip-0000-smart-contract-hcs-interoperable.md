---
hip: <HIP number (this is determined by the HIP editor)>
title: Interoperability Between Smart Contracts and the HCS
author: John Conway (@scalemaildev)
type: Standards Track
category: Core
needs-council-approval: <Yes | No>
status: Draft
created: 05-17-2022
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/479
updated: 05-24-2022
requires: N/A
replaces: N/A
superseded-by: N/A
---

## Abstract

Enable smart contract interaction with the Hedera Consensus Service, by allowing contracts to create, read, and write to HCS topics.

## Motivation

Interoperability between the HCS and smart contracts would enable developers to leverage HCS-stored data in their dApps.

## Rationale

1. By enabling smart contracts to interact with the HCS, this would allow the creation of HCS-based Oracles. For example, a smart contract could subscribe to a private or public topic in order to read its external data, such as the prices of crypto-assets.

2. This would also enable topic-based NFT minting rights. A smart contract could ingest an HCS topic to calculate the user's available NFTs. Then, after minting the NFT and transferring it to the user, the smart contract could update that same HCS topic. Currently, this process is only achievable via a centralized, server-based chain of events (such as on [https://hashandslash.io](hashandslash.io)).

3. Any other Oracle use case could be repurposed by the HCS.

## User stories

As a developer, I want to be able to read HCS topics from my smart contracts.

As a developer, I want to be able to send HCS topic messages from my smart contracts.

As a developer, I want to be able to create HCS topics from my smart contracts.
  
## Specification

Enabling smart contracts to interact with HCS topics would follow the same approach as the [https://hips.hedera.com/hip/hip-206](HTS pre-compiled contracts HIP).

## Backwards Compatibility

All HIPs that introduce backward incompatibilities must include a section describing these incompatibilities and their severity. The HIP must explain how the author proposes to deal with these incompatibilities. HIP submissions without a sufficient backward compatibility treatise may be rejected outright.

## Security Implications

With regards to signing transactions from within a smart contract, the main concern is storing private keys in-state. So, some possible solutions are:

1. Give a different kind of permission to deployed smart contracts for interacting with certain topics. This could function similarly to how AWS differentiates between key-based permissions and role-based permissions.
2. Follow the same approach from the [https://hips.hedera.com/hip/hip-206](HTS pre-compiled contracts HIP) to signing transactions and interacting with topics.

## How to Teach This

For a HIP that adds new functionality or changes interface behaviors, it is helpful to include a section on how to teach users, new and experienced, how to apply the HIP to their work.

## Reference Implementation

The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation.

## Rejected Ideas

Throughout the discussion of a HIP, various ideas will be proposed which are not accepted. Those rejected ideas should be recorded along with the reasoning as to why they were rejected. This both helps record the thought process behind the final version of the HIP as well as preventing people from bringing up the same rejected idea again in subsequent discussions.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

While a HIP is in draft, ideas can come up which warrant further discussion. Those ideas should be recorded so people know that they are being thought about but do not have a concrete resolution. This helps make sure all issues required for the HIP to be ready for consideration are complete and reduces people duplicating prior discussions.

## References

https://hedera.com/blog/use-cases-for-hcs-based-records-in-play-to-earn-nft-gaming

https://hashandslash.io

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
