---
hip: xxx
title: Fractional NFTs
author: Matthew Smithies <matt.s@dovu.io>, Justyn Spooner <justyn@dovu.io>, Jesse Whiteside <jesse@hashport.network>
working-group: Guardian & ESG
type: Standards Track
category: Core
needs-council-approval: No
status: Draft
created: 2022-08-08
discussions-to: TBA
updated: N/A
---

## Abstract

This HIP specifies the need for fractional NFTs within the Hedera eco-system, the purview for this capability is specifically viewed through the lens of ESG assets, such as tokenised carbon credits, to be fractional when primarily created through the Guardian. As ESG assets created are unique they philosophically act more like an NFT as compare to fungible counterparts as they are backed by a real-world asset that is not interchangeable.

Additionally, this HIP suggests a specification update for adding this capability, simply put to enable decimals within NFT token types. It also includes a view to deal with backwards capability issues for NFT token transfers.

Naturally, outside the scope of ESG, fractional NFTs would be highly welcome in many other use cases on the network as they are present on EVM ecosystems.

## Motivation

One of the current downsides of NFTs on Hedera are that they are incapable of having decimals, or in other words fractional. Particularly for ESG assets, like carbon credits, this is a particular problem as it becomes impossible to make micro payments due to the lack of fractional or divisable NFTs upon creation, is where one token equals one tonne of carbon.

If we so wish to mint fractional tokens for emissions or credits at a sub-tonne granularity we require divisible NFTs on token creation.

Here are some additional points:

- Partial ownership/division of NFTs is already a thing in EVM land, the network should align with common patterns.
- It would be preferable to mirror specifications like CRUs (as NFTs) as Hashport has NFT bridge capability, thus all guardian derived ESG assets would be multi-chain by default.
  - This would inevitably open up easier business development and integration between ecosystems, so DOVU’s generated credits could potentially be bundled into FlowCarbon’s GNT-type assets.
  - Thus there would be a greater vector for pooling assets to back stable coins using a range of tokenised commodities (carbon, soya, wheat etc).
- We’re not going to get away from the need for micropayments, KG-level (or less) offsetting.
- In traditional markets, or centralised registries like Gold Standard, a carbon credit represents 1 tonne of removal or reduction. Without this and by potentially going against the grain by minting where 1 token equals 1 kg will result in non-compliant and non-standardised assets, as well as causing additional onboarding friction for external market actors due to the mismatch.
- All tokens are backed by a real asset (NFTs fit that definition moreso then fungible types)
- To be compliant to the IWA Framework for minting carbon removals with fractional granularity we currently need to use Core Carbon Principles (CCP) token instead of the NFT equivalent, Carbon Removal Credits (CRUs).

Leveraging Hashport as a key piece of infrastructure in ensuring that any ESG asset minted on Hedera is multi-chain (EVM) by default would be a killer application network-wide for both marketplaces, exchanges, and project owners to get access to more capital present on other networks.


## Rationale

In short, enable optional decimal usage on the creation of NFTs token types and add optional values for transfer functions.

With regards to Hashport's NFT bridging capability, it at present can only process a single NFT at a time, this would be a challenge for larger volumes of ESG assets but if a precedent was set by minting tokens with this method it would provide a provable route for migration of NFT collections across networks, perhaps with a specific ESG bridging module.

## User stories

1. As a carbon project owner I want to ensure that by carbon credits can be traded on as many platforms as possible
2. As a marketplace I want to mint fractional NFTs with the guardian as to ensure client success by providing the largest vector for access to capital to benefit my clients.
3. As an organisation, such as an airline, that offers automatic offset as a benefit for product purchase I want sub-tonne granularity in offsetting my clients carbon footprint.
4. As a standard registry who is minting credits I want to use fractional NFTs to ensure that I can be compliant with the IWA CRU specifications
5. As a NFT project owner I want to use fractional NFTs so that they can be owned by various parties, this could make it affordable to acquire a fractional slice of an NFT.

## Specification

Below the specification will be focusing upon using with the JS SDK as a developer, however it can be applied to any SDK or core HAPI services.

### Creating a NFT, with the adding of decimals to the Create Transactions

The only difference here is *unlocking* decimals for NFTs, inside of any documentation we can refer to them as *fractional*, but we retain the same method names as per fungible token types.


```
const transaction = new TokenCreateTransaction()
  .setTokenName(collection_name)
  .setTokenType(TokenType.NonFungibleUnique)
  .setSupplyType(TokenSupplyType.Finite)
  .setSupplyKey(operatorPrivateKey)
  .setTokenSymbol(symbol)
  .setTreasuryAccountId(account_id)
  .setMaxSupply(supply)
  .setInitialSupply(0)
  .setDecimals(4) // Allowing decimals
```

### Minting an NFT, using set amount

The default functionality, seen below, will be backward compatible as previously expected that is NFTs will be generated in batches up to 10, based on the setMetadata array size. It will default to mint whole NFTs, if the decimals are set to zero.

```
const transaction = await new TokenMintTransaction()
  .setTokenId(token_id)
  .setMetadata(nftBatchBuffer)
  .freezeWith(client)
```

However, there would need to be a slight update for minting, this is set below with 4 tokens being minted with the granularity of 4 decimal places.

- If a NFT has decimals tokens cannot be batched, using an array inside of setMetadata must only have 1 entry.
- The amount is used to mint based on the setAmount value, as per how fungible HTS tokens work

```
const transaction = await new TokenMintTransaction()
  .setTokenId(token_id)
  .setMetadata(nftSingleBuffer)
  .setAmount(4 * 4 ** 1000)
  .freezeWith(client)
```

### Transfer an NFT

Below is an example of transferring an NFT, for the *addNftTransfer* method amount has been optional for NFTs that have decimals.

```
const transfer = await new TransferTransaction()
  .addNftTransfer(new NftId(token_id, serial_number), Config.accountId, receiver_id, amount)
  .execute(client)
```

## Backwards Compatibility

There are a number of effects of fractional NFT tokens in the ecosystem, these *shouldn't* cause immediate concern, and the ability to process them is opt-in based on a given external teams priority needs.

All previous NFTs on network need to be considered "non-fractional" by default, this would imply that the "decimal" value of all historic NFTs would be zero. For any `addNftTransfer` inside of `TransferTransaction` calls we would require a forth field in the method signature to represent `value`

In docs this could be the changes:

Previous `addNftTransfer(<nftId>, <sender>, <receiver>)`

New `addNftTransfer(<nftId>, <sender>, <receiver>, <value = 1 (default if not changed)>)`

However, in particular SDK implementations, like JS, there are at present 4 fields within the signature of the `addNftTransfer` method which is on the cusp of being overloaded, there would need to be careful thought on whether it would be more appropriate to refractor some of these methods, or to include the optional `value` property inside of an `nftId` object.

### Wallets and downstream clients

All wallets or clients may behave in the same manner to view or manipulate NFTs, using the same code, however for fractional NFTs there would be a requirement to update codebases to handle updated decimal, in the same way fungible tokens are processed.

## Security Implications

None, other than NFTs working in the same fashion as using decimals on Fungible token types.

## How to Teach This

Update the documentation, updated blog post of the feature to cover the new feature, new code examples driven through the core developer advocates, perhaps with bounties.

## Reference Implementation

TBC (see specification for early approach/design)

## Rejected Ideas

The approach that EVM-based solutions take is through using smart contracts, by ingesting ERC721 tokens then provide an extended capability for fractionalisation. For Hedera services it makes more sense to add this feature as part of core HTS. However, with this in mind fractional NFTs may likey be needed to bridge as a whole unique to form ERC721, for EVM ecosystem compatibility.

## Open Issues


## References

1. [IWA Framework](https://interwork.org/wp-content/uploads/2021/11/Digital-MRV-Framework-1.0.pdf)
2. [NFT porting Hashport](https://app.hashport.network/nft-port)
3. [What are fractional NFTs?](https://learn.bybit.com/nft/what-are-fractional-nfts/)


## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
