---
hip: TBD
title: Python SDK
author: waylon.jepsen@hedera.com
type: Standards Track
category: Application
needs-council-approval: No
status: Draft
created: 2021-12-01
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/180
updated: 2021-12-01
---

## Abstract

Hedera supports various SDKs for different programming languages. Python is one of the most used programming languages by developers today due to its gentle syntax and gentle learning curve. While python does have its drawbacks, a python SDK would make the hedera services more accessible.

## Motivation

When in an implementation scenario, it’s good to have options for a development team. There has currently been active community discussion about the desire for a python SDK. There is presently a python wrapper class developed by Wengshu that uses a python wrapper with the hedera JavaScript SDK. Python scripting is excellent for minimum viable products and demonstrating logic in proof of concepts. 

## Rationale

Ethereum provides SDKs for various languages.

## User stories

TBA

## Specification

Hedera SDK for python should provide every APIs in Hedera SDK for JAVA

## Backwards Compatibility

No issues.

## Security Implications

No issues.

## How to Teach This

It would be great if this SDK includes example codes for implementations.
For example:
- CreateAccount
- sendTransaction
- getTransactionReceipt
- Etc.

## Reference Implementation

Reference implementation can be found in Hedera Java SDK repo.

## Rejected Ideas

None.

## Open Issues

None.

## References

[Draft of HIP, Hedera Swift SDK](https://github.com/hashgraph/hedera-improvement-proposal/pull/254)
[Eth-brownie](https://eth-brownie.readthedocs.io/en/stable/)
[Discussion](https://github.com/hashgraph/hedera-improvement-proposal/discussions/180)
## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)