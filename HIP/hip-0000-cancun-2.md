---
hip: <HIP number (this is determined by the HIP editor)>
title: Add EVM compatibility for non-supported Cancun blob features.
author: Danno Ferrin (@shemnon)
working-group: // TBD
type: Standards Track
category: Core
needs-council-approval: Yes
status: Draft
created: // TBD
discussions-to: // TBD
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

Add compatibility for Ethereum Mainnet Cancun features relating to Hedera's non-support of EIP-4844 blobs.

## Motivation

In order to maintain maximum compatibility with Ethereum Mainnet there will need to be support for some Blob opcodes in the EVM that behave appropriately in the absence of Blobs support in Hedera.  At the same time, space needs to be preserved in the event Hedera provides similar Blob functionality that needs to be mapped to the EIP-4844 facilities.

## Rationale

In order to both preserve compatibility and future design space we need to act as if blobs are not being added to Hedera.  This allows existing contracts that may depend on blob behavior to continue to function in the absence of blobs.

First we will prevent blobs from entering the system.  There are complex EL/CL interactions in Ethereum Mainnet, but as far as Hedera's consensus is similar to Ethereum Mainnet's, the main entry point is a "Type 3" transaction that allows blobs to be attached. Furthermore, Type 3 transactions require a blob to be attached.  Prohibiting Type 3 transactions will thus be sufficient to keep blobs form entering the EVM's realm of concern and similarly will not prohibit other interactions that are desirable to Hedera.  

Second, we need to support the new opcodes but ensure they operate as they would in the absence of any Blobs.

## User stories

* As a smart contract deployer, I want my smart contract that expects blob support to not fail in unexpected ways.
* As a smart contract user, I will not be able to successfully use contracts that depend on the presence of blobs.
* As a future Hedera Core developer, I want the option to provide blob like behavior using EIP-4844 semantics and existing opcodes. 

## Specification

### EVM Implementation

Two opcodes need to be supported.  The `VERSIONEDHASH` opcode defined in [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) and the `BLOBBASEFEE` operation in [EIP-7516](https://eips.ethereum.org/EIPS/eip-7516).  These opcodes should behave in the same way as though there are no blobs and that there never have been blobs.

For `VERSIONEDHASH` this will result in returning all zeros whenever called, as there are no versioned hashes in the current transaction. This is the behavior if called from a legacy, Type 1, or Type 2 operation.

For `BLOBBASEFEE` this will result in returning `1` at all times, as the blob gas cost cannot adjust below 1.  This will require updating the `TxValues` object with a blob fee of `1`.

### Hedera Services Implementation

The `EthereumTransaction` transaction type in Hedera will need to reject all type 3 transactions as invalid. The services should not need to parse the transactions at this time as all Type 3 transactions will be rejected.  

This behavior should be automatic in current implementation, as all unrecognized types are rejected.  To verify this system tests should be updated to add a valid Type 3 transaction and an invalid transaction starting with the bytes `0x03`.

### JSON-RPC Relay Implementation

The JSON-RPC relay will need to be updated to reject type 3 transactions.  There are two main locations this could be seen.  The `eth_sendRawTransaction` call may receive fully formed Type 3 transactions.  Those should be detected and rejected with a specific error message.  We could parse the transaction and ensure it is a well-formed Type 3 transaction and provide different rejection messages.  For now this will be a distinction without a difference as both valid and invalid Type 3 transactions will be rejected.

Second, we will begin to see calls to the simulation and estimation APIs (`eth_estimateGas`, `eth_call`) that may include fields indicating it is a blob transaction.  In those cases we should similarly detect that a blob transaction is being simulated and reject the transaction before sending it to the simulation and estimation engines.

### Hedera Activation

The operations will be added into a new EVM version of Hedera (notionally version 0.50, but subject to change), like the versions added for Shanghai support (v 0.38) and Paris support (v 0.34).  There will be multiple HIPs rolled into this EVM version.

## Backwards Compatibility

The core EVM library shipping with Hedera as of version 0.46 already contains the needed EVM support.  The activation will add a new Hedera EVM version that will activate all the Cancun support in one release.  The generation of the call frame will need to be updated to set the BlobGasFee to 1.  In prior EVM versions this change will not be accessible.

## Security Implications

It is expected that disabling blobs in this fashion will not result in any new or novel attacks against Hedera or the EVM subsystem.

## How to Teach This

User documentation will need a section discussing Ethereum Mainnet Blobs.  It needs to be made clear that blobs are not supported and that the support of the two opcodes is meant as an affordance to systems that may introduce them in contracts that do not actually require blobs to function correctly, such as Layer 2 contracts.  No tutorials should need to be updated as no useful features are exposed.

## Reference Implementation

//TODO

## Rejected Ideas

The idea of supporting blobs via the Hedera Consensus Service was briefly considered.  Two major blockers made this inviable: (a) HCS messages are limited to the Hedera transaction size (6 Kib total) and (b) there is no way currently to sync consensus messages to the EVM, which may be necessary to ensure the versioned hash matches data submitted to the consensus system.  Future research efforts may result in support of blobs.

## Open Issues

While a HIP is in draft, ideas can come up which warrant further discussion. Those ideas should be recorded so people know that they are being thought about but do not have a concrete resolution. This helps make sure all issues required for the HIP to be ready for consideration are complete and reduces people duplicating prior discussions.

## References

A collections of URLs used as references through the HIP.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
