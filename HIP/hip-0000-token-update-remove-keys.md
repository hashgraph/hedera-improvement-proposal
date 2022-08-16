---
hip: 0000
title: Remove Existing Keys From A Token
author: Justyn Spooner <justyn@dovu.io>
working-group: Justyn Spooner <justyn@dovu.io>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-08-05
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/545
updated: 2022-10-05, 2022-10-12, 2022-10-16
---

## Abstract

This proposal will result in a modification to the `TokenUpdateTransaction` feature to allow the admin key to sign an update to remove itself and/or any other key (Wipe, KYC, Freeze, Pause, Supply, Fee Schedule) from a Token. Each key will also be able to sign an update to remove itself from the token.

## Motivation

Many NFT projects require that their Token remains immutable yet many project owners have unknowingly created NFTs with keys such as Admin, Wipe, Freeze and Pause set which undermines this assumption.

The majority of collectors will also be unaware of the implications of having these keys set on the NFTs they have purchased.

For example, an NFT with a [Wipe Key](https://docs.hedera.com/guides/docs/sdks/tokens/wipe-a-token) set poses a risk to the owner that the NFT could at any point be burned even though it's not in the treasury account.

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

- As a creator I want to remove the Wipe Key on my existing NFT collection so that collectors can be assured their NFT can't be removed from their account.
- As a creator I want to remove the Admin Key on my existing NFT collection so that I can be sure my NFT is immutable.
- As a creator I want the flexibility to remove keys as my project evolves. For example, I might start out with KYC as a requirement and later decide that it is not necessary.
- As an NFT minting service I want to be able to mint an NFT collection on behalf of a creator using our private key and then update the treasury account to the creator's account whilst simultaneously removing the admin key so the creator ends up with an immutable NFT collection in their treasury account.
- As a creator of an NFT which has no Admin Key but does have a Wipe Key, I want to be able to remove the Wipe Key

## Specification

There are two approaches I see how this feature could manifest itself in the SDKs. I'll use the JS SDK as an example.

### Option 1. Extend `TokenUpdateTransaction` to Support Removing Keys

All these keys should be removable as part of a `TokenUpdateTransaction` if present on a Token:

- Admin Key
- Wipe Key
- KYC Key
- Freeze Key
- Pause Key
- Supply Key
- Fee Schedule Key

**An example `TokenUpdateTransaction` to remove all keys from a Token.**

```js
let transaction = new TokenUpdateTransaction({
  tokenId: "0.0.123456",
  kycKey: Key.None,
  freezeKey: Key.None,
  pauseKey: Key.None,
  wipeKey: Key.None,
  supplyKey: Key.None,
  feeScheduleKey: Key.None,
  adminKey: Key.None,
});
```

We can’t use `null` as the value for these fields because behind the scenes protobuf removes them for optimisation. This is why a constant is used here instead - `Key.None`.

### Option 2. Dedicated Remove Key Action

An alternative approach might be to have a dedicated transaction `RemoveKeysTransaction`.

This would take 3 parameters
`tokenId` - The token to update
`removeKey` - An enum representing a key Key.Wipe, Key.Freeze etc
`removeKeys` - An array of Key enums [Key.Pause, Key.FeeSchedule, Key.Admin]

**An example of removing the wipe key from an NFT**

```js
const transaction = new RemoveKeysTransaction()
  .setTokenId(tokenId)
  .setRemoveKey(Key.Wipe)
  .freezeWithClient(client);

// Sign the transaction with the admin key if present on the token or with the wipe key
const signTx = await transaction.sign(adminKey || wipeKey);
```

**An example of removing multiple keys from a Token that has no Admin Key set**

```js
const transaction = new RemoveKeysTransaction()
  .setTokenId(tokenId)
  .setRemoveKeys([Key.Pause, Key.FeeSchedule, Key.Kyc])
  .freezeWithClient(client);

// Sign the transaction with each key we want to remove from the token
const signPauseTx = await transaction.sign(pauseKey);
const signFeeScheduleTx = await transaction.sign(feeScheduleKey);
const signKycTx = await transaction.sign(kycKey);
```

**Requirements**

- If the Admin key is removed as part of other changes in the update transaction, then all other updates should happen first and the admin key removed last to avoid any `TOKEN_IS_IMMUTABLE` errors.
- If a key doesn't exist on the Token and a call is made to remove it then return a `TOKEN_HAS_NO_SUPPLY_KEY`, `TOKEN_HAS_NO_PAUSE_KEY` etc. This error response is the same as when trying to update a key that doesn't exist.

## Backwards Compatibility

## Security Implications

## How to Teach This

The documentation for the [Token Service - Token Update](https://docs.hedera.com/guides/docs/sdks/tokens/update-a-token) would be updated to add examples on how to remove keys from a Token.

## Reference Implementation

## Rejected Ideas

## Open Issues

Greg Scullard raises an important point on why an early decision was made to prevent the removal of keys:

> Generally speaking, whenever a key is set on an entity, it cannot be removed (so the same applies to supply, freeze, etc... keys). This is an early design decision which makes sense for some keys, if you had a freeze key and frozen accounts, unsetting the key would mean these accounts would be frozen for ever, unless a check is made which could be costly in terms of performance… - Greg Scullard [Discord](https://discord.com/channels/373889138199494658/616725732650909710/935199340555800616)

## References

[Token Service Docs - Token Update](https://docs.hedera.com/guides/docs/sdks/tokens/update-a-token)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
