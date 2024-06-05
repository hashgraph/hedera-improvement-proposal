---
hip: 980
title: Enhance mirror node rest APIs with timestamp query parameter
author: Ivan Kavaldzhiev <ivan.kavaldzhiev@limechain.tech>
working-group: Steven Sheehy <@steven-sheehy>, Nana Essilfie-Conduah <nana@swirldslabs.com>
type: Standards Track
category: Mirror
needs-council-approval: Yes
status: Draft
created: 2024-06-03
requested-by: 
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/981
---

## Abstract

This HIP enhances part of the mirror node REST APIs to support querying by timestamp. This will allow users to query for tokens, transactions, and accounts that were created at a specific timestamp.

## Motivation

To enhance user experience and allow users or developers to query data from a specific point in time we will add a timestamp query parameter to some of the REST APIs, which are missing this support.
This change will be especially valuable for building the foundation of the so-called shadow fork functionality, where a user or developer can use a local mirror node instance but run it against a production environment state.
Having this support, users or developers will have the ability to use public state data to simulate and troubleshoot existing issues or replay historical transactions using local mirror node instance against production state.

## Rationale

Users may want to run historical transactions on a local mirror node instance using public state data. To make this possible, some of the existing REST APIs should be enhanced with a timestamp query parameter, so that historical public data can be fetched and used
for the simulations.

## User stories

- As a user of mirror node, I want to be able to query historical data for accounts, contracts, tokens, and transactions that were created at a specific timestamp.
- As a user of mirror node, I want to be able to run locally an `eth_call`, `eth_estimateGas` or `eth_debugTraceTransaction` call that fails on a production environment against the corresponding public state.
- As a developer of mirror node, I want to be able to test new feature locally against a real life data from a public environment, so that I have better understanding of the feature behavior.

## Specification

The proposed enhancement involves adding a query parameter `timestamp` to the existing routes:

- `/api/v1/accounts/{idOrAliasOrEvmAddress}/tokens` to return correct historical information about an account and their associated tokens for a specific timestamp
- `/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/crypto` to return correct historical information about an account's crypto allowances for a specific timestamp
- `/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/nfts` to return correct historical information about an account's NFT allowances for a specific timestamp
- `/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/tokens` to return correct historical information about an account's token allowances for a specific timestamp
- `/api/v1/tokens/{tokenId}/nfts/{serialNumber}` to return correct historical information about an NFT for a specific timestamp

**Timestamp Query Parameter**

A new `timestamp` query parameter will be added to search for different resources. This query parameter will represent a consensus timestamp in a Unix format in `seconds.nanoseconds` format and will have an optional comparison operator. That is, it will search for results that `equal`, `not equal`, are `greater` or `less` than the timestamp itself or its seconds component.

`/api/v1/accounts/{idOrAliasOrEvmAddress}/tokens?timestamp={value}`
`/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/crypto?timestamp={value}`
`/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/nfts?timestamp={value}`
`/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/tokens?timestamp={value}`
`/api/v1/tokens/{tokenId}/nfts/{serialNumber}?timestamp={value}`

**Request**
```
/api/v1/accounts/{idOrAliasOrEvmAddress}/tokens?timestamp={value}
```
**Example Request**

```
GET api/v1/accounts/4408244/tokens?order=desc?timestamp=1705334449.803393003
```
Note: if ```limit``` is not specified in the request, response will be limited to 25 by default

**Response**

```json
{
  "tokens": [
    {
      "automatic_association": true,
      "balance": 1,
      "created_timestamp": "1705334449.803393003",
      "decimals": 0,
      "token_id": "0.0.4328145",
      "freeze_status": "NOT_APPLICABLE",
      "kyc_status": "NOT_APPLICABLE"
    }
  ],
  "links": {
    "next": null
  }
}
```

## **Backwards Compatibility**

The change is backwards compatible as it is simply adding а query parameter to an existing route. The data required to filter by timestamp is already stored in the mirror node.

## Security Implications

Historical timestamp filtering can slow down some of the queries, especially if the timestamp is not indexed or the data set is very large.

## Rejected Ideas

None

## References

https://mainnet-public.mirrornode.hedera.com/api/v1/docs/#/accounts/idOrAliasOrEvmAddress/tokens
https://mainnet-public.mirrornode.hedera.com/api/v1/docs/#/accounts/idOrAliasOrEvmAddress/allowances/crypto
https://mainnet-public.mirrornode.hedera.com/api/v1/docs/#/accounts/idOrAliasOrEvmAddress/allowances/nfts
https://mainnet-public.mirrornode.hedera.com/api/v1/docs/#/accounts/idOrAliasOrEvmAddress/allowances/tokens
https://mainnet-public.mirrornode.hedera.com/api/v1/docs/#/tokens/tokenId/nfts/serialNumber

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](https://www.notion.so/LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
