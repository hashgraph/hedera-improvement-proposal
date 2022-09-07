---
hip: 0000
title: Zero unit token operations in smart contracts
author: Matthew DeLorenzo <mdelore.ufl@gmail.com>, Vae Vecturne <vea.vecturne@gmail.com>
working-group:
type: Standards track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-09-01
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/563
---

## Abstract

Integer rounding will naturally lead to DeFi contracts sometimes minting or transferring 0 units of a token. But the network rejects 0 units in these operations, forcing contract developers to include special cases that would not be necessary on most networks.

## Motivation

To reduce code, if statement checks, etc inside smart contracts and make DeFi contracts easier to use. To reduce bugs in DeFi applications involving math and rounding.

## Rationale

DeFi contracts using ERC20 standard may mint, burn, and transfer zero tokens.

The rationale should provide evidence of consensus within the community and discuss important objections or concerns raised during the discussion.

When we deprecate farms in our farm contracts by giving them a weighting of 0, the network rejects 0 units in these operations, forcing contract developers to include special cases that would not be necessary on most networks. Currently, all 'SafeHederaTokenService' calls (meaning they require HederaResponseCode.SUCCESS) must be qualified with a statement `if(amount > 0)`, as a 0 amount would result in HederaResponseCode.INVALID_TOKEN_MINT_AMOUNT or similar.

Importantly, ERC20 token standard allows for 0 amount mint, burn, transfer, etc.

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
