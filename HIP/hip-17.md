---
hip: 17
title: HTS Non Fungible support
author: Daniel Ivanov (@Daniel-K-Ivanov)
type: Standards Track
category: Service
status: Draft
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/74
---

## Abstract

The HIP defines the changes that must be applied in order for Hedera Services to support Non-fungible tokens.

## Motivation

The benefits of cryptographically secured at a core (or close to core level) royalty pipeline for DSAs(Digitally Scarce Asset) should be self-evident.

## Rationale

Increase diversity of chain functionality

## Specification

The ability to modify an asset so that a second gas fee may be tied to it each time a non issuing asset is transferred.
Gas fee is a number set by the issuer, with the option for the gas price to increase by x% with a compound, no compound switch.
This ability should have a lock or leave unlocked option like when changing the ipfs of main assets and subassets, with all data points able to be seen on chain.
Obviously this feature needs the highest level of functionality on wallets that have the ability to issue DSAs.


## Backwards Compatibility

There should be a failsafe for when a DSA holder needs to transfer the wallet to a different wallet that the holder owns for whatever reason.  This can be done by negating any fee when the DSA is sent back to the original issuer (or perhaps just validator node operator).  This can be done by the DSA holder getting in touch with the [chosen] responsible party, explaining the situation and kindly ask them to forward the DSA to the desired address once the responsible party receives it.  A side benefit of this is: should the issuer want to reclaim the asset, they would not have to pay the specified fee that would just rebound to their wallet.

## Security Implications

Idk, not my department.  Let the paid professionals figure the security out.

## How to Teach This

Once this feature is deployed and in the live marketplace, I’ll happily put together a video tutorial.  And if the effects of strong decentralization are felt, I suspect video tutorials will pop up globally.

## Reference Implementation

None available.  Some NFT platform websites have to have this already.  Maybe opensea.io or something?

## Rejected Ideas

Fire away yo!

## Open Issues

The code and implementation

## Copyright/license

No copyright/license, the Hedera community can just have this idea.  Happy to take part in an open source endeavor. 🤙
{"mode":"full","isActive":false}
