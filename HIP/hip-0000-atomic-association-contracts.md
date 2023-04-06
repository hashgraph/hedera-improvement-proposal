---
hip: 0000
title: Waived association requirement for atomic transfers for smart contracts
author: Matthew DeLorenzo <mdelore.ufl@gmail.com>, Vae Vecturne <vea.vecturne@gmail.com>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2023-04-06
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/696
---

## Abstract

Smart contracts are required to be associated with all tokens they custody. This makes sense when the contract has a long lived balance > 0; Hedera state is expanded and must be paid for in ongoing maintenance and storage costs to the network. However, there are many use cases that call for smart contracts atomically taking custody of a token, often to transfer to another entity within the same contract call. In this case, association is still required but Hedera state is not expanded.

We propose that association not be required for Hedera entities that only custody a token during an atomic transaction.

## Motivation

Currently, a smart contract attempting to custody an unassociated token will be immediately rejected by the network. This presents a problem in some decentralized finance (DeFi) applications that use smart contracts to atomically custody tokens. Decentraliztion may be achieved by allowing contracts to remain token agnostic, but also prevent spamming attacks by allowing any user to associate tokens to a DeFi smart contract. 

## Rationale

Periphery contracts for decentralized exchanges (DEXes), such as Uniswap V2 and V3, are designed to atomically custody tokens. For DEXes on Hedera, gas-inefficient workarounds are used to associate and dissociate tokens to periphery smart contracts, paid by end-users.

## Specification

Hedera Smart Contract Service optimistically allows custody of any token for smart contracts, and checks at the end of a contract call that tokens are associated to entities whose balance is changing from zero to nonzero. 

### Successful

The response code for token transfer of a token not associated to a smart contract, whose balance is equal to zero at the end of the transaction, is SUCCESS = 22.

### Revert

The response code for token transfer of a token not associated to a smart contract, whose balance is nonzero at the end of the transaction, is TOKEN_NOT_ASSOCIATED_TO_ACCOUNT = 184, or a new enum TOKEN_NOT_ASSOCIATED_TO_CONTRACT.

## User stories

As a solidity developer, I do not want to associate tokens to a smart contract that custodies tokens but is not designed to have token balances.

## Backwards Compatibility

This would be backward compatible.

## Security Implications

Increased complexity of Hedera Smart Contract Service may lead to vulnerabilities.

## How to Teach This

N/A

## Reference Implementation
#### Example :
Example of a transfer transaction that should be allowed:

```
/**
     * @dev Example function to transfer entire balance of unassociated tokens
     * @param token The HTS token to transfer
     * @param treasury The recipient of the token transfer (is associated to token)
     */
     function function1(address token, address recipient) external {
        require(IERC20(token).balanceOf(address(this)) == 0);
        HederaTokenService.dissociateToken(token, address(this));
        // assumes msg.sender approved an allowance to address(this)
        HederaTokenService.transferToken(token, msg.sender, address(this), 1);
        int respCode = HederaTokenService.transferToken(token, address(this), recipient, 1);
     }
```
Example of a transfer transaction that should not be allowed:

```
/**
     * @dev Example of a function call that should fail because address(this) balance is nonzero at end of function call
     * @param token The HTS token to transfer
     * @param treasury The recipient of the token transfer (is associated to token)
     */
     function function2(address token, address recipient) external {
        require(IERC20(token).balanceOf(address(this)) == 0);
        HederaTokenService.dissociateToken(token, address(this));
        // assumes msg.sender approved an allowance to address(this)
        HederaTokenService.transferToken(token, msg.sender, address(this), 2);
        HederaTokenService.transferToken(token, address(this), recipient, 1);
     }
 ```

## Rejected Ideas

None as of yet.

## Open Issues

None as of yet.

## References

None.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
