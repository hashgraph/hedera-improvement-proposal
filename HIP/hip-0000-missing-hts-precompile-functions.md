---
hip: <HIP number (this is determined by the HIP editor)>
title: Hedera Token Service Precompiled Contract Token Management Functions
author: Nana Essilfie-Conduah (@Nana-EC)
working-group: Danno Ferrin (@shemnon)
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-06-22
discussions-to: <a URL pointing to the official discussion thread>
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

The Hedera Smart Contract Service (HSCS) through the inital implemtation of [HIP 206](https://hips.hedera.com/hip/hip-206) allows contracts to create, transfer, mint, burn, associate, and dissociate tokens programmatically. However, following this there remains limited capability to interact with and manage tokens in more intricate scenarios.

## Motivation

Allow smart contract developers on Hedera similar capabilities in token management as developers using HTS.

## Rationale

The Hedera Smart Contract Service (HSCS) aims to provide developers with the ability to manage tokens via smart contracts.
Currently, capability is limited to create, transfer, mint, burn, associate, and dissociate actions.
Whereas, HTS provides additional capabilties including update, pause, kyc, freeze and info retrieval.
This means smart contract developer cannot capitalize on valuable HTS supported scenarios and can therefore not expose these in their contracts and DApps.

To allow for more rich smart contracts scenarios these limitations on the HSCS should be addressed by providing capability parity where possible with HTS.

## User stories

As a smart contract developer, I would like to retreive fungible token metadata details through a precompile contract.

As a smart contract developer, I would like to retreive non fungible token metadata details through a precompile contract.

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

The additional structs build upon existing structs and in most add network info (e.g. ledgerId) or differentiating token information (e.g. fungible vs non fungible).

#### CustomFee
`CustomFee` struct defines the fees collected and the collection account when transfering a Hedera Token:

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
| `address accountId`       | The account id specifying the owner of the non fungible token                                 |
| `uint32 creationTime`     | The epoch second at which the token was created.                                              |
| `bytes metadata`          | The unique metadata of the NFT                                                                |
| `address spenderId`       | The account id specifying an account that has been granted spending permissions on this nft   |
| `string ledgerId`         | The ID of the network ledger                                                                  |

### Solidity Function Signatures

Two functions are defined for creating fungible and non-fungible tokens each. One is a simple version with just the required fields and the other is a full version supporting custom fees. The ABI signature and hashes for each call are as follows:

| hash      | effective signature                               | return                    |
| ----------|---------------------------------------------------|---------------------------|
| ``        | `isFrozen(address)`                               | `(bool)`                  |
| ``        | `isKyc(address)`                                  | `(bool)`                  |
| ``        | `deleteToken(address)`                            | `(bool)`                  |
| ``        | `getTokenAutoRenewInfo(address)`                  | `(address, uint32)`       |
| ``        | `getTokenCustomFees(address)`                     | `(CustomFee[])`           |
| ``        | `getTokenDefaultFreezeStatus(address)`            | `(bool)`                  |
| ``        | `getTokenDefaultKycStatus(address)`               | `(bool)`                  |
| ``        | `getFungibleTokenInfo(address)`                   | `(FungibleTokenInfo)`     |
| ``        | `getTokenInfo(address)`                           | `(TokenInfo)`             |
| ``        | `getTokenKey(address, uint32)`                    | `(KeyValue)`              |
| ``        | `getNonFungibleTokenInfo(address, uint32)`        | `(NonFungibleTokenInfo)`  |
| ``        | `freezeToken(address, address)`                   | `(bool)`                  |
| ``        | `unFreezeToken(address, address)`                 | `(bool)`                  |
| ``        | `grantTokenKyc(address, address)`                 | `(bool)`                  |
| ``        | `revokeTokenKyc(address, address)`                | `(bool)`                  |
| ``        | `pauseToken(address)`                             | `(bool)`                  |
| ``        | `unPauseToken(address)`                           | `(bool)`                  |
| ``        | `wipeTokenAccount(address, address, uint32)`      | `(uint32)`                |
| ``        | `wipeTokenAccount(address, address, [uint64])`    | `([uint64])`              |
| ``        | `updateTokenInfo(address, HederaToken)`           | `(HederaToken)`           |
| ``        | `updateTokenAutoRenewInfo(address, uint32)`       | `(address, uint32)`       |
| ``        | `updateTokenKeys(TokenKey[])`                     | `(TokenKey[])`            |


### Gas Costing

The proposed token management functions will build upon the [Precomiled Gas Cost described in HIP 206](https://hips.hedera.com/hip/hip-206) 
The cost of contract function calls will track closely to the canonical cost of its HTS call (see [Hedera Fees]( https://www.hedera.com/fees/)) converted to gas.
The additonal smart contract cost will be based on the number of executed EVM instructions and the contract complexity.

| Function                                         | Base Gas Cost      | Incremental Cost      |
| -------------------------------------------------|--------------------|-----------------------|
| `isFrozen(address)`                              | xx gas             | 0 gas                 |
| `isKyc(address)`                                 | xx gas             | 0 gas                 |
| `tokenDelete(address)`                           | xx gas             | 0 gas                 |
| `tokenGetAutoRenew(address)`                     | xx gas             | 0 gas                 |
| `tokenGetCustomFees(address)`                    | xx gas             | 0 gas                 |
| `tokenGetDefaultStatus(address)`                 | xx gas             | 0 gas                 |
| `tokenGetInfo(address)`                          | xx gas             | 0 gas                 |
| `tokenGetKey(address, uint32)`                   | xx gas             | 0 gas                 |
| `tokenGetNftInfo(address, uint32)`               | xx gas             | 0 gas                 |
| `tokenFreeze(address, address)`                  | xx gas             | 0 gas                 |
| `tokenUnFreeze(address, address)`                | xx gas             | 0 gas                 |
| `tokenGrantKyc(address, address)`                | xx gas             | 0 gas                 |
| `tokenRevokeKyc(address, address)`               | xx gas             | 0 gas                 |
| `tokenPause(address)`                            | xx gas             | 0 gas                 |
| `tokenUnPause(address)`                          | xx gas             | 0 gas                 |
| `tokenWipeAccount(address, address, uint32)`     | xx gas             | 0 gas                 |
| `tokenWipeAccount(address, address, [uint64])`   | xx gas             | xx gas / serial token |
| `tokenUpdateInfo(address, HederaToken)`          | xx gas             | 0 gas                 |
| `tokenUpdateAutoRenew(address, uint32)`          | xx gas             | 0 gas                 |
| `tokenUpdateKeys(TokenKey[])`                    | xx gas             | xx gas / key          |

## Backwards Compatibility

This HIP builds upon existing Solidity structs and Protobuf messages.
As such, it is in complicance with previosu iterations and should not impact compatability.

## Security Implications

The HIP provides exposure to existing HTS functionality.
Fundamentaly security is still governed by the ledger security logic in combination with the EVM.
As such there should be no security implications in decreased security or increased permissions.

## How to Teach This

- Additonal documentation on [IHederaTokenService.sol](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/IHederaTokenService.sol) and [HederaTokenService.sol](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaTokenService.sol)
- Client code will be provided with a `TokenManageContract.sol` under [hts-precompile](https://github.com/hashgraph/hedera-smart-contracts/tree/main/hts-precompile)

## Reference Implementation



## Rejected Ideas

The option to create a new precompile solidity file was rejected as the additonal functions will benefit from the structure and logic of the current functions

## Open Issues

Regarding [### Solidity Function Signatures][#solidity-function-signatures]
- Is the use of `CustomFee[]` acceptable on `tokenGetCustomFees()` or should a coordinated set of `FixedFee[]`, `FractionalFee[]` and `RoyaltyFee[]` be used instead for return

## References

- [Hedera Token Service Developer Docs](https://docs.hedera.com/guides/docs/hedera-api/token-service)
- Solidity Support Code
  - [Response Codes](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaResponseCodes.sol)
  - [Interface ABI Calculations](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/IHederaTokenService.sol)
  - [Helper Class](https://github.com/hashgraph/hedera-smart-contracts/blob/main/hts-precompile/HederaTokenService.sol) to avoid Solidity's EXTCODESIZE check.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
