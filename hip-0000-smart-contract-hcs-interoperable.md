---
hip: <HIP number (this is determined by the HIP editor)>
title: Interoperability Between Smart Contracts and the HCS
author: John Conway (@scalemaildev)
working-group: a list of the technical and business stakeholders' name(s) and/or username(s), or name(s) and email(s).
type: Standards Track
category: Core
needs-council-approval: <Yes | No>
status: Draft
created: 05-17-2022
discussions-to: <a URL pointing to the official discussion thread>
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

Enable the reading, writing, and creation of HCS topics via smart contracts.

## Motivation

Interoperability between the HCS and Hedera's smart contracts would enable Solidity developers to leverage HCS-stored data.

## Rationale

Enabling smart contracts to read/update/create HCS topics would enable record-based NFT minting. Currently, if we want to restrict the ability to mint an NFT based on a meta record, it has to be done in a centralized fashion. The server would first read the user's record HCS topic, check if the record has valid credit, mint the appropriate NFT, send that NFT to the user's wallet, and then update their HCS topic. However, this could all be done through a smart contract (without the need for a server) if smart contracts had CRUD access to HCS topics.

## User stories

As a developer, I want to be able to read HCS topics from my smart contracts.

As a developer, I want to be able to send HCS topic messages from my smart contracts (needs a payer account).

As a developer, I want to be able to create HCS topics from my smart contracts (needs a payer account).
  
## Specification

The technical specification should describe the syntax and semantics of any new features. The specification should be detailed enough to allow competing, interoperable implementations for at least the current Hedera ecosystem.

## Backwards Compatibility

All HIPs that introduce backward incompatibilities must include a section describing these incompatibilities and their severity. The HIP must explain how the author proposes to deal with these incompatibilities. HIP submissions without a sufficient backward compatibility treatise may be rejected outright.

## Security Implications

If there are security concerns in relation to the HIP, those concerns should be explicitly addressed to make sure reviewers of the HIP are aware of them.

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

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
