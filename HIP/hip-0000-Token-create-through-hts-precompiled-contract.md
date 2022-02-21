---
hip: 358
title: Allow Token Create Through Hedera Token Service Precompiled Contract
author: Stoyan Panayotov <stoyan.panayotov@limechain.tech>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Review
created: 2022-02-09
discussions-to: <a URL pointing to the official discussion thread>
updated: 
---

## Abstract

Describe the integration of Hedera Token Service (HTS) with the Hedera Smart 
Contract Service (HSCS), allowing contracts to create tokens programmatically.

## Motivation

Allow smart contract developers on Hedera to create tokens through the HTS 
precompiled contract.

## Rationale

HIP-206 already allows token mint, burn, associate, dissociate and transfer 
through the HTS precompiled contract. Allowing creation of tokens via smart 
contracts is a natural extension of the precompiled contract and would enable 
to rely solely on contract code for token management. 

## User stories

As a smart contract developer, I want to be able to create Hedera tokens through 
solidity contract calls.

## Specification

### EVM Precompile extension

The [Solidity file for development](../assets/hip-206/solidity/IHederaTokenService.sol) 
is updated with new types and function signatures that the precompile will respond to. 
It is included in this HIP by reference.

### Solidity Function Signatures 

Two functions will be added for creating fungible and non-fungible tokens. A third 
function will enable updating a token with threshold key values for Admin, KYC, 
Freeze, Wipe, Supply, FeeSchedule and Pause keys.
Hedera Tokens have a lot of fields and properties which can be set during creation. 
he following structs will be added to simplify the interface between solidity 
contract developers and the HTS precompile: 

| Name                | Definition                                                                  |
| ------------------- | ----------------------------------------------------------------------------|
| `KeyValue`          | `(bool, address, bytes, bytes, address)`                                    |
| `Expiry`            | `(uint, address, uint)`                                                     |
| `TokenKey`          | `(uint, KeyValue)`                                                          |
| `ThresholdTokenKey` | `(uint, uint, KeyValue[])`                                                  |
| `HederaToken`       | `(string, string, address, string, bool, uint32, bool, TokenKey[], Expiry)` |
| `FixedFee`          | `(uint32, address, address)`                                                |
| `FractionalFee`     | `(uint32, uint32, uint32, uint32, bool, address)`                           |
| `RoyaltyFee`        | `(uint32, uint32, FixedFee, address)`                                       |

The ABI signature and hashes for each call are as follows:

| hash       | signature                                                                          | return                   |
| ---------- | -----------------------------------------------------------------------------------|--------------------------|
|  | `createFungibleToken(HederaToken, uint, uint, FixedFee[], FractionalFee[])`                  | `(bool, addess, bytes)`  |
|  | `createNonFungibleToken(HederaToken, uint, uint, FixedFee[], FractionalFee[], RoyaltyFee[])` | `(bool, addess, bytes)`  |
|  | `setTokenThresholdKeys(address, TresholdTokenKey[])`                                         | `(bool, bytes)`          |

### Precompile Gas Costs

Gas will be priced so that it will be cheaper to do calls directly to HTS rather
than through HSCS where such calls are possible.

### Precompile Transaction Records

Child records for Token Create or Token Update will be created for each precompile call.


## Backwards Compatibility

There are no changes to the protobufs.
The changes in the existing HTS precompile only add new features and capabilities 
and should not impact existing behaviour.

## Security Implications



## How to Teach This

The `IHederaTokenService.sol` interface is well documented and example client code 
is provided in `TokenCreateContract.sol`.

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
