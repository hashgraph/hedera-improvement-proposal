---
hip: 000
title: Fungible Token Metadata Field
author: May Chan (@rocketmay)
working-group: Ashe Oro (@Ashe-Oro)
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2023-01-04
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/627
updated: 2023-01-04
---

## Abstract

This HIP proposes the addition of the metadata field to Fungible Tokens (FT), taking after the Non-Fungible Token (NFT) metadata field which was added in HIP-17.

## Motivation

Similar to NFT's on the network, the fungible token implementation is largely functional. There is a need for a token creator to specify additional "metadata" about the token. The data and formatting is explored in HIP-405 but there is no field suitable for storing the link to this metadata. 

The most 'logical' field proposed to store this data is the existing 'memo' field, however a dedicated metadata field is more appropriate.

## Rationale

The success of HIP-412 in standardizing the NFT space on Hedera demonstrates the potential of standardized metadata functionality for FT's. Wallets, explorers and other applications can display relevant supplementary information about tokens to users in a decentralized fashion.

## User stories

As a token creator, I want a platform-standardized method to host information about my token in a decentralized fashion, allowing applications to query data such as token icon and website.

As a wallet or explorer, I want to query a mirror node to obtain the metadata for any fungible token, similar to current non-fungible token calls, to simplify calls and implementation.

As a developer, I want to store the metadata uri in a dedicated field, to avoid ambiguity of using an overloaded field such as 'memo'.
  
## Specification

## HAPI Changes

```
   // Retrieves the metadata of a token
   rpc getTokenInfo (Query) returns (Response);
```

### TokenMintTransactionBody
Property `metadata` is updated to include all tokens.
```
message TokenMintTransactionBody {
    TokenID token = 1; // The token for which to mint tokens. If token does not exist, transaction results in INVALID_TOKEN_ID
!   uint64 amount = 2; // Applicable to tokens of type FUNGIBLE_COMMON. The amount to mint to the Treasury Account. Amount must be a positive non-zero number represented in the lowest denomination of the token. The new supply must be lower than 2^63.
+   repeated bytes metadata = 3; // Applicable to **all tokens**, previously was only NON_FUNGIBLE_UNIQUE. A list of metadata that are being created. Maximum allowed size of each metadata is 100 bytes
}
```

## Backwards Compatibility

This HIP adds functionality and does not affect other services.

## Security Implications

There are no additional security implications for the addition of metadata to FT's that are different from NFT metadata.

## How to Teach This

The Hedera documentation should be updated to reflect the new field. Specific education on metadata contents and formatting is out of scope. 

## Reference Implementation

The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation.

## Rejected Ideas

Using the existing 'memo' field to store metadata was a suggestion that would not require a HIP. This was rejected by the community in favour of a clearly defined, dedicated field.

## Open Issues

While a HIP is in draft, ideas can come up which warrant further discussion. Those ideas should be recorded so people know that they are being thought about but do not have a concrete resolution. This helps make sure all issues required for the HIP to be ready for consideration are complete and reduces people duplicating prior discussions.

## References

A collections of URLs used as references through the HIP.

https://hips.hedera.com/hip/hip-17 - Non-Fungible Tokens
https://hips.hedera.com/hip/hip-405 - Fungible Token Metadata JSON Schema
https://hips.hedera.com/hip/hip-412 - NFT Token Metadata JSON Schema

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
