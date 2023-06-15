---
hip: 
title: Contract Scheduled Token Create
author: Nana Essilfie-Conduah (@nana-ec)
working-group: Richard Bair (@rbair23), Jasper Potts (@jasperpotts)
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2023-06-14
discussions-to: 
---

## Abstract

This proposal addresses the feature gap of a smart contracts ability to designate another account to the autoRenew and treasury roles on a token during creation.

Since smart contracts executions do not utilize the Hedera signature map they are unable to carry along the authorizations that the Hedera ledger uses to confirm an accounts participation and acknowledgment in a transaction. 

To address this Smart Contracts can utilize the Hedera Schedule Service by submitting a scheduled transaction to which accounts can sign / authorize as an acceptance of the role assignment.

## Motivation

In many DeFi scenarios a contract may create a token and desire to set another account (EOA or contract) to play a role on the token entity such as the treasurer or the autoRenew account. In each case the account would be responsible for carrying out actions that are critical to the token life cycle and may at time incur a cost (value debit) to the account or transaction submission fees.

However, under the Hedera Smart Contract Service (HSCS) Security Model v2 it is not possible to authorize a contract in advance to modify an accounts property or cause a debit to their balance without their authorization. This essentially means treasurer and autoRenew accounts can only take on the value of the contract creating the token.

This is a step back in the Hedera UX that is made easier by the use of in transaction signatures.

## Rationale

By providing a secure mechanism to assign accounts roles on tokens, smart contracts can continue to be used for more decentralized operation whiles still maintaining the integrity of account sovereignty by allowing account to approve or reject role assignments.

## User stories

1. As an EOA I would like to initiate a smart contract transaction that creates a token and assigns other accounts to autorenew and or treasurer operator roles.
2. As an EOA I would like to initiate a smart contract transaction that signs off and accepts a token operator roles assigned to the contract.
3. As an EOA I would like to initiate a smart contract transaction that retrieves the token address of a scheduled token create tranaction
  
An example of an E2E flow would see an EOA `Ama` call contract account `B` which then calls a variation of the `IHTS` `createToken()` methods to create a token `C` which assigns EOA `Dede` as a treasurer account and EOA `Eric` as the autoRenew account. 
Upon execution of the transaction by the system contract logic on a consensus node will submit a synthetic `ScheduleCreate` transaction with the desired `TokenCreate` as the inner transaction. The transaction execution will return the address of the `ScheduleId` to the calling contract `B`. 
For token `C` to be created both `Dede` and `Eric` will have to submit a `ScheduleSignTransaction` (via HSS system contract or SDK) using the returned ScheduleAddress/ScheduleID. The action of submitting a signed `ScheduleSign` transaction will serve as an approval of the scheduled `TokenCreate` in which they will assume a role. 
When the last signature is obtained by a network node the scheduled `TokenCreate` will be submitted as a child transaction and the resulting token address will be returned in the execution or a future query. 

## Specification

The ledger HSCS will utilize the existing Scheduled transaction service supported on the ledger within the System contract logic. 

To achieve this the Hedera Token Service (HTS) system contract logic must be updated to create scheduled transactions and utilize scheduled transaction features.

### Hedera Token Service (HTS) system contract

The `IHederaTokenService` interface must be updated to explicitly 

- capture scheduled token creations
- obtain the token address that will be created by the successful execution of the scheduled transaction.
- capture the details of a scheduled token creation for clarity

|   Hash        |   Selector                                                                                                                |
|---------------|---------------------------------------------------------------------------------------------------------------------------|
| `0xe780c5d3`  | `getScheduledFungibleTokenCreateTransaction(address scheduleAddress) returns (FungibleTokenInfo memory tokenInfo)`        |
| `0x14749042`  | `getScheduledNonFungibleTokenCreateTransaction(address scheduleAddress) returns (NonFungibleTokenInfo memory tokenInfo)`  |
| `0xf616ec93`  | `getScheduledTokenAddress(address scheduleAddress) returns (int64 responseCode, address tokenAddress)`                    |
| `0x4742876e`  | `scheduleCreateFungibleToken(…) returns (address scheduleAddress)`                                                        |
| `0xa001e7d2`  | `scheduleCreateFungibleTokenWithCustomFees(…) returns (address scheduleAddress)`                                          |
| `0xbbaa57c2`  | `scheduleCreateNonFungibleToken(…) returns (address scheduleAddress)`                                                     |
| `0x228fa74a`  | `scheduleCreateNonFungibleTokenWithCustomFees(…) returns (address scheduleAddress)`                                       |

## Backwards Compatibility

Backwards compatibility is ensured as no existing features are modified. Similar to HTS system contract this HIP simply exposes HAPI entity functionality.

## Security Implications

Existing security consideration such as throttles for both Scheduled transactions and TokenCreate will remain applicable. 
Additional considerations may include

### Storage considerations

Schedule transaction timespan will continue to be honored and scheduled transactions will be removed from memory upon execution or expiration.

### Fee considerations

Gas collections should encompass the following aspects of the network

- Storage cost via fees
- EVM execution work via gas
- Consensus Node execution work via fees

## How to Teach This



## Reference Implementation


## Rejected Ideas

A few options were considered prior to this, notable considerations were

1. An update to the `TokenCreate` HAPI transaction to optionally leave out signatures for treasury and autoRenew, with the requirement that a future `TokenUpdate` transaction would be required by the treasurer and autoRenew accounts to either accept or reject their assignments. The normal functioning of a token would be halted until roles had been accepted. Additionally, the concept of a `TokenAccountOperator` enum would have been introduced in the protobuf to capture various operator roles. On the system contracts additonal functions (`defaultTokenOperators()`,  `authorizeTokenOperator(address operator, uint operatorType)` and `revokeTokenOperator(address operator, uint operatorType)`) to expose query, apporval and rejection logic. These function were inspired by EIP 777. 


## Open Issues

1. How can a consensus node retrieve the valid TokenAddress given a ScheduleAddress. On the Mirror Node this will be possible by following ScheduleAddress → ScheduleId → Schedule transaction execution timestamp → Token Create child transaction → recordFile Token Id. However, this information isn’t available to the consensus node. Should a ScheduleId → TokenId map be created and persisted?

## References



## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
