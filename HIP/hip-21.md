---
hip: 21
title: Free network info query              
author: Simi Hunjan (@SimiHunjan)
type: Standards Track
category: Mirror
needs-council-approval: Yes
status: Last Call
last-call-date-time: 2021-11-30T07:00:00Z
created: 2021-06-09 
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/82
updated: 2021-11-15
---

## Abstract

The HIP proposes a free address book query.

## Motivation

The address book files `0.0.101` and `0.0.102` collectively maintain information about the nodes in a given Hedera network (previewnet, testnet, mainnet). The two files contain the following [information](https://github.com/hashgraph/hedera-protobufs/blob/main/services/basic_types.proto#L1194) for each node:

- IP address
- Port number
- Node account ID
- Node ID
- Node certificate hash
- RSA_PublicKey
- Description
- Stake

Today, applications have to use the File Service and submit two file contents query requests to return all the required node information. This results in two transaction fees for processing each of the queries. The information contained within the address book files is required for clients to send Hedera transactions or queries to valid Hedera consensus nodes.

## Rationale 

The proposal is to create a rest API query to return network information. As we continue to grow the network and transition into a permissionless model, the number of times the local address book will be required to update will increase. The transaction fee associated with the current file query hinders the ability to update the address book as frequently as it might be needed for applications to ensure their address book is always up to date. This information should be free. 

## Specification 

REST API

GET `api/v1/addressbooks`

Response:

```json

{
  "addressbook": [
    {
      "ipAddressv2": {
      },
      "port": " " ,
      "rsa_publickey": "  ",
      "node_id": " ",
      "node_account_id": " ",
      "node_cert_hash": ,
      "memo": " ",
      "description": " ",
      "stake": " ",
    }
  ],
  "links": {
    "next": null
  }
}

```

Example with all params:
api/v1/addressbooks/timestamp=gte:1566562500.040961001&timestamp=lt:1576562500.040961001&file.id=0.0.102&limit=5&order=asc



## Security Implications

- A client could spam the network since the query is free and disable other users from processing their request 

## Rejected Ideas

The original idea was to have a non-file HAPI network query that returns the address book information.
```diff
service NetworkService {
   rpc getVersionInfo (Query) returns (Response); // Retrieves the active versions of Hedera Services and HAPI proto
+  rpc getNetworkInfo (Query) returns (Response); //Retrieves network information
   rpc uncheckedSubmit (Transaction) returns (TransactionResponse); // Submits a "wrapped" transaction to the network, skipping its standard prechecks. (Note that the "wrapper" <tt>UncheckedSubmit</tt> transaction is still subject to normal prechecks, including an authorization requirement that its payer be either the treasury or system admin account.)
} 
```

## Open Issues

- Throttle the query to prevent spamming of the network

## How to Teach This

- Hedera Mirror node design document
- Description and code example of the query added to Hedera documentation
- Reviewed in Engineering Insights

## References

- https://github.com/hashgraph/hedera-protobufs/blob/main/services/basic_types.proto#L1194
