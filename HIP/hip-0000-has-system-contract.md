---
hip: <HIP number (this is determined by the HIP editor)>
title: Hedera Account Service (HAS) System Contract
author: Nana Essilfie-Conduah <@nana-ec>
working-group: Danno Ferrin <@shemnon>, Richard Bair <@rbair23> , Ashe Oro <@ashe-oro>, Atul Mahamuni <@atul-hedera>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-11-28
discussions-to: 
updated: 
requires: 583, 631
replaces: 
superseded-by: 
---

## Abstract

Virtual Addresses introduced a list of ECDSA public addresses that are stored on the account entity and serve as the account identifier on the EVM for transactions. This is in addition to the `Hedera address` that is used by default when no virtual addresses exist.

The result means accounts now have an organized presentation of different address formats that support historical formats and EVM equivlanet formats.
These addresses may 

## Motivation

Prior to HIP 631 smart contracts deployed may have stored an account Hedera address or the extracted public address from an ECDSA public key.
Additioally, when a virtual address is added to an account it will now present itself as the virutal address and no longer the Hedera address.
To avoid issues of lossed balance and permissions it is important that developers can distinguish between Hedera and virutal addresses.

Additionally, many smart contracts utilize ECRECOVER as part of their authorization process in smart contract.
However, this is limited to ECDSA based signatures, which leaves E25519 and complex key types no supported in Hedera.
To provide good user experience an to allow hedera users to enjoy additioal features benfits over EVM equivalanece it is important to provide authorization options in smart contract for non ECDSA keys.

## Rationale

In smart contract operations will provide `msg.sender` values as eithere Hedera addresses or virtual addresses. 
To support authorization flows that check addresses either explicitly in smart contract code the network should support in smart contract distinguishing operations that allow smart contract to distinug between the two forms.
Additionally, to support standard implicit the network should support system contract checks in a manner similar ECRECOVER for easy developer support. 

## User stories

1. As a developer I want to be able to distinguish between Hedera addresses and virtual addresses within a smart contract so I can resolve address mapping in balance or permission scenarios.
2. As a developer I want to be able to confirm account authorization within a contract as I would on Ethereum using `ECRECOVER`.
3. As a developer I want to be able to confirm account authorization for `ECDSA` accounts within a contract without being limited to `ECRECOVER`
4. As a developer I want to be able to confirm account authorization for non `ECDSA` accounts within a contract in a similar fashion as I would on Ethereum
  
## Specification

A new system contract with functions to support address (Hedera and virtual) mapping reconciliation and authorization is proposed.

This will aid developers to support smart contract migration logic for cases where Hedera or virtual address values are encountered. Additionally, EVM developers who were limited to `ECRECOVER`  authorization flows will be able to expand authorization checks to other key types. 

| hash | signature | return | description |
| --- | --- | --- | --- |
|  | getVirtualAddresses(address) | address[] | returns an array of virtual addresses for an address  |
|  | getHederaAddress(address) | address | returns top level Hedera address if applicable |
|  | isVirtualAddress(address) | bool | true if valid evmAddress, false if long-zero or non existing account. |
|  | isAuthorized(address, messageHash, signatureBlob) | bool | true if account is authorized to carry out transaction execution on account. Accepts protobuf key signature blobs. May be used for ECDSA, ED25519 and complex key flows |
|  | isAuthorizedRaw(address, messageHash, signatureBlob) | bool | true if account is authorized to carry out transaction execution on account. Accepts single key raw signature blobs (ECDSA and ED25519). This provides similar logic to ECRECOVER. |

## Backwards Compatibility



## Security Implications

There are no security implications since the ledger and the EVM maintain their authorization capabilities. In fact, it may be argued security is enhanced by the precompile support for contracts to verify both raw and protocol formatted signatures

As always users and developers are responsible for key hygiene and proper storage of keys

## How to Teach This



## Reference Implementation



## Rejected Ideas



## Open Issues


## References

- [ECRECOVER Precompiled Contract](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/vm/precompiled_contracts/ecrecover/index.html)
- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
