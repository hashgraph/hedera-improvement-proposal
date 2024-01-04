---
hip:
title: NFT Allowances
author: Mugdha Goel <mugdha.goel@swirldslabs.com>
working-group: Steven Sheehy (@steven-sheehy),
type: Standards Track
category: Core
needs-council-approval: No
status: Draft
last-call-date-time:
created: 2023-12-07
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/
updated:
---

## Abstract

Hedera customers have requested the ability to view their current NFT allowances. Hence, we propose adding a
new mirror node REST API `/api/v1/accounts/{id}/allowances/nfts` to return this information.

## Motivation

NFT marketplaces have requested the ability to view a NFT allowance's details via an API.

## Rationale
There have been requests to enable querying spending approvals for NFTs based on the owner ID. Additionally, there is a request to be able to query by the spender ID as well. It was also asked for the ability to know whether the approval was given via `approveForAll` or not.

The API described below has been chosen to make the implementation easier for NFT explorers and marketplaces that wish to search NFT allowances based on the owner and spender.The decision to design one API for both use cases is aimed at reducing the number of APIs that essentially perform similar tasks. This API would also return the `approveForAll` information.

## User stories

- As a mirror node operator, I want to provide my API clients with the ability to list NFT allowances for an account that has granted allowance for a specific NFT serial number, as well as for those who have used  `approveForAll`.
- As a mirror node operator, I want to provide my API clients with the ability to list NFT allowances for a spender who has received an allowance for a single NFT serial number, as well as via `approveForAll`.

## Specification

This is a HIP for adding the ability to query the allowances on NFTs from the mirror node.

### Constraints

When designing the NFT allowances APIs, it is important to consider certain constraints on the number of allowances and tokens. These constraints may limit the ability to query unbounded information.

- An approval transaction can include a maximum of 20 allowance change operations.
- An account can have a maximum of 100 hbar, token, and approved for all NFT allowances.
- An account can have an unbounded number of individual NFT allowances.
- A non-fungible token can have an unbounded number of approved for all NFT allowances.
- A specific NFT can only have one explicit approval. The last one to be approved will take precedence.
- When an NFT is transferred by either the owner or a spender, it results in the individual spender's allowance being cleared.
- A specific NFT can have an unbounded number of implicit approved for all NFT allowances.

### Approved for all NFT Allowances API

This API takes a path parameter that represents either the owner or spender, depending on a boolean flag provided as a query parameter called `owner`. If the `owner` value is true, the `accountId` path parameter should indicate the ID of the owner. Conversely, if the `owner` value is false, the `accountId` path parameter should indicate the ID of the spender who has an allowance.

Following is an example response of the NFT allowance API:

GET `/api/v1/accounts/{accountId}/allowances/nfts`

```json
{
  "allowances": [
    {
      "approved_for_all": true,
      "owner": "0.0.1000",
      "spender": "0.0.8488",
      "token_id": "0.0.1033",
      "timestamp": {
        "from": "1633466229.96874612",
        "to": null
      }
    },
    {
      "approved_for_all": false,
      "owner": "0.0.1000",
      "spender": "0.0.8488",
      "token_id": "0.0.1034",
      "timestamp": {
        "from": "1633466229.96874612",
        "to": null
      }
    },
    {
      "approved_for_all": true,
      "owner": "0.0.1000",
      "spender": "0.0.9857",
      "token_id": "0.0.1032",
      "timestamp": {
        "from": "1633466229.96874612",
        "to": null
      }
    }
  ],
  "links": {
		"next": "/api/v1/accounts/0.0.1000/allowances/nfts?limit=2&order=desc&token.id=gte:0.0.1034&account.id=gt:9857"
	}
}
```

Query Parameters:

- `account.id`: Filter by the spender account ID or owner account ID, depending on the owner flag. `ne` operator is not supported.
- `limit`: The maximum number of items to return.
- `order`: Order by `token.id` and `account.id`. Accepts `asc` or `desc` with a default of `asc`.
- `owner`: Indicates whether the path parameter `accountId` is the owner or the spender ID. Accepts a boolean value of `true` or `false` with a default value set to `true`.
- `token.id`: Filter by the token ID. `ne` operator is not supported.

Pagination is important to implement because there are accounts that could have a large number of NFT allowances, making a non-paginated response impractical. This requires multi-column pagination, including owner, spender, and token IDs.

**Ordering**

The order is governed by a combination of the spender ID and the token ID values, with the spender ID being the parent column. The token ID value governs its order within the given spender ID.
**Note**: The default order for this API is currently ASC

**Filtering**

When filtering there are some restrictions enforced to ensure correctness and scalability.

The table below defines the restrictions and support for the endpoint.

| Query Param | Comparison Operator | Support | Description | Example |
| --- | --- | --- | --- | --- |
| account.id | eq | Y | Single occurrence only. | ?spender.id=X |
|  | ne | N |  |  |
|  | lt(e) | Y | Single occurrence only. | ?spender.id=lte:X |
|  | gt(e) | Y | Single occurrence only. | ?spender.id=gte:X |
| token.id | eq | Y | Single occurrence only. Requires the presence of a account.id query parameter| ?token.id=lt:Y |
|  | ne | N |  |  |
|  | lt(e) | Y | Single occurrence only. Requires the presence of an lte or eq account.id query parameter| ?spender.id=lte:X&token.id=lt:Y |
|  | gt(e) | Y | Single occurrence only. Requires the presence of an gte or eq account.id query parameter| ?spender.id=gte:X&token.id=gt:Y |

Both filters must be a single occurrence of **gt(e)** or **lt(e)** which provide a lower and or upper boundary for search.

## Backwards Compatibility

This HIP primarily adds new information that mirror node operators and other record stream consumers can simply ignore if they do not need it. However, NFT marketplaces using the Hedera mirror node could start using the /allowances/nfts API.

## Security Implications

There are no security implications for this HIP. It simply provides a much more convenient, aggregated view of information that is already publicly available.

## How to Teach This

The Hedera documentation and the OpenAPI specification will be updated to add this new API.

## Reference Implementation

Please follow [this issue](https://github.com/hashgraph/hedera-mirror-node/issues/3245) for progress on the reference implementation.

## Rejected Ideas

- We briefly considered adding serial number level information for NFT allowances in order for an NFT marketplace to view which spender has approved_for_all for particular serial numbers.However, this idea was rejected due to the potential security threat it posed. When a token has a very high number of serials and allowances, implementing this feature could potentially bring the mirror node down.
- There was a consideration to add `approveForAll` to `/api/v1/tokens/{id}/nfts/{id}`. This idea was rejected because it is possible to have an unbounded number of `approveForAll` ****allowances and it is not feasible to get it in a single response payload.
- There was a consideration to add `approveForAll` to `/api/v1/accounts/{id}/tokens`. This idea was rejected because it is possible to have an unbounded number of `approveForAll` ****allowances and it is not feasible to get it in a single response payload.

## Open Issues

No known open issues exist.

## References

[HIP ticket](https://github.com/hashgraph/hedera-mirror-node/issues/7143)
[HIP 336](https://hips.hedera.com/hip/hip-336)
[Design](https://github.com/hashgraph/hedera-mirror-node/blob/main/docs/design/allowances.md)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
