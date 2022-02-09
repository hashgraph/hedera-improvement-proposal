---
hip: <HIP number (this is determined by the HIP editor)>
title: Allow Token Create Through Hedera Token Service Precompiled Contract
author: Stoyan Panayotov <stoyan.panayotov@limechain.tech>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Review
created: 2022-02-09
discussions-to: <a URL pointing to the official discussion thread>
updated: <comma separated list of dates>
---

## Abstract

Describe the integration of Hedera Token Service (HTS) with the Hedera Smart Contract Service (HSCS), allowing contracts to create tokens programmatically.

## Motivation

Allow smart contract developers on Hedera to create tokens through the HTS precompiled contract.

## Rationale

HIP-206 already allows token mint, burn, associate, dissociate and transfer through the HTS precompiled contract. Allowing creation of tokens via smart contracts is a natural extension of the precompiled contract and would enable to rely solely on contract code for token management. 

## User stories

As a smart contract developer, I want to be able to create Hedera tokens through solidity contract calls.

## Specification

The [Solidity file for development](../assets/hip-206/solidity/IHederaTokenService.sol)
is updated with new types and function signatures that the precompile will respond to. It is
included in this HIP by reference.

`createFungibleToken` will be 

## Backwards Compatibility



## Security Implications



## How to Teach This



## Reference Implementation



## Rejected Ideas



## Open Issues



## References

- [Hedera Token Service Developer Docs](https://docs.hedera.com/guides/docs/hedera-api/token-service)
- Solidity Support Code
  - [Response Codes](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaResponseCodes.sol)
  - [Interface ABI Calculations](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/IHederaTokenService.sol)
  - [Helper Class](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaTokenService.sol) to avoid Solidity's EXTCODESIZE check.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
