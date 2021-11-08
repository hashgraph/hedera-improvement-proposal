---
hip: 27
title: Adding support for resolving Hedera DIDs through the DIF Community Universal Resolver
author: Jo Vercammen <jo.vercammen@meeco.me>
type: Standards Track
category: Application
needs-council-approval: No
status: Draft
created: 2021-06-06
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/103
updated: 
---

## Abstract

This HIP describes the extension of the DIF Universal Resolver with a Hedera DID Resolver. The DIF Universal Resolver is a combined community effort to provide a single solution to easily resolve different DID methods, with the goal to enable interoperability across different DID methods. By integrating the Hedera DID Resolver with the DIF Universal Resolver, it will recognise Hedera as one of the identity fabrics in the wider community and provide for interoperability between different DID methods.  

## Motivitation

DIF’s Universal Resolver provides a unified interface which can be used to resolve any kind of decentralized identifier. The DIF Universal Resolver system is designed to fulfil a similar purpose as Bind in a DNS system - the recursive resolver that enables the resolution of identifiers. However, this new system uses self-sovereign identifiers to replace domain names. The introduction of DIF Universal Resolver is an important step in a decentralized identity framework, as it allows identity-driven applications and communication systems to retrieve Did-Documents as a basic component to prove the identity of the different actors. This enables higher level data formats (such as Verifiable Claims) and protocols to be built on top of the identifier layer, no matter which blockchain or other system has been used to register the identifier.

The interface itself is a web-hosted solution that resolves supported DID's and retrieves their respective DID-documents through a REST-API. Through the community it has grown up to support more than 30 DID-methods, enabling more and more interoperability across ledgers and DID methods. The DIF Universal Resolver, now hosted as a community service, is seen as a reference for providing easy accessible service to resolve different did-methods.

By adding the Hedera did method to the DIF universal resolver, it will enable further compatibility with other identity frameworks that will create the possibility to verify credentials that are issued by the Hedera network and leverage these credentials in different ecosystems. This will potentially increase the adoption of Hedera as an identity layer and recognise Hedera as a cooperative identity framework within the community. 

Further, it allows Hedera identity wallet providers to leverage credentials that are issued outside of the Hedera identity framework. Hence, creating a richer product offering and enabling more market-opportunities. 


## Rationale

The target is to have a community driver that offers an interoperable solution between the different ledgers and did methods. The solution needs to enable services to verify identity holders and their associated DIDs, independent from the ledger they where issued. 
The solution needs to be compliant with the current W3C standards specification around decentralized identities and the Universal Resolver initiative.

## Specification

The contribution for a new DID method driver to the universal resolver consists of a Docker image which exposes an HTTP interface for resolving DIDs. New contributions are submitted as Pull Requests to the Universal Resolver repository.

The driver offers an HTTP GET call under the following structure: http://<your-image>:8080/1.0/identifiers/<your-did>. The driver receives an Accept header with a value in application/ld+json format. The response is a valid DID Document or a DID Resolution Result in the HTTP body. Specifications on API definition is available through the following link: https://github.com/decentralized-identity/universal-resolver/blob/master/swagger/api-driver.yml

To offer support for all existing appnets, the driver will need to look up the correct appnet by retrieving the published address book on the Hedera File network. This is done by one of the suffixes - fileId - that is added to the DID:method. After the retrieval of the address book, the driver will interact with the correct appnet node and DidTopicId to retrieve the correct DID Document.


## Backwards Compatibility

This solution needs to be compatible and integrated with the existing Hedera DID method support through the appnet service. These appnet services allow:
* Create (publishing), update, delete and resolve DID documents;
* Issuance, revocation and status verification of Verifiable Credentials;


## Security Implications

There are no direct security implications, since the uniresolver only exposes the resolution of DID documents trough an API backend that integrates with the existing driver. This means that there is no possibility that mutable actions on data can take place.

## How to Teach This
N/A

## Reference Implementation
N/A

## Rejected Ideas
N/A

## Open Issues

## References

* https://github.com/decentralized-identity/universal-resolver 
* https://github.com/peacekeeper/uni-resolver-driver-did-example
* https://github.com/decentralized-identity/universal-resolver/blob/main/docs/driver-development.md



