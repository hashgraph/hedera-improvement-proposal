---
hip: <HIP number (this is determined by the HIP editor)>
title: Expand Allowed Characters for HTS Ticker Symbols
author: John Conway (@scalemaildev)
type: Standards Track
category: Core
needs-council-approval: Yes
status: Draft
created: 2021-11-19
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/231
---

## Abstract

Allow some symbols and non-capitalized alpha characters to be used in HTS ticker symbols.

## Motivation

Expand the flexibility of ticker symbol use cases.

## Rationale

Firstly, allowing numbers into tickers would enable more logical branding of NFT "seasons". Let's say that an NFT, MoroseWolfSkiingClub, uses the ticker $WOLF for their collection. They then want to release a second batch of these NFTs with different graphical options and some unique tokens. Having numbers available to ticker symbols would allow them to brand the second season as $WOLF2 to differentiate it from the first batch.

This same logic applies to fungible tokens, which often go through redeployments and may need to distinguish between contract versions. Allowing developers to tack on a "v2" to the end of a ticker would help to distinguish it from its unsupported original.

Lastly, allowing for symbols such as #, %, &, etc would increase the flexibility of ticker symbols and allow developers to come up with some creative branding. The "space" character should perhaps be exempt from this addition, however, to avoid trailing spaces.

## User stories

As a developer, I want to distinguish NFT seasons and contract versions from the token's ticker symbol.

As a developer, I want as much flexiblity as possible when it comes to my ticker symbols.
  
## Specification

TBD...

## Security Implications

Tickers are already non-unique so there should be no security concerns when it comes to mimicing another HTS token with a *faux ami* character.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
