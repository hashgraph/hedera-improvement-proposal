---
hip: 000
title: Dynamic Address Book - Stage 1 - HAPI Endpoints
author: Iris Simon (iris.simon@swirldslabs.com)
working-group: Kelly Greco (kelly@swirldslabs.com) Michael Heinrichs (michael@swirldslabs.com), Mark Blackman (mark@swirldslabs.com)
type: Standards Track
category: Core 
needs-council-approval: Yes 
status: Draft 
created: 2024-01-22 
discussions-to: discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/000
updated: 2024-01-30
requires: 000
replaces: 000
superseded-by: 000
---

## Abstract

The Dyanmic Address Book will change the currently manually administered address book for Hedera into an HAPI managed configuration, updatable via signed Hedera transactions on a daily basis without the need to restart the consensus nodes to apply changes across the network.

*Dynamic Address Book - Feature Summary*

- HAPI APIs to facilitate changes to the address book used across the Hedera network
- Automated daily updates to node consensus weighting and SDK service requests
- NMT integration to automate required configuration changes resulting from address book changes

Given the size of the work, the feature will be broken into 2 stages:

**Stage 1 - HAPI Endpoints:** Implement the HAPI endpoints for Address Book management within current Address Book implementation (config.txt, file 0.0.101,& file 0.0.102).  In this phase HAPI endpoints are used to facilitate changes to the Address Book, however those changes are applied through existing, monthly upgrade process.

**Stage 2 -** **Full Implementation** - Full implementation of feature enabling daily changes to a new dynamic Address Book implementation through HAPI endpoints at 24 hour cycles matching Hedera’s staking period. 

This HIP is focused on the HAPI Endpoints phase of the project only.   A second HIP will be released for the Full Implementation stage of the project.


## Motivation

*Problems to Solve*

1. Changes to the address book can only be applied with a node restart requiring maintenance windows to activate Address Book changes locally. 
2. Changes to the address book is a complex, manual process that needs to be replicated across all nodes on the Network within a maintenance window. 
3. Currently node weighting is calculated and applied monthly whereas staking periods occur daily.   

*Feature Benefits:*

- Enables Hedera and node operators to manage address book without Swirlds Labs involvement.
- Core building block to support eventual support for community and permissionless nodes.
- Enables the rotation of node operators off the Hedera network should it be required as contracts expire.
- NMT integration of local node firewall admin reduces cost & complexity of node operations.
- Staking delegations within a single staking period directly contribute to a node’s consensus weight

## Rationale
The architectural design of Hedera's transaction-driven system was strategically implemented to empower the Hedera council members in overseeing network node participation. Furthermore this framework paves the way for the incorporation of community-led and permissionless nodes in the future. Under this design, independent node operators have the capability to autonomously submit transactions, thus efficiently managing the metadata related to their self-governed nodes.

Adopting a two-phase strategy, this approach facilitated the earlier release of HAPI endpoints, setting the stage for the subsequent deployment of a more automated solution. This phased implementation was key in accelerating both the delivery and utilization of the system.

## User stories

**Personas**

**Council Member** - A member of the council authorized to submit address book changes

**Node Operator** - Technical administrator of Hedera Consensus Nodes

**Add Node to Address Book**

***User Story:*** As a council member, I want the ability to submit signed HAPI transactions to add a new consensus node to the Hedera network upon the next maintenance window, so that I can perform operations independently.

***Acceptance:*** When a valid council member initiates a HAPI transaction to add a new node, then the network should acknowledge the transaction and perform an update to the network’s Address Book at the next maintenance window.

**Remove Node from Address Book**

***User Story:*** As a council member, I want the ability to submit signed HAPI transactions to remove a new consensus node to the Hedera network upon the next maintance window, so that I can perform operations independently.

***Acceptance:*** When a council member submits a HAPI transaction to remove a node, then the network should acknowledge the transaction and perform an update to the network’s Address Book at the next maintenance window.

**Update Node IP Address(s) and Port(s)**

***User Story:*** As a council member, I value the ability to submit a signed HAPI transaction that modifies one or both of an existing node's IP addresses and/or ports.

***Acceptance:*** When a council member submits a HAPI transaction to modify a node's primary IP address:port or secondary IP address:port, network should acknowledge the transaction and perform an update to the network’s Address Book at the next maintenance window.

**Update GRPC Proxy Endpoint(s)**

***User Story:*** As a council member, I value the ability to submit a signed HAPI transaction that modifies a list of GRPC proxy endpoints supporting both IP and FQDN address formats.

***Acceptance:*** When a council member submits a HAPI transaction to modify a node's IP address:port or FQDN:port, then network should acknowledge the transaction and perform an update to the network’s Address Book at the next maintenance window.

**Update Node Description**

***User Story:*** As a council member, I value the ability to submit a signed HAPI transaction that modifies a node’s description within the Address Book.

***Acceptance:*** When a council member submits a HAPI transaction to modify a node's associated Description Field, then the network should acknowledge the transaction and perform an update to the network’s Address Book at the next maintenance window.

**Update Node’s Public Key**

***User Story:*** As a council member, I value the ability to submit a signed HAPI transaction that modifies a node’s public key within the Address Book used for signing.

***Acceptance:*** When a council member submits a HAPI transaction to modify a node's associated Public Key, then the network should acknowledge the transaction and perform update the network’s Address Book at the next maintenance window.

**Update Node’s Account ID**

***User Story:*** As a council member, I value the ability to submit a signed HAPI transaction that modifies a node’s Account ID within the Address Book.

***Acceptance:*** When a council member submits a HAPI transaction to modify a node's Account ID, then the network should acknowledge the transaction and perform update the network’s Address Book at the next maintenance window.

**Update Node’s X509 Certificate**

***User Story:*** As a council member, I value the ability to submit a signed HAPI transaction that modifies a node’s X509 certificate hash within the Address Book.

***Acceptance:*** When a council member submits a HAPI transaction to modify a node's associated X509 certificate hash, then the network should acknowledge the transaction and perform update the network’s Address Book at the next maintenance window.

**Automated Firewall Adaptation**

***User Story:*** As a node operator, I rely on the Network Management Tool (NMT) to automatically adjust firewall configurations based on transactions associated with address book changes, so that I can perform operations independently.

***Acceptance:*** When a HAPI transaction triggers an address book change involving a node's addition or removal, or IP:Port change, then the network should acknowledge the transaction and perform update the network’s Address Book at the next maintenance window.
## Specification

This HIP proposes the introduction of a new NodeService API that enables a node operator to create, delete, and update nodes. All of these transactions must be signed by the Hedera Council.

```protobuf
service NodeService {
		/**
     * Prepare to add a new node to the network.
     * When a valid council member initiates a HAPI transaction to add a new node,
     * then the network should acknowledge the transaction and update the network’s Address Book within 24 hours.   
     * The added node will not be active until the network is upgraded.
     */
    rpc createNode (Transaction) returns (TransactionResponse);

    /**
     * Prepare to delete the node to the network.
	   * The deleted node will not be deleted until the network is upgraded.
     * Such a deleted node can never be reused.
     */
    rpc deleteNode (Transaction) returns (TransactionResponse);

    /**
     * Prepare to update the node to the network.
	   * The node will not be updated until the network is upgraded.
     */
    rpc updateNode (Transaction) returns (TransactionResponse);
}
```

A new Hedera API will be added called NodeCreate, which falls under the Node Service category. This function is used by the node operator to create a new node. To complete this transaction, both the node operator and a council member must sign it.

```protobuf
/**
* The council has to sign this transaction. This is a privileged transaction.
*/
message NodeCreateTransactionBody {

	/**
	 * Node account id, mandatory field, ALIAS is not allowed, only ACCOUNT_NUM.
	 * If account_id does not exist, it will reject the transaction.
	 * Multiple nodes can have the same account_id.
	 */
	AccountID account_id = 1;

	/**
	 * Description of the node with UTF-8 encoding up to 100 bytes, optional field.
	 */
	string description = 2;

	/**
	 * Ip address or fully qualified domain name and port, mandatory field.
	 */
	ServiceEndpoint gossip_endpoint = 3;

	/**
	 * A node's service IP addresses and ports, IP:Port is mandatory, domain name is optional.
	 */
	repeated ServiceEndpoint service_endpoint = 4;

	/**
	 * The node's X509 RSA public key used to sign stream files (e.g., record stream
	 * files). Precisely, this field is the public key's DER encoding.
	 * This is a mandatory field.
	 */
	bytes public_key = 5;

	/**
	 * Hash of the node's TLS certificate. Precisely, this field is a string of
	 * hexadecimal characters which translated to binary, are the SHA-384 hash of
	 * the UTF-8 NFKD encoding of the node's TLS cert in PEM format.
	 * Its value can be used to verify the node's certificate it presents
	 * during TLS negotiations.node x509 certificate hash, optional field.
	 */
	bytes certificate_hash = 6;
}
```

A new Hedera API called NodeDelete will be added under the Node Service. This API function is used by the node operator to delete a node. To perform this transaction, both the node operator and a council member need to sign it.

```protobuf
/**
*	The council has to sign this transaction. This is a privileged transaction.
*/
message NodeDeleteTransactionBody {

	/**
	 * The unique id of the node to be deleted.
	 */
	int64 node_id = 1;
}
```

A new Hedera API called NodeUpdate will be added under the Node Service. This function is used by the node operator to update a node. For this transaction, both the node operator and council member need to sign it.

```protobuf
/**
* Original node account ID has to sign this transaction.
*/
message NodeUpdateTransactionBody {

	/**
	 * The unique id of the Node to be updated. This must refer to an existing, non-deleted node.
	 */
	int64 node_id = 1;

	/**
	 * If set, the new node account_id. 
	 */
	AccountID account_id = 2;

	/**
	 * If set, the new description to be associated with the node.
	 */
	google.protobuf.StringValue description = 3;

	/**
	 * If set, the new ip address or FQDN and port.
	 */
	ServiceEndpoint gossip_endpoint = 4;

	/**
	 * If set, replace the current list of service_endpoints.
	 */
	repeated ServiceEndpoint service_endpoint = 5;

	/**
	 * If set, the new public_key to be associated with the node.
	 */
	google.protobuf.BytesValue public_key = 6;

	/**
	 * If set, the new node x509 certificate hash to be associated with the node.
	 */
	 google.protobuf.BytesValue certificate_hash = 7;
}
```

The following are some changes to the existing HAPI.

Added three HederaFunctionalities:

```protobuf
enum HederaFunctionality {

	[...]

	 /**
    * Create a node
    */
    NodeCreate = 88;

    /**
     * Update a node
     */
    NodeUpdate = 89;

    /**
     * Delete a node
     */
    NodeDelete = 90;
}
```

Added `domain_name` in `ServiceEndpoint`.

```protobuf
message ServiceEndpoint {

	[...]

	/**
	 * The fully qualified domain name of the node, the maximum size is 253 characters.
	 */
	string domain_name = 3;
}
```

Added `node_id` in `TransactionReceipt`:

```protobuf
message TransactionReceipt {

	[...]

	/**
	 * In the receipt of a NodeCreate, the id of the newly created node.
	 */
	int64 node_id = 15;
}
```

Added a couple of response codes.

```protobuf
enum ResponseCodeEnum {

	[...]

	/**
	 * A node is already deleted
	 */
	NODE_DELETED = 333;

	/**
	 * A node is not found
	 */
	INVALID_NODE_ID = 334;
}
```

Each transaction made through NodeService will have a corresponding transaction record. This record will be included in the record stream file for Mirror Nodes to consume.

During stage1, node changes will not be active until the network is upgraded. When the node starts, the Platform still uses config.txt to create an AddressBook, which is then passed to Services. This AddressBook contains the activated nodes in the network. Services use the activated nodes to calculate weight.

During the *PREPARE_UPGRADE* freeze period, Services will generate a new config.txt and public.pfx file based on all the NodeService transactions since the last upgrade. These two files will be added to the location where file 0.0.150 is unzipped. Once the *FREEZE_UPGRADE* is completed, the freeze_scheduled.mf mark file is generated. This file will trigger DevOp to run NMT.## Backwards Compatibility

All HIPs that introduce backward incompatibilities must include a section describing these incompatibilities and their severity. The HIP must explain how the author proposes to deal with these incompatibilities. HIP submissions without a sufficient backward compatibility treatise may be rejected outright.

## Security Implications

No security issues identified as of yet

## How to Teach This

To educate and facilitate a great customer experience, the following will be required:

- Documentation - Updates to blogs, playbooks, and technical documentation will be required. Additionally previous descriptions of Address Book functionality should be deprecated across existing content.
- Tooling - Updates to tooling to facilitate node operation or transaction construction and submittal will be required to facilitate a great customer experience.
- Transition plan - Since this is transferring responsibility to council members, a formal transition plan should be implemented to ensure a successful hand-off.

## Reference Implementation

The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation.

## Rejected Ideas

TBD

## Open Issues

Stage 2 - Full Dynamic Book Implementation

## References

TBD

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
