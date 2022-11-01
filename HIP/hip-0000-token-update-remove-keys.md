---
hip: 0000
title: Remove Existing Keys From A Token Or Contract
author: Justyn Spooner <justyn@dovu.io>, Cooper Kunz (@cooper_kunz), Jason Fabritz (@bugbytesinc)
working-group: Justyn Spooner (@justynjj), Cooper Kunz (@cooper_kunz), Jason Fabritz (@bugbytesinc)
type: Informational
category: Application
needs-council-approval: No
status: Review
created: 2022-08-05
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/522
updated: 2022-08-05, 2022-08-12, 2022-08-16, 2022-09-06, 2022-09-20
---

## Abstract

All entities across Hedera have opt-in administrative keys. Currently, the Consensus Service and File service allow these keys to be removed (making the entities immutable). However the Contract and Token Services do not provide such a feature consistently. We should enable existing administrative keys for these entities to be able to sign an update transaction that permanently removes any privileged key (Admin, Wipe, KYC, Freeze, Pause, Supply, Fee Schedule) from the entity.

## Motivation

Many NFT projects require that their token remains immutable yet some project owners have unknowingly created NFTs with keys such as Admin, Wipe, Freeze and Pause set which undermines this assumption.

The majority of collectors will also be unaware of the implications of having these keys set on the NFTs they have purchased.

For example, an NFT with a [Wipe Key](https://docs.hedera.com/guides/docs/sdks/tokens/wipe-a-token) set poses a risk to the owner that the NFT could at any point be burned even though it's not in the treasury account.

Right now there is no way to remove keys (Admin, Wipe, KYC, Freeze, Pause, Supply, Fee Schedule) from a Token. They can only be updated.

## Rationale

Currently you’re either in an admin world, or an admin-less world, on Hedera. It’s often preferable to launch in an administrative capacity to ensure things are operating smoothly, and transition into a more admin-less world overtime.

We should also let creators fix mistakes in their token keys. We present some community comments around the subject below:

Ashe Oro raised the following question in this [tweet](https://twitter.com/Ashe_Oro/status/1553089797610160128)

> What % of #Hedera NFTs have either an Admin, Wipe or Freeze key set?

@TMCC_Patches responded with these stats:

> w/ wipe or freeze keys: 66,914
>
> w/o 707,178

A large proportion of the creators of those 66,914 NFTs are likely unaware of the implications those keys have on their collection.

There are a number of high profile NFT collections circulating right now that have some or all of these keys set. After reaching out to a few of the creators, the first thing they have all said is that they did not realise and how can we remove them.

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
- As an author of a smart contract that I am now happy is operating smoothly, I would like to remove the admin key

## Specification

1. Introduce a constant to represent an empty key. This will be used as part of the token and/or contract update calls to remove existing keys.

2. Update all other areas of the SDK that make use of an empty key to use this new constant for consistency.

We use the JS SDK for demonstration using the HTS token entity as an example. The same approaches could be take for the `ContractUpdateTransaction`.

### Extend `TokenUpdateTransaction` to Support Removing Keys

All these keys should be removable as part of a `TokenUpdateTransaction` if they are present on a Token:

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
}).freezeWithClient(client);

// Sign the transaction with the admin key
const signTx = await transaction.sign(adminKey);
```

**Key.None**
We can’t use `null` as the value for these fields because behind the scenes protobuf removes them for optimisation. An empty KeyList could be used however, since this action can't be undone, we propose having a dedicated constant `Key.None`. The constant provides clearer intent which is crucial when dealing with a transaction that can't be reversed.

**Requirements**

- If an empty KeyList is passed in, the SDK should throw an error to avoid accidental removal of keys.
- The `TokenUpdateTransaction` should be able to remove any/all keys from a token if the key exists on the token.
- If the Admin key is removed as part of the update transaction, then all other updates should happen first and the admin key removed last to avoid any `TOKEN_IS_IMMUTABLE` errors.
- If a key doesn't exist on the token and a call is made to remove it then return a `TOKEN_HAS_NO_SUPPLY_KEY`, `TOKEN_HAS_NO_PAUSE_KEY` etc. This error response is the same as when trying to update a key that doesn't exist.
- All transactions to remove a key must be signed with the admin key so if a token has no admin key, then any other keys present can't be removed.
- When a key is removed, the token should appear as if it was created with no key set for that field. For example, if the admin key is removed, then the token should appear as if it was created with no admin key set.

## Backwards Compatibility

This change is fully backwards compatible & opt-in. Existing entities that have been created with administrative keys can continue operating as desired. Entities that have been created without administrative keys can continue operating as desired.

Existing services such as HCS allow you to remove keys using the empty KeyList. Making these services consistent with the proposal above would result in an error being returned. The proposal above uses a dedicated constant to remove keys which is more explicit and less error prone.

## Security Implications

Generally with administrative keys there are security requirements about how to secure and manage these secrets. This becomes increasingly important with this change, as a potential attacker could gain access to the admin keys and subsequently remove them from the entity - however, this would effectively lock/freeze them out, as it would the original administrator. These security considerations are not unique to this proposal and generally consistent with all keys attached to entities within the Hedera network.

## How to Teach This

The documentation for the [Token Service - Token Update](https://docs.hedera.com/guides/docs/sdks/tokens/update-a-token) would be updated to add examples on how to remove keys from a Token.

## Reference Implementation

## Rejected Ideas

There was a discussion to introduce a dedicated method for removing keys. It opened up too many edge cases and since the solution proposed above solves the problem, it was decided to go with that approach.

Here was the second option:

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

// Sign the transaction with the admin key
const signTx = await transaction.sign(adminKey);
```

**An example of removing multiple keys from a Token**

```js
const transaction = new RemoveKeysTransaction()
  .setTokenId(tokenId)
  .setRemoveKeys([Key.Pause, Key.FeeSchedule, Key.Kyc])
  .freezeWithClient(client);

// Sign the transaction with the admin key
const signPauseTx = await transaction.sign(adminKey);
```

## Open Issues

Greg Scullard raises an important point on why an early decision was made to prevent the removal of keys. This should be discussed as part of this HIP review so everyone is clear how removing certain keys could affect the token.

> Generally speaking, whenever a key is set on an entity, it cannot be removed (so the same applies to supply, freeze, etc... keys). This is an early design decision which makes sense for some keys, if you had a freeze key and frozen accounts, unsetting the key would mean these accounts would be frozen for ever, unless a check is made which could be costly in terms of performance… - Greg Scullard [Discord](https://discord.com/channels/373889138199494658/616725732650909710/935199340555800616)

## References

[Token Service Docs - Token Update](https://docs.hedera.com/guides/docs/sdks/tokens/update-a-token)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
