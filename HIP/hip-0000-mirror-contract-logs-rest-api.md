---
hip: <HIP number (this is determined by the HIP editor)>
title: Mirror Node Search Contract Execution Log REST API
author: Nana Essilfie-Conduah (@Nana-EC)
type: Standards Track
category: Mirror
status: Draft
created: 11/18/21
discussions-to: <a URL pointing to the official discussion thread>
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

An additional Mirror Node REST API endpoint is described which would allow users to search across topics for a particular contracts execution results.

## Motivation

The current Mirror Node supports the ingestion of contract information and contract executions results and logs.
It supports the retrieval of top level contract information, however, it does not support the filtering of contract execution result logs.
When methods in a contract are run users currently have to rely on network calls and transaction success or failure to determine execution details.
Retrieving filtered transaction logs is common practice in the EVM space and the Mirror Node should provide endpoints on its existing API to support new and existing users.

## Rationale

The proposal seeks to expand Mirror Node Smart Contract Service 2.0 support by exposing contract execution result logs filtering as is standard in many full archive nodes.
This new endpoint would provide insight into function execution logs.

## User stories

As a user, I want to filter through and view the results of a smart contracts method execution 

## Specification

A new endpoint `/api/v1/contracts/{id}/results/logs` will be added to supports users filtering contract execution result logs.

The following JSON represents a typical response result from either of these calls
```json
{
  "logs": [
    {
      "address": "0x0000000000000000000000000000000000001234",
      "contract_id": "0.0.1234",
      "bloom": "0x1513001083c899b1996ec7fa33621e2c340203f0",
      "data": "0x8f705727c88764031b98fc32c314f8f9e463fb62",
      "timestamp": "12345.10002",
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x59d088293f09d5119d5b55858b989ffce4d398dc"
      ]
    },
    {
      "address": "0x0000000000000000000000000000000000001893",
      "contract_id": "0.0.1893",
      "bloom": "0x8f705727c88764031b98fc32c314f8f9e463fb62",
      "data": "0x1513001083c899b1996ec7fa33621e2c340203f0",
      "timestamp": "12345.10002",
      "topics": [
        "af846d22986843e3d25981b94ce181adc556b334ccfdd8225762d7f709841df0",
        "0000000000000000000000000000000000000000000000000000000000000765"
      ]
    }
  ],
  "links": {
    "next": null
  }
}
```

Optional filters

- `limit`
- `order`
- `timestamp`
- `address`
- `topic0`
- `topic1`
- `topic2`
- `topic3`

## Backwards Compatibility

This additional API endpoint does not alter exsiting REST API functionality.

## How to Teach This

- Hedera Mirror Node design document
- Description and code examples of queries added to Heedera REST API documentation section
- The OpenAPI spec at `api/v1/docs` should be updated to reflect the new endpoints and allow users to test out the calls.
- Reviewed in Engineeing Insights


## References

- https://github.com/hashgraph/hedera-protobufs/blob/main/services/contract_call_local.proto

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
