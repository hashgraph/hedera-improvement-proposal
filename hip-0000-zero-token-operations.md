---
hip: <HIP number (this is determined by the HIP editor)>
title: Zero unit token operations in smart contracts
author: littletarzan, vae.vecturne
working-group:
type: Standards track
category: Service
needs-council-approval: No
status: Draft
created: Sept 1, 2022
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/563
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

Integer rounding will naturally lead to DeFi contracts sometimes minting or transferring 0 units of a token. But the network rejects 0 units in these operations, forcing contract developers to include special cases that would not be necessary on most networks.

## Motivation

To reduce code, if statement checks, etc inside smart contracts and make DeFi contracts easier to use. To reduce bugs in DeFi applications involving math and rounding.

## Rationale

DeFi contracts using ERC20 standard may mint, burn, and transfer zero tokens.

The rationale should provide evidence of consensus within the community and discuss important objections or concerns raised during the discussion.

## User stories

As a solidity developer, I would like to send 0 tokens in my smart contracts. 
  
## Specification

The response code for token mint, burn, and transfer returns SUCCESS = 22

## Backwards Compatibility

This would be backward compatible.

## Security Implications



## How to Teach This



## Reference Implementation



## Rejected Ideas



## Open Issues



## References



## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
