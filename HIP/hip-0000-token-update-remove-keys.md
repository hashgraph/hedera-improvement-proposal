---
hip: 0000
title: Remove existing keys from a Token
author: Justyn Spooner (@justynjj)
working-group: Justyn Spooner
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-08-05
discussions-to: https://docs.google.com/document/d/1P-qeYaXOcPIKCkTvfqFSbuVWfgrwvf0pwNMbGfurNjI/edit?usp=sharing
updated: 2022-10-05
requires: N/A
replaces: N/A
superseded-by: N/A
---

## Abstract

This proposal will result in a modification to the `TokenUpdateTransaction` feature to allow the admin key to sign an update to remove itself and/or any other key (Wipe, KYC, Freeze, Pause, Supply, Fee Schedule) from a Token.

## Motivation

Many NFT projects require that their Token remains immutable yet many project owners have unknowingly created NFTs with keys such as Admin, Wipe, Freeze and Pause set which undermines this assumption.

The majority of Collectors will also be unaware of the implications of having these keys set on the NFTs they have purchased.

For example, an NFT with a [Wipe Key](https://docs.hedera.com/guides/docs/sdks/tokens/wipe-a-token) set poses a risk to the owner that the NFT could at any point be burned even though it's not in the treasurey account.

Right now there is no way to remove keys (Admin, Wipe, KYC, Freeze, Pause, Supply, Fee Schedule) from a Token. They can only be updated.

## Rationale

Ashe Oro raised the following question in this [tweet](https://twitter.com/Ashe_Oro/status/1553089797610160128)

> What % of #Hedera NFTs have either an Admin, Wipe or Freeze key set?

@TMCC_Patches responded with these stats:

> w/ wipe or freeze keys: 66,914
>
> w/o 707,178

A large proportion of the creators of those 66,914 NFTs are likely unaware of the implications those keys have on their collection.

Without highlighting specific projects in this HIP, there are a number of high profile NFT collections circulating right now that have some or all of these keys set. After reaching out to a few of the creators, the first thing they have all said is that they did not realise and how can we remove them.

These conversations have led to this HIP as right now there is no way for a creator to address this issue in their collections which are already distributed to collectors.

DPub raises a requirement for this on Discord [here](https://discord.com/channels/373889138199494658/768621337865486347/943265960704479292)

> ...can you remove the admin key? Use case - is setup the token, mint - make sure it is all good - if not - burn. if good - make immutable - remove adminkey and supplykey
> i thought we were able to - but testing - doesn't look like there is a way to set to null. setAdminKey() doesn't do anything. We could create a throwaway adminkey, but people might not believe that

Topachi from Hbar Suite also raises a requirement for this feature in [Discord](https://discord.com/channels/373889138199494658/768621337865486347/989981510125879316)

> Could you guys please do this? Because in the future we might need to remove some keys if the community wishes, and it would be much easier with a permanent token update instead of creating a v2 of our token.

The only way to "address" this currently is to either:

1. Mint a brand new collection without the admin/wipe/freeze keys set and airdrop to everyone who had the v1 version
2. Generate a bad key to replace the existing keys in the token as suggested in the [Hedera Discord token-service channel](https://discord.com/channels/373889138199494658/768621337865486347/990019307897520169)
   > There is, however, a quick-and-dirty way to make an NFT collection un-wipeable:
   >
   > - Choose a low-entropy Ed25519 public key; for example, 32 bytes of binary zeros or hex abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd.
   > - In a single TokenUpdate, replace both the admin and wipe keys of the NFT collection with this public key.
   > - Now to wipe an NFT in this collection, you would have to invert the SHA-512 hash function, which is...going to take a while.

Neither of these approaches is ideal and could easily be solved by allowing the keys to be wiped as part of a `TokenUpdateTransaction` call.

## User stories

As a creator I want to remove the Wipe Key on my existing NFT collection so that collectors can be assured their NFT can't be removed from their account.
As a creator I want to remove the Admin Key on my existing NFT collection so that I can be sure my NFT is immutable.
As a creator I want the flexibilty to remove keys as my project evolves. For example, I might start out with KYC as a requirement and later decide that it is not necessary.
As an NFT minting service I want to be able to mint an NFT collection on behalf of a creator using our private key and then update the Treasurey Account to the creator's account whilst simultaneously removing the admin key so the creator ends up with an immutable NFT collection in their Treasurey Account.

## Specification

If set as part of the initial Token creation, all these keys should be removable as part of a `TokenUpdateTransaction`:

- Admin Key
- Wipe Key
- KYC Key
- Freeze Key
- Pause Key
- Supply Key
- Fee Schedule Key

Example `TokenUpdateTransaction` to remove all keys from a Token.

```js
let transaction = new TokenUpdateTransaction({
  tokenId: "0.0.123456",
  kycKey: null,
  freezeKey: null,
  pauseKey: null,
  wipeKey: null,
  supplyKey: null,
  feeScheduleKey: null,
  adminKey: null,
});
```

TODO: `null` might not be the best way to express this. It might be better to have some constant that does this instead such as `Key.Empty`. Open to suggestions here.

**Requirements**

- If the Admin key is removed as part of other changes in the update transaction, then all other updates should happen first and the admin key removed last to avoid any `TOKEN_IS_IMMUTABlE` errors.
- If a key doesn't exist on the Token and a call is made to remove it then return a `TOKEN_HAS_NO_SUPPLY_KEY`, `TOKEN_HAS_NO_PAUSE_KEY` etc. This error response is the same as when trying to update a key that doesn't exist.

## Backwards Compatibility

## Security Implications

## How to Teach This

The documentation for the [Token Service - Token Update](https://docs.hedera.com/guides/docs/sdks/tokens/update-a-token) would be updated to add examples on how to remove keys from a Token.

## Reference Implementation

## Rejected Ideas

## Open Issues

The specification needs updating with something a bit more concrete. I'm not sure if passing `null` is the best way to express removing a key. It might be better to have some constant that does this instead such as `Key.Empty`.

## References

[Token Service Docs - Token Update](https://docs.hedera.com/guides/docs/sdks/tokens/update-a-token)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
