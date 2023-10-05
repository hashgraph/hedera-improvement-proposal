---
hip: 0000
title: Integration of Wallet Connect 2.0 Protocol for Wallets and dApps on Hedera
author: Jason Fabritz (@bugbytesinc)
working-group: Jason Fabritz (@bugbytesinc)
type: Standards Track
category: Application
needs-council-approval: No
status: Draft
created: 2023-10-05
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/819
updated: 2023-10-05
requires: HIP-30
replaces: HIP-179
---

## Abstract

This HIP proposes a specification for wallets and dApps on the Hedera platform to connect using the [**Wallet Connect 2.0**](https://docs.walletconnect.com/) protocol. It introduces standardized methods to facilitate native Hedera network operations; including signing transactions and sending transactions to the hedera network.

## Motivation

With the increasing adoption of dApps on Hedera, there's a growing need for a standardized native hedera network protocol to connect wallets and dApps.  Integrating widely recognized standards like Wallet Connect 2.0 reinforces Hedera community’s commitment to interoperability, user-centric design, and forward-thinking development. Adoption would not only enhance the current user experience but would also pave the way for attracting new developers and users, fostering a more inclusive and interconnected Hedera ecosystem. 

## Rationale

Wallet Connect 2.0 has been successfully implemented across various blockchain platforms. Its adoption for Hedera will ensure future compatibility with a broad range of wallets and dApps, enhancing user experience and interoperability.  Key considerations supporting this approach include:

**Interoperability Across Platforms**: Wallet Connect 2.0 has already been adopted and implemented across a multitude of blockchain platforms. Its widespread acceptance is a testament to its robustness and versatility. By integrating it into Hedera, we ensure that Hedera-based dApps and wallets can seamlessly interact with other platforms that also support Wallet Connect, fostering a more interconnected decentralized world.

**User Experience**: One of the primary challenges in the decentralized space is the steep learning curve and fragmented user experience. Different dApps support different wallets, and users often have to switch between multiple wallets or undergo tedious processes to interact with their desired dApps. Wallet Connect 2.0 offers a unified protocol that simplifies this interaction, providing users with a consistent and intuitive experience.

**Developer Friendliness**: For developers, integrating multiple wallets can be a time-consuming and complex task. By standardizing the connection protocol with Wallet Connect 2.0, developers can streamline the integration process, allowing them to focus on building innovative features and improving their dApps rather than getting bogged down with wallet compatibility issues.

**Future-Proofing the Ecosystem**: As the decentralized space evolves, new wallets and dApps will continue to emerge. Adopting a standardized protocol like Wallet Connect 2.0 ensures that Hedera participates in this evolution. It provides a foundation that can easily accommodate future innovations, ensuring that the Hedera ecosystem remains dynamic and adaptable.

**Security and Trust**: Wallet Connect 2.0 has undergone rigorous scrutiny by the broader blockchain community. Its design principles prioritize security, ensuring that users' assets and data remain protected. By adopting a protocol that has already been vetted and trusted by the community, Hedera reinforces its commitment to user security.

## User stories

- As a dApp developer, I wish to create a native Hedera transaction that a remote user can sign and submit to the network on my behalf; returning the receipt (or error) when that action is completed.  I do not need to know the brand of wallet submitting my transaction, only that it follows the known protocol I understand.
- As a dApp developer, I wish to have a remote user sign a transaction and return it so that I can submit the transaction to the network myself on the key-owner’s behalf.  I do not need to know the brand of wallet signing the transaction I created for them, only that the signer follows the known protocol I understand.
- As a dApp developer, I need the functionality above to facilitate coordination of multiple signatures by separate parties.  I do not need the protocol to orchestrate multiple party signatures, only create and return or pass thru existing signatures when required.
- As a dApp developer, I need to know which hedera nodes the remote client is willing to sign and/or send transactions to.  There is no point in creating a transaction delivered to a Hedera node that the remote wallet is unwilling or unable to interact with.
- As a key-owner (account/wallet owner) I want to utilize any dApp of my choosing with any wallet or key-signing tool of my choosing to facilitate my desired interaction with the dApp or Hedera Network.
- As a key-owner (account/wallet owner) I want to utilize any dApp of my choosing with any wallet or key-signing tool of my choosing to participate in multi-party, multi-signature transactions when and where required.
  
## Specification

Portions of a specification required to implement a Wallet Connect 2.0 protocol for the Hedera Network already exist.  The accepted HIP-30, CAIP Identifiers for the Hedera Network, ratifies the format for identifying hedera networks and addresses.  It includes definitions for the Chain Agnostic Standards Alliance profiles 2, 10 and 19 for the Hedera Network, to summarize:

> The `hedera` namespace will be used for CAIP blockchain identifiers. There will be 4 distinct references: `mainnet`, `testnet`, `previewnet`, and `devnet`…. `hedera:devnet` refers to any non-shared developer local network.
> 
> The account address is the standard account identifier format. Each of realm, shard, and account ID separated with a ~~dash~~ [period] (`.`). The format of the realm, shard, and account ID are unsigned integer in decimal representation…

The identifiers described above shall be used during the Wallet Connect 2.0 pairing session negotiation to identify the hedera ledgers and accounts that will participate in transaction signing and submission to the Hedera network.  

What is not included in previous work is the definition of the Wallet Connect custom methods and events that complete the support for the use cases identified above.  The following namespace methods shall be supported:

### hip000_signTransactionBody
When a dApp requires only the signature from the controller (wallet), it can use the `hip000_signTransactionBody` method.  This method accepts a base64 encoded protobuf representation of the Hedera API `TransactionBody` message as input.  The controller decodes and interprets the contents, and if valid and approved, returns an encoded `SignatureMap` structure that includes one or more signatures generated by the controller.

#### Parameters
`transactionBody` – a base64 encoding of the protobuf endoded Hedera API `TransactionBody` message.  While the controller should decode the contents for security reasons, it should sign the literal bytes provided, not a re-encoding of the `TransactionBody` message.  This is necessary because re-encoding the message could potentially result in slightly different array of bytes.

Note: the CAIP-217 Scope property of the RPC call shall be used to identify which network shall be assumed when signing the transaction if multiple chainids were authorized in the pairing process.  It is not necessary to transmit that value as a method parameter.

#### Returns
`signatureMap` – a base64 encoding of the protobuf endoded Hedera API `SignatureMap` message.  The encoded structure must include at least one signature within the property’s `SignatureMap` structure.  It is allowed to provide more if the context warrants multiple signatures.

### hip000_signTransactionAndSend
When a dApp needs the services of the controller to sign a transaction message and then submit it to the network, it can use the `hip000_signTransactionAndSend` method.  This method accepts a base64 encoded protobuf representation of the Hedera API `SignedTransaction` message as input.  The controller decodes the message, interpret the contents, and if valid and approved, appends it’s signature to the `SignatureMap` structure identified as the `sigMap` property of the `SignedTransaction` repackages the message as appropriate for transmission to the Hedera network and sends it to the network.  The controller shall wait for the initial response from the Hedera node and return the resulting Node Precheck Code generated by the submission.

The controller is allowed to retry submitting the signed transaction to the Hedera Network for certain types of error conditions; such as gRPC connection droppage or Hedera BUSY signals.  This specification does not obligate the controller to retry, but recommends the practice to help improve perceived user experience for consumer applications.

#### Parameters
`signedTransaction` – a base64 encoding of the protobuf endoded Hedera API `SignedTransaction` message.  The message must include the `bodyBytes` parameter representing the transaction, but inclusion of a `sigMap` is optional.  If included, and if it is pre-populated with signatures, the pre-existing signatures must also be included in the message sent to the Hedera Node.

Note: the CAIP-217 Scope property of the RPC call shall be used to identify which network shall be assumed when signing and sending the transaction if multiple chainids were authorized in the pairing process.  It is not necessary to transmit that value as a method parameter.

#### Returns
`precheckCode` – an integer representing the response code returned from the Hedera Node, which may indicate success or failure.  A response code indicating success does not necessarily indicate the transaction will reach consensus nor succeed, it solely indicates whether the submitted transaction passed initial validation to warrant further processing.

### hip000_sendTransactionOnly
When a dApp only requires the services of the controller to act as a relay to the Hedera network for submitting an already signed transaction, it can use the `hip000_sendTransactionOnly` method.  This method accepts a base64 encoded protobuf representation of the Hedera API `SignedTransaction` message as input.  The controller decodes the message, interpret the contents, and if valid and approved, transmits the message unaltered to the Hedera network.  The controller shall wait for the initial response from the Hedera node and return the resulting Node Precheck Code generated by the submission.

The controller is allowed to retry submitting the signed transaction to the Hedera Network for certain types of error conditions; such as gRPC connection droppage or Hedera BUSY signals.  This specification does not obligate the controller to retry, but recommends the practice to help improve perceived user experience for consumer applications.

#### Parameters
`signedTransaction` – a base64 encoding of the protobuf endoded Hedera API `SignedTransaction` message.  The message must include the `bodyBytes` parameter representing the transaction, and the `sigMap` field containing one or more valid signatures.

Note: the CAIP-217 Scope property of the RPC call shall be used to identify which network shall be assumed when sending the transaction if multiple chainids were authorized in the pairing process.  It is not necessary to transmit that value as a method parameter.

### Returns
`precheckCode` – an integer representing the response code returned from the Hedera Node, which may indicate success or failure.  A response code indicating success does not necessarily indicate the transaction will reach consensus nor succeed, it solely indicates whether the submitted transaction passed initial validation to warrant further processing.

### hip000_getNodeAddresses
While constructing a transaction for transmission to a controller, a dApp needs to choose which Hedera Network node shall receive the transaction prior to signing (this is a requirement of the Hedera API Protocol).  While a dApp can easily obtain a list of potential Hedera Nodes, a controller may not have an all-inclusive list nor a path to the node’s gRPC endpoint.  The `hip000_getNodeAddresses` method allows a dApp to request a list of node wallet addresses known to the controller.  The controller should only include nodes in this list that it is willing and able to submit transactions to at the time of the request.

#### Parameters
This method requires no input parameters. The CAIP-217 Scope property of the RPC call shall be used to identify which network shall be assumed when obtaining the list of known network nodes.

#### Returns
nodes – an array of strings formatted in the `<shard>.<realm>.<num>` format identifying an Hedera Address.  The controller should only return known nodes that it can communicate with to submit transactions.

## Backwards Compatibility

This is a new protocol specification, it does not have backwards compatibility concerns.

## Security Implications

Wallet Connect 2.0 has been designed with a strong emphasis on security. Its architecture has undergone extensive peer review and has been adopted by numerous blockchain platforms. By leveraging this protocol, Hedera can ensure that the foundational communication between wallets and dApps is secure.  The protocol implements end-to-end encryption between dApps and wallets.  It employs a QR code-based pairing system ensuring the communication channel is established directly between the user’s wallet and the dApp.  Controllers (wallets) have full control over actions such as signing and communicating with the Hedera Network.

## How to Teach This

The Wallet Connect documentation is quite comprehensive and can be leveraged to document most of the steps required to implement both dApps and controllers (wallets).  Additionally, it might be useful to create reference implementations in various programming languages to help bootstrap adoption of this protocol.

## Reference Implementation

No reference implementation presently exists, however there are some non-conforming prototypes presently under development.

## Rejected Ideas

### HashConnect
Wallet Connect 2.0 has advantages over the HashConnect 1.0 protocol: It has a more robust pairing handshake, larger community support which extends across blockchain projects.  Additionally, the HashPack team has announced that HashConnect 2.0 will be a re-branded Wallet Connect implementation.

### HIP-179
[HIP-179](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-179.md), External Transaction Signing for SDK and other clients, was designed before the Wallet Connect 2.0 protocol was released.  It describes similar functionality, however it requires redundant method calls and data exchange that is implemented and managed by the Wallet Connect protocol itself.  It is unnecessary to include this duplication in the specification.  Also, at this time, there is no known open-source library supporting the handshake protocol described in HIP-179.

## Open Issues

This specification does not yet address a common set of error codes that may be produced by controllers, defining this information is supported in the CAIP namespace process.

After approval of this HIP (or its replacement) there may be additional CAIP and/or pull requests within the Wallet Connect documentation repositories to further socialize and promote this protocol within the Wallet Connect community.

## References

- [HIP-30](https://hips.hedera.com/hip/hip-30): CAIP Identifiers for the Hedera Network
- [HIP-179](https://hips.hedera.com/hip/hip-179): External Transaction Signing for SDK and other clients
- [CAIP-2](https://chainagnostic.org/CAIPs/caip-2): Blockchain ID Specification
- [CAIP-10](https://chainagnostic.org/CAIPs/caip-10): Account ID Specification
- [CAIP-19](https://chainagnostic.org/CAIPs/caip-19): Asset Type and Asset ID Specification
- [CAIP-25](https://chainagnostic.org/CAIPs/caip-25): JSON-RPC Provider Authorization
- [CAIP-27](https://chainagnostic.org/CAIPs/caip-27): JSON-RPC Provider Request
- [CAIP-217](https://chainagnostic.org/CAIPs/caip-217): Authorization Scopes
- [Wallet Connect Documentation](https://docs.walletconnect.com/)
- [Wallet Connect Specifications](https://github.com/WalletConnect/walletconnect-specs)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
