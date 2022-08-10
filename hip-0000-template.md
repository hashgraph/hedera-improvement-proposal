---
hip: <HIP number (this is determined by the HIP editor)>
title: <HIP title>
author: <a list of the author’s or authors’ name(s) and/or username(s), or name(s) and email(s).>
working-group: a list of the technical and business stakeholders' name(s) and/or username(s), or name(s) and email(s).
type: <Standards Track | Informational | Process>
category: <Core | Service | Mirror | Application>
needs-council-approval: <Yes | No>
status: <Draft | Review | Last Call | Active | Inactive | Deferred | Rejected | Withdrawn | Accepted | Final | Replaced>
created: <date created on>
discussions-to: <a URL pointing to the official discussion thread>
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

Introduce a recommended path of the implementation of minting and maintenance of ecological tokens based on [IWA sustainability](https://github.com/InterWorkAlliance/Sustainability) specifications from the voluntary ecological markets taskforce. This combines and is the first use-case of [dNFT/dFT](https://github.com/trustenterprises/hedera-dnft-specification) on hedera to provide an ability for tokens to attach an unlimited amount of evidence.

_note: dNFTs will form a separate HIP at a generic level, but were initially designed to meet the needs of carbon offsetting._

## Motivation

There are not enough verified carbon credits globally to meet demand. In turn, corporates are overpaying for carbon credits to meet [ESG](https://www.investopedia.com/terms/e/environmental-social-and-governance-esg-criteria.asp) targets. In addition current carbon credit systems are not fit for purpose due to a number of issues including accountability, leakage, and additionally.

## Rationale

Soil is the greatest land store of carbon, and if correct agricultural processes aren't followed this can [trigger a negative effect of carbon stores](https://hedera.com/blog/why-earth-day-2021-means-the-world-to-dovu). At DOVU we believe that such projects should include incentivization structures by default including a layer of accountability so that the carbon capture abilities of soil are optimized.

There are a number of elements that are required:

- A project owner that has been created and is linked to a new [Ecological Project (EP)](https://github.com/InterWorkAlliance/Sustainability/blob/main/vem/supply/ep.md).
- A link between HTS and HCS, a common format.
- A genesis message that would reference the initial asset in terms of a [CCP token](https://github.com/InterWorkAlliance/Sustainability/blob/main/vem/supply/ccp.md).
- State changes of the CCP representation, with versions and updates including additionally and leakage.
- Continued messages, with a common schema that can be used as a mechanism to upload evidence.

I expect that this work will continue to evolve and adjust over time.

## User stories

Provide a list of "user stories" to express how this feature, functionality, improvement, or tool will be used by the end user. Template for user story: “As (user persona), I want (to perform this action) so that (I can accomplish this goal).”

## Specification

### Roles

Roles of the

### A project owner and the creation of an EP

Every project owner is considered a supplier and can create a new (EP)(https://github.com/InterWorkAlliance/Sustainability/blob/main/vem/supply/ep.md) on a per-project basis.

### The HTS to HCS link

The basic dNFT specification describes an approach to how to connect an HTS token to an HCS topic, this is described through a format (these formats would ultimately be a HIP unto themselves)

This is the proposed dNFT ~~name~~ memo format, within 100 bytes.

- The Topic Id of the HCS topic
- The Account ID of the minter
- The Symbol of the proposed
- Optional metadata to describe the dNFT

This could have this generic form below:

> 'ECO:{symbol}_{metadata}:{topic_id}:{account_id}'

In particular, for DOVU we would look at using **cDOV** as our internal reference of a full token representing a tonne of carbon.

> 'ECO:cDOV:{topic_id}:{account_id}'

### The Genesis CCP token message (First HCS message)

The primary rationale behind using CCP specification is due to the unique fungible property. At first

### State Changes to a given project using CCP token spec

### Miscellaneous messages for ongoing evidence proofs.

## Backwards Compatibility

No issues.

## Security Implications

None, the HCS topic must ensure that the issuer or owner of tokens has the permission to send new messages to act as evidence linked to a token. This could potentially be expanded to include auditors.

It's likely that the **owner** of a project will have the core permission to post evidence messages as it is their responsibility to prove intent and results in order for the incentivization structure to trigger.

Care will have to be taken in the design of the token standard to allow for real-life issues where keys could be lost.

## How to Teach This

~~For a HIP that adds new functionality or changes interface behaviors, it is helpful to include a section on how to teach users, new and experienced, how to apply the HIP to their work.~~

## Reference Implementation

Work in progress and looking to invite collaboration on the preferred design of this standard, this needs to be driven from all possible ecological projects in the Hedera eco-system.

~~The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation~~.

## Rejected Ideas

None.

## Open Issues

The Trust Enterprises initial specification of dNFTs has a number of issues:

1) The **name** of the token was used to link to an HCS topic, this will be changed in an official HIP to using the **memo**.
2) It's currently opinionated, has no community consensus, used as a product feature for DOVU and SportsIcon.
3) It's named with **non-fungible** but the token specification does not care if it is divisible, it purely is used as a marketing term to **indicate a token linked to evidence**.
4) In my opinion, there is an expectation that additional HIPs for dNFTs will be created to form a vast number of use-cases as they represent a new genre of token due to flexibility that wasn't possible pre HCS and HTS.
5) It assumes that the issuer of the token is the only entity that can create HCS messages for the given topic.
6) Due to the reduction of HCS message sizes to 1024 bytes there needs to be more reliance on HFS or IPFS services.
7) In particular, for IPFS is to include the [CID](https://docs.ipfs.io/concepts/content-addressing/) within the meta to eliminate the DNS ransom issue for linked content for NFTs.

## References

1. https://github.com/trustenterprises/hedera-dnft-specification
2. https://hedera.com/users/dovu
3. https://hedera.com/blog/why-earth-day-2021-means-the-world-to-dovu
4. https://github.com/InterWorkAlliance/Sustainability/blob/main/vem/supply/ccp.md
5. https://github.com/InterWorkAlliance/Sustainability
6. https://docs.ipfs.io/concepts/content-addressing/
7. https://www.investopedia.com/terms/e/environmental-social-and-governance-esg-criteria.asp
8. https://github.com/InterWorkAlliance/Sustainability/blob/main/vem/supply/ep.md
9. https://github.com/InterWorkAlliance/Sustainability/blob/main/vem/roles.md

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
