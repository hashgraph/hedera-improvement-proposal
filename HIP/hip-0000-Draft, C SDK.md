---
hip: TBD
title: C SDK
author: Greg Scullard (gregscullard@hedera.com), Romain Menetrier (rm@emblock.co)
working-group: Greg Scullard (gregscullard@hedera.com), Romain Menetrier (rm@emblock.co)
type: Standards Track
category: Application
needs-council-approval: No
status: Draft
created: 2021-12-09
discussions-to: 
updated: 
requires: NA
replaces: NA
superseded-by: NA
---

## Abstract

This HIP concerns the creation of a C SDK which is currently missing from the family of Hedera SDKs. There is a .NET SDK which supports C#, however in the context of IOT, a native C implementation is often a requirement. 

## Motivation

As IOT projects take hold, particularly in the field of sustainability, an SDK which is easy to use in IOT development environments is highly desirable. A C SDK would also be preferred by many gaming solutions. 

## Rationale

While the initial impetus behind a C SDK was borne from an IOT mind set, the SDK should be usable in all contexts and not limited to a particular desktop or IOT chipset.

A .NET SDK exists which enables development in C#, however in the context of IOT or non-microsoft platforms, this requires the use of abstraction layers which may not always be fully compatible with the target platform and may result in heavier/more complex binaries. 

## User stories

As a C developer, I want to be able to use the SDK to build solutions natively in C that can interact with Hedera.

As an IOT developer, I want to be able to deploy code to my IOT platform regardless of my choice of architecture (ARM, ESP...) so that my device can interact with Hedera.

As a game developer, I want to be able to build a game natively in C such that it can interact with Hedera.

As a C developer, I want to be able to leverage all of Hedera's Services (Crypto, Consensus, Files, Tokens, Smart Contracts).

## Specification

* The C SDK must be open source under the Apache 2.0 licence
* The C SDK must follow existing SDK conventions to ease developer adoption and documentation
* The C SDK must include examples for developers to get started with minimal effort
* The C SDK must be cross-platform meaning compilation can be targeted towards IOT devices (any architecture) as well as desktop environments
* The C SDK must enable signing for transactions using private keys, including key lists and threshold keys
* The C SDK must support external signing by way of a custom implementation such as a Hardware Signing Module, which is not embedded in the SDK itself. The SDK should present the equivalent of an interface/specification for the custom implementation to adhere to
* The C SDK must support a list of nodes to submit transactions to at random
* The C SDK must implement appropriate retry mechanism in the event a node is temporarily unavailable
* The C SDK must implement the generation of new private keys, as well as the recovery of existing keys from mnemonics or a string representation of the key
* The C SDK must implement getting Receipts and Records (and the associated error handling and retry/timeout)
* The C SDK must support the Crypto Service (Create Account, Transfer, etc...)
* The C SDK must support the Consensus Service (Create Topic, Submit message, etc...)
* The C SDK must support the File Service (Create File, Append to File, Get File Contents, etc...)
* The C SDK must support the Token Service (Create fungible token, Create non fungible token, Mint token, Transfer token, etc...)
* The C SDK must support the Smart Contract Service (Create Contract, Call Contract, Local Call, etc...)
* The C SDK must support mirror subscriptions for HCS topic messages

## Backwards Compatibility

None at this stage.

## Security Implications

None at this stage.

## How to Teach This

The SDK will include code examples for developers new to the SDK to quickly familiarise themselves with it, for example:

* Creating and account
* Making a hbar transfer
* Getting a receipt for a transaction

## Reference Implementation

None at this stage.

## Rejected Ideas

None.

## Open Issues

None.

## References

[Java SDK as inspiration for the C SDK](https://github.com/hashgraph/hedera-sdk-java)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
