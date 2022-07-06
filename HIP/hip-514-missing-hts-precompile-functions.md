---
hip: 514
title: Hedera Token Service Precompiled Contract Token Management Functions
author: Nana Essilfie-Conduah (@Nana-EC)
working-group: Danno Ferrin (@shemnon)
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-06-22
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/516
updated: 2022-06-28
requires: 206
---

## Abstract

The Hedera Smart Contract Service (HSCS), through the initial implementation of [HIP 206](https://hips.hedera.com/hip/hip-206), allows contracts to create, transfer, mint, burn, associate, and dissociate tokens programmatically. However, following this, there remains limited capability to interact with and manage tokens in more intricate scenarios.

## Motivation

Allow smart contract developers on Hedera similar capabilities in token management as developers using HTS.

## Rationale

The Hedera Smart Contract Service (HSCS) aims to provide developers with the ability to manage tokens via smart contracts.
Currently, capability is limited to create, transfer, mint, burn, associate, and dissociate actions.
Whereas, HTS provides additional capabilities including update, pause, kyc, freeze and info retrieval.
This means smart contract developer cannot capitalize on valuable HTS supported scenarios and can therefore not expose these in their contracts and DApps.

To allow for more rich smart contract scenarios, these limitations on the HSCS should be addressed by providing capability parity where possible with HTS.

## User stories

As a smart contract developer, I would like to retreive fungible token metadata details through a precompile contract.

As a smart contract developer, I would like to retreive non-fungible token metadata details through a precompile contract.

As a smart contract developer, I would like to modify a tokens entity properties through a precompile contract.

As a smart contract developer, I would like to modify a tokens KYC permissions through a precompile contract.

As a smart contract developer, I would like to retreive a tokens KYC status through a precompile contract.

As a smart contract developer, I would like to modify a tokens Freeze state through a precompile contract.

As a smart contract developer, I would like to retreive a tokens Freeze status through a precompile contract.

As a smart contract developer, I would like to modify a tokens Pause state through a precompile contract.

As a smart contract developer, I would like to retreive a tokens Pause status through a precompile contract.

As a smart contract developer, I would like to retrieve a tokens fee properties through a precompile contract.

As a smart contract developer, I would like to retrieve a tokens key properties through a precompile contract.

As a smart contract developer, I would like to delete a token through a precompile contract.

As a smart contract developer, I would like to wipe an amount of fungible tokens from an account balance through a precompile contract.

As a smart contract developer, I would like to wipe an amount of non-fungible tokens from an account balance through a precompile contract.

## Specification

### EVM Precompile extension

The [IHederaTokenService.sol Solidity file](../assets/hip-206/solidity/IHederaTokenService.sol) is further extended with new types and function signatures that the precompile will respond to. 

### New Solidity Types

The following structs have been added to simplify the interface between Solidity and the HTS precompile: 

| Name                      | Definition                                                            |
|---------------------------|-----------------------------------------------------------------------|
| `CustomFee`               | `(FixedFee, FractionalFee, RoyaltyFee, address)`                      |
| `TokenInfo`               | `(HederaToken, uint64, bool, bool, bool, CustomFee[], string)`        |
| `FungibleTokenInfo`       | `(TokenInfo, uint32)`                                                 |
| `NonFungibleTokenInfo`    | `(TokenInfo, uint64, address, uint32, bytes, bool, address, string)`  |

The additional structs build upon existing structs and in most add network info (e.g. ledgerId) or differentiating token information (e.g. fungible vs non-fungible).

#### CustomFee
`CustomFee` struct defines the fees collected and the collection account when transferring a Hedera Token:

| Field                             | Meaning                               |
|-----------------------------------|---------------------------------------|
| `FixedFee`                        | The fixed fee for the token           |
| `FractionalFee`                   | The fractional fee for the token      |
| `RoyaltyFee`                      | The royalty fee for the token         |
| `address feeCollectorAccountId`   | The account to receive the custom fee |

* Note that a valid `CustomFee` will have **only one** valid fee i.e. `FixedFee` or `FractionalFee` or `RoyaltyFee`.

#### TokenInfo
`TokenInfo` struct defines the basic properties of a Fungible or Non-Fungible Hedera Token:

| Field                     | Meaning                                                                                           |
|---------------------------|---------------------------------------------------------------------------------------------------|
| `HederaToken token`       | The hedera token.                                                                                 |
| `uint64 totalSupply`      | The number of tokens (fungible) or serials (non-fungible) of the token                            |
| `bool deleted`            | Specifies whether the token is deleted or not                                                     |
| `bool defaultKycStatus`   | Specifies whether the token kyc was defaulted with KycNotApplicable (true) or Revoked (false)     |
| `bool pauseStatus`        | Specifies whether the token is currently paused or not                                            |
| `CustomFee[] customFees`  | The custom fees collected when transferring the token                                             |
| `string ledgerId`         | The ID of the network ledger                                                                      |

Note that the tokenId and type of token (fungible or non-fungible) is not specified in the `TokenInfo` struct - it is implied 
by the specific precompile function being called (see the functions below).

#### FungibleTokenInfo
`FungibleTokenInfo` struct defines the basic properties of a Fungible Hedera Token:

| Field                 | Meaning                                               |
|-----------------------|-------------------------------------------------------|
| `TokenInfo tokenInfo` | The shared hedera token info                          |
| `uint32 decimals`     | The number of decimal places a token is divisible by  |

#### NonFungibleTokenInfo
`NonFungibleTokenInfo` struct defines the basic properties of a Non Fungible Hedera Token:

| Field                     | Meaning                                                                                       |
|---------------------------|-----------------------------------------------------------------------------------------------|
| `TokenInfo tokenInfo`     | The shared hedera token info                                                                  |
| `uint64 serialNumber`     | The serial number of the nft                                                                  |
| `address ownerId`         | The account id specifying the owner of the non fungible token                                 |
| `uint32 creationTime`     | The epoch second at which the token was created.                                              |
| `bytes metadata`          | The unique metadata of the NFT                                                                |
| `address spenderId`       | The account id specifying an account that has been granted spending permissions on this nft   |
| `string ledgerId`         | The ID of the network ledger                                                                  |

### Solidity Function Signatures

The ABI signature and hashes for token management functions are as follows:

| hash        | effective signature                               | return                    |
| ------------|---------------------------------------------------|---------------------------|
| `927da105`  | `allowance(address, address, address)`            | `(uint256)`               |
| `e1f21c67`  | `approve(address, address, uint256)`              | `(uint256)`               |
| `7336aaf0`  | `approveNFT(address, address, uint256)`           | `(uint256)`               |
| `098f2366`  | `getApproved(address, uint256)`                   | `(uint256, address)`      |
| `f49f40db`  | `isApprovedForAll(address, address, address)`     | `(uint256, bool)`         |
| `367605ca`  | `setApprovalForAll(address, address, bool)`       | `(uint256)`               |
| `46de0fb1`  | `isFrozen(address, address)`                      | `(bool)`                  |
| `f2c31ff4`  | `isKyc(address, address)`                         | `(bool)`                  |
| `f069f712`  | `deleteToken(address)`                            | `(bool)`                  |
| `15c981cb`  | `getTokenAutoRenewInfo(address)`                  | `(address, uint32)`       |
| `ae7611a0`  | `getTokenCustomFees(address)`                     | `(CustomFee[])`           |
| `a7daa18d`  | `getTokenDefaultFreezeStatus(address)`            | `(bool)`                  |
| `335e04c1`  | `getTokenDefaultKycStatus(address)`               | `(bool)`                  |
| `3f28a19b`  | `getFungibleTokenInfo(address)`                   | `(FungibleTokenInfo)`     |
| `1f69565f`  | `getTokenInfo(address)`                           | `(TokenInfo)`             |
| `8946344a`  | `getTokenKey(address, uint)`                      | `(KeyValue)`              |
| `2c20dcd1`  | `getNonFungibleTokenInfo(address, uint32)`        | `(NonFungibleTokenInfo)`  |
| `5b8f8584`  | `freezeToken(address, address)`                   | `(bool)`                  |
| `a9b86b17`  | `unFreezeToken(address, address)`                 | `(bool)`                  |
| `8f8d7f99`  | `grantTokenKyc(address, address)`                 | `(bool)`                  |
| `af99c633`  | `revokeTokenKyc(address, address)`                | `(bool)`                  |
| `7c41ad2c`  | `pauseToken(address)`                             | `(bool)`                  |
| `3f8cc5c2`  | `unPauseToken(address)`                           | `(bool)`                  |
| `9790686d`  | `wipeTokenAccount(address, address, uint32)`      | `(uint32)`                |
| `1da62b01`  | `wipeTokenAccount(address, address, [uint64])`    | `([uint64])`              |
| `2cccc36f`  | `updateTokenInfo(address, HederaToken)`           | `(HederaToken)`           |
| `9acf3fb7`  | `updateTokenAutoRenewInfo(address, uint32)`       | `(address, uint32)`       |
| `5a0b5654`  | `updateTokenKeys(address, uint, KeyValue)`        | `(TokenKey[])`            |


### Gas Costing

The proposed token management functions will build upon the [Precomiled Gas Cost described in HIP 206](https://hips.hedera.com/hip/hip-206) 
The cost of contract function calls will track closely to the canonical cost of its HTS call (see [Hedera Fees]( https://www.hedera.com/fees/)) converted to gas.
The additional smart contract cost will be based on the number of executed EVM instructions and the contract complexity.

| Function                                        | Base Gas Cost      | Incremental Cost      |
| ------------------------------------------------|--------------------|-----------------------|
| `allowance(address, address, address)`          | xx gas             | 0 gas                 |
| `approve(address, address, uint256)`            | xx gas             | 0 gas                 |
| `approveNFT(address, address, uint256)`         | xx gas             | 0 gas                 |
| `getApproved(address, uint256)`                 | xx gas             | 0 gas                 |
| `isApprovedForAll(address, address, address)`   | xx gas             | 0 gas                 |
| `setApprovalForAll(address, address, bool)`     | xx gas             | 0 gas                 |
| `isFrozen(address)`                             | xx gas             | 0 gas                 |
| `isKyc(address)`                                | xx gas             | 0 gas                 |
| `deleteToken(address)`                          | xx gas             | 0 gas                 |
| `getTokenAutoRenewInfo(address)`                | xx gas             | 0 gas                 |
| `getTokenCustomFees(address)`                   | xx gas             | 0 gas                 |
| `getTokenDefaultFreezeStatus(address)`          | xx gas             | 0 gas                 |
| `getTokenDefaultKycStatus(address)`             | xx gas             | 0 gas                 |
| `getFungibleTokenInfo(address)`                 | xx gas             | 0 gas                 |
| `getTokenInfo(address)`                         | xx gas             | 0 gas                 |
| `getTokenKey(address, uint)`                    | xx gas             | 0 gas                 |
| `getNonFungibleTokenInfo(address, uint32)`      | xx gas             | 0 gas                 |
| `freezeToken(address, address)`                 | xx gas             | 0 gas                 |
| `unFreezeToken(address, address)`               | xx gas             | 0 gas                 |
| `grantTokenKyc(address, address)`               | xx gas             | 0 gas                 |
| `revokeTokenKyc(address, address)`              | xx gas             | 0 gas                 |
| `pauseToken(address)`                           | xx gas             | 0 gas                 |
| `unPauseToken(address)`                         | xx gas             | 0 gas                 |
| `wipeTokenAccount(address, address, uint32)`    | xx gas             | 0 gas                 |
| `wipeTokenAccount(address, address, [uint64])`  | xx gas             | xx gas / serial token |
| `updateTokenInfo(address, HederaToken)`         | xx gas             | 0 gas                 |
| `updateTokenAutoRenewInfo(address, uint32)`     | xx gas             | 0 gas                 |
| `updateTokenKeys(address, uint, KeyValue)`      | xx gas             | xx gas / key          |

## Backwards Compatibility

This HIP builds upon existing Solidity structs and Protobuf messages.
As such, it is in compliance with previous iterations and should not impact compatibility.

## Security Implications

The HIP provides exposure to existing HTS functionality.
Fundamentally security is still governed by the ledger security logic in combination with the EVM.
As such, there should be no security implications in decreased security or increased permissions.

## How to Teach This

- Additonal documentation on [IHederaTokenService.sol](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/IHederaTokenService.sol) and [HederaTokenService.sol](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaTokenService.sol)
- Client code will be provided with a `TokenManageContract.sol` under [hts-precompile](https://github.com/hashgraph/hedera-smart-contracts/tree/main/hts-precompile)
- SDK examples should be written to highlight solidity token management function calls.
- Doc site tutorials utilizing SDKs should be written to highlight solidity token management function calls.

## Reference Implementation



## Rejected Ideas

The option to create a new precompile solidity file was rejected as the additional functions will benefit from the structure and logic of the current functions

## Open Issues

Regarding [### Solidity Function Signatures][#solidity-function-signatures]
- Is the `CustomFee[]` optimal on `getTokenCustomFees()` or should a coordinated set of `FixedFee[]`, `FractionalFee[]` and `RoyaltyFee[]` be used instead?

## References

- [Hedera Token Service Developer Docs](https://docs.hedera.com/guides/docs/hedera-api/token-service)
- Solidity Support Code
  - [Response Codes](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaResponseCodes.sol)
  - [Interface ABI Calculations](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/IHederaTokenService.sol)
  - [Helper Class](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaTokenService.sol) to avoid Solidity's EXTCODESIZE check.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
