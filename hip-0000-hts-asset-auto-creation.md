---
hip: <HIP number (this is determined by the HIP editor)>
title: Payer-sponsored auto-account creation with HTS assets
author: Michael Tinker (@tinker-michaelj)
working-group: Neeha Sompalli (@Neeharika-Sompalli )
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 08-08-2022
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/541
requires: HIP-32
---

## Abstract

[HIP-32](https://hips.hedera.com/hip/hip-32) defined a new way to create Hedera account, by submitting a `CryptoTransfer` 
that sends hbar to a protobuf representation of a key, which is called an _alias_.

When this alias has not already been used in a such a `CryptoTransfer`, and the sent hbar is enough to cover the account 
creation fee, then the network creates a new account with the key implied by the alias. It deducts the account creation fee 
from the sent hbar, and uses whatever is left over as the new account's balance. 

This means auto-account creation does not work when sending only a units of a fungible token or an NFT to a new alias, 
because an hbar fee cannot be deducted from such assets. We propose to charge auto-account creation fees to the payer of a 
`CryptoTransfer` that sends assets to a new alias anywhere in body of a `CryptoTransfer`; whether in the hbar transfer 
list, or in an HTS token transfer list. (This creation fee will include one auto-association slot, since the new account 
needs it to receive the token asset.)

**IMPORTANT:** We do _not_ propose to make nodes do extra work in precheck estimating implied auto-creation fees. These
fees will be assessed as part of the `CryptoTransfer` service logic; and, as with all other service fees, will not be 
estimated in precheck.

## Motivation

Allowing auto-creation with token assets makes the network better match the expectations of Ethereum users, which allows 
ERC-20 and ERC-721 assets be transferred to an externally operated account (EOA) even _before_ that account has been 
created by sending it value. 

## Rationale

We cannot provide free account creation, for the same DOS risks outlined in HIP-32. There is also no reasonable way to 
convert HTS token units or NFTs into hbar. It follows that the only solution to extend `CryptoTransfer` auto-creation to 
all assets is to deduct the account creation fee from the `CryptoTransfer` payer.

## User stories

- As an NFT creator, I want to send an NFT to an onboarding collector, given only their public key. 
- As a dApp operator, I want to send my native token to an onboarding user in a single transaction, rather
than first needing to submit a `CryptoCreate` and then a `CryptoTransfer`.
  
## Specification

The technical specification for this change is quite minimal, with only two behavior changes:
 - Instead of returning `INVALID_ACCOUNT_ID` when a new alias is credited with a non-hbar asset,
run the same auto-creation logic that currently runs when a new alias is credited with hbar.
 - Instead of deducting the account creation fee from the assets being transferred to a new 
alias, charge this creation fee to the `CryptoTransfer` payer account.

## Backwards Compatibility

Any existing clients that use auto-creation need to be sure the payer account for the 
`CryptoTransfer` can afford an account creation fee, since this fee will no longer be deducted
from the auto-created account's initial balance. 

## Security Implications

This HIP does not change the charging and throttling protections used to secure auto-creation as added in HIP-32. So
we do not perceive any new security implications.

## How to Teach This

"Auto-create an account by sending HTS assets to its desired alias."

## Reference Implementation

Please follow [this issue](https://github.com/hashgraph/hedera-services/issues/3763) for progress
on the reference implementation.

## Rejected Ideas

We briefly considered requiring a simultaneous hbar payment upon auto-creation with an HTS assets; but this would have
eliminated most of the usability gains intended with the HIP.

## Open Issues

A future HIP should propose extending the `tokenTransfer` system precompile to support auto-creation via non-hbar assets.

## References

- [HIP-32](https://hips.hedera.com/hip/hip-32)
- [Reference implementation tracker](https://github.com/hashgraph/hedera-services/issues/3763)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
