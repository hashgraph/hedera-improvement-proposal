---
hip: 17
title: Perpetual Commissions Upon DSA(Digital Scarce Asset] Transfer
author: Mike (@corviato1)
type: Feature
category: Smart Contract, or Protocol Level
status: Draft
created: 2021-04-15
discussions-to: https://github.com/<idk, somewhere I guess?>
---

## Abstract

Hedera defines two standard ways to write addresses: with-checksum or no-checksum. The with-checksum format consists of a no-checksum address followed by a 5-letter checksum. In the HTML JavaScript demonstration, enter an address in no-checksum format in the top box and click CONVERT to convert it to the with-checksum format in the second box. Or enter one manually in that box, and click VERIFY to see if it is valid or invalid.

## Motivation

The benefits of cryptographically secured at a core (or close to core level) royalty protocol for DSAs should be self-evident.

## Rationale

In the Hedera public ledger, each entity (account, file, smart contract, topic, token type) has an address such as `0.0.123` that is used to refer to it in transactions sent to the ledger. In the past, it was typical for applications such as wallet software to use that format. However, a user attempting to type in such an address might accidentally leave out a digit, or swap two digits, or modify a digit. If the result is an actual account, this could result in hbars being transferred to the wrong account.

It is therefore useful to catch such errors before the transaction is sent to the network. So this HIP defines a standard for an alternative address format that is designed to help prevent such mistakes. The old no-checksum format continues to be valid, but the new with-checksum format extends it by appending a 5-letter checksum to the address.

## Specification

The ability to modify an asset so that a second gas fee may be tied to each time a non issuing asset is transferred.
Gas fee is a number set by the issuer, with the option for the gas price to increase by x% with a compound, no compound switch.
This ability should have a lock or leave unlocked option like when changing the ipfs of main assets and subassets, with all data points able to be seen on chain.
Obviously this feature needs the highest level of functionality on wallets that have the ability to issue DSAs.


## Backwards Compatibility

There should be a failsafe for when an DSA holder needs to transfer the wallet to a different wallet that the holder owns for whatever reason.  This can be done by negating any fee when the DSA is sent back to the original issuer (or perhaps just validator node operator).  This can be done by the DSA holder getting in touch with the [chosen] responsible party, explaining the situation and kindly ask them to forward the DSA to the desired address once the responsible party receives it.  A side benefit of this is: should the issuer want to reclaim the asset, they would not have to pay the specified fee that would just rebound to their wallet.

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

## References

## Copyright/license

No copyright/license, you Hedera can just have this idea.  Happy to take part in an open source endeavor. 🤙