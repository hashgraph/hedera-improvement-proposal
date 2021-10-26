---
hip: 21
title: Free network info query              
author: Simi Hunjan (@SimiHunjan )
type: Service
status: Draft
created: 2021-06-09 
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/82
---

## Abstract

The HIP proposes a free address book query.

## Motivation

The address book files 0.0.101 and 0.0.102 collectively maintain information about the nodes in a given Hedera network (previewnet, testnet, mainnet). The two files contain the following [information](https://github.com/hashgraph/hedera-protobufs/blob/main/services/BasicTypes.proto#L356) for each node:

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

The proposal is to create a free non-file HAPI query to return network information. As we continue to grow the network and transition into a permissionless model, the number of times the local address book will be required to update will increase. The transaction fee associated with the current file query hinders the ability to update the address book as frequently as it might be needed for applications to ensure their address book is always up to date. This information should be free. 

## Specification 

- Add a non-file HAPI query called **getNetworkInfo** to the existing Network Service
- This query would not have a transaction fee


[Network Service](https://github.com/hashgraph/hedera-protobufs/blob/main/services/NetworkService.proto)

```diff
service NetworkService {
   rpc getVersionInfo (Query) returns (Response); // Retrieves the active versions of Hedera Services and HAPI proto
+  rpc getNetworkInfo (Query) returns (Response); //Retrieves network information
   rpc uncheckedSubmit (Transaction) returns (TransactionResponse); // Submits a "wrapped" transaction to the network, skipping its standard prechecks. (Note that the "wrapper" <tt>UncheckedSubmit</tt> transaction is still subject to normal prechecks, including an authorization requirement that its payer be either the treasury or system admin account.)
} 

```

## Security Implications

- A client could spam the network since the query is free and disable other users from processing their request 

## Open Issues

- Throttle the query to prevent spamming of the network

## How to Teach This

- Comments in the protobuf files in the [hedera-protobufs](https://github.com/hashgraph/hedera-protobufs) repository describing the nature of the query
- Description and code example of the query added to Hedera documentation
- Reviewed in Engineering Insights

## References

- https://github.com/hashgraph/hedera-protobufs/blob/main/services/BasicTypes.proto#L356
- https://github.com/hashgraph/hedera-protobufs/blob/main/services/NetworkService.proto
- https://github.com/hashgraph/hedera-protobufs
