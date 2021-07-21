- hip: XX
- title: Hedera Signing Protocol
- author: [0xJepsen](https://github.com/0xJepsen), [rocketmay](https://github.com/rocketmay), [bugBytes](https://github.com/bugbytesinc)
- type: Standards Track
- category: Application
- status: Draft 
- created: <07/03/21>
- discussions-to: [here](https://github.com/hashgraph/hedera-improvement-proposal/discussions/98)
- updated: <07/12/21> 
- requires: <HIP number(s)>
- replaces: <HIP number(s)>
- superseded-by: <HIP number(s)>

## Abstract

This specification proposes a protocol for exchanging transactions between applications. This protocol lays out the base RPC's that applications will be able to implement to exchange transactions and request signatures.

Future protocols can be built upon this specification that lay out the mechanisms for applications to find each other and establish connections to utilize the RPC's.

Entities which implement this protocol can be wallets, dApps, or other applications. The entity that sends the RPC call is referred to as the requesting entity, and the one that receives the RPC call and responds to it is referred to as the receiving entity.


## Motivation

Developers are currently creating web authentication mechanisms from scratch for Hedera-based web apps. This limits consumer adoption and results in a poor user and developer experience. A standard protocol for decentralized applications to communicate with clients and allow clients to sign transactions would significantly improve the developer and user experience. The Hedera development space is still young, with many new projects developing promising ideas. These projects will need a standardized method of communication, much like what exists in the Ethereum space.

Taking the Metamask wallet as an example, Metamask offers a seamless way for users to interact with dApps, sending requests and signing transactions without compromising the security of their accounts. Another example is Wallet Connect, which is an open protocol for signing ETH transactions.

Without a communication standard, projects in the space are required to reinvent the wheel for every application and wallet. This adds overhead for the project team. This also represents a significant risk to the user who must reveal sensitive account information to web applications in order to interact with the Hedera network.

This HIP describes the Transaction Signing Protocol whose purpose is to establish a standard for applications to follow. 

Follow up HIPs will build on this standard to lay out implementation of the protocol on different platforms (for example, the javascript web extension methodology that metamask uses for dApps to locate the Metamask client on a user's browser). We envision that there may be multiple such protocols, depending on required functionality, which include use cases such as desktop clients, P2P transfer, automated transfer between applications, etc. The Transaction Signing Protocol is intended to be robust enough handle these use cases as a base protocol.

## Rationale

This HIP establishes a standard protocol for sending and receiving transactions to be signed. There is no sensitive account information within the transaction data. We prepose protobufs for four RPC calls and their corresponding requests and responses. The four calls are `RequestLimit`, `Sign`, `Submit`, and `SubmitAndSign`.  

* `RequestLimit` allows for information like `MaxTransactionFee` and `PreAuthorizationLimit` to be requested from entities. 

    This call can be used to query entities for their capabilities, to filter out entities which do not have the appropriate account permissions/settings or implement the required functions of the requesting entity. It can also potentially be used as a pre-authorization mechanism, for example a site that may prompt the user "This site wants to spend up to $50, is that OK?", and the wallet can then approve transactions up to that limit without interrupting the user.

* `Sign` sends an unsigned transaction to an entity. The entity signs the transaction and returns the `SigMap` like that used in the hedera API to bytes of a transaction.

    This call allows the requesting entity to generate a transaction, have it signed by the appropriate entity, then process and eventually execute the transaction on the HAPI. This gives the requesting entity control over the transaction and allows functionality such as multi-sig transactions to be fulfilled by the requesting entity.

* `Submit` sends a transaction to an entity to submit to the HAPI. Any required signatures are included in the message.

    This call allows for an entity to send a signed transaction to another entity for that entity to execute. The receiving entity returns the response from HAPI to the requesting entity.

* `SignAndSubmit` sends a transaction to an entity, which is expected to sign the transaction and execute it on HAPI.

    This is a streamlined call which reduces the number of messages sent between entities. The receiving entity returns the response from HAPI to the requesting entity.


## Specification

```protobuf

message ResponseCode {
    required uint64 id = 1
    enum Response {
        Success = 0;
        Rejected = 1;
        UnrecognizedTransaction = 2;
        MaxTransactionFeeExceeded = 3;
        PreAuthroizationLimitExceeded = 4;
        CapabilityNotSupported = 5;
        TransactionException = 6;
        }
    Response response = 2;
}

message SignaturePair {
    bytes pubKeyPrefix = 1; // First few bytes of the public key
    oneof signature {
        bytes contract = 2; // smart contract virtual signature (always length zero)
        bytes ed25519 = 3; // ed25519 signature
        bytes RSA_3072 = 4; //RSA-3072 signature
        bytes ECDSA_384 = 5; //ECDSA p-384 signature
    }
}
message SignatureMap {
    repeated SignaturePair sigPair = 1; // Each signature pair corresponds to a unique Key required to sign the transaction.
}

message LimitsRequest{
    required uint64 maxTransactionFee  = 1;
    required uint64 preAuthorizationLimit = 2;
    optional bytes memo = 3;
}

message LimitResponse{
    required ResponseCode response = 1;
    required uint64 maxTransactionFee = 2;
    required uint64 preAuthorizationLimit = 3;
    optional bytes memo = 5;
}

message SignRequest {
    required bytes hash = 1; // correlation ID if not rpc
    required bytes bodyBytes = 2; // hex
    optional bytes memo = 3;
}

message SignResponse {
    required bytes hash = 1;
    required ResponseCode response = 2;
    required SignatureMap sigMap = 3; //matches HAPI sigMap , examples is above
    optional bytes memo = 4;
}

message SignAndSubmitRequest {
    required bytes hash = 1;
    required bytes bodyBytes = 2;
    required SignatureMap sigMap = 3;
    optional bytes memo = 4;
}
message SignAndSubmitResponse { // for optimization over the wire --> less req res
    required bytes hash = 1;
    required ResponseCode response = 2;
    required TransactionReceipt receipt = 3; // from HAPI
    optional bytes memo = 4;
}

message SubmitRequest {
    required bytes hash = 1;
    required bytes bodyBytes = 2;
    required SignatureMap sigMap = 3;
    optional bytes memo = 4;
}

message SubmitResponse {
    required bytes hash = 1;
    required ResponseCode response = 2;
    required TransactionReceipt receipt = 3; // from HAPI
    optional bytes memo = 4;
}

service Exchange {
    //unary
    rpc requestLimit(LimitsRequest) returns (limitResponse)
    rpc sign(signRequest) returns (signResponse); // returns transaction signed with ECDSA
    rpc submit(SubmitRequest,) returns (SubmitResponse);
    rpc sign_and_submit(SignAndSubmitRequest) returns (SignAndSubmitResponse);
}
```



## Backwards Compatibility

The standards defined in this HIP are entirely opt-in and do not modify any existing functionality. It simply provides standards that applications can follow to interact with each other.

## Security Implications

Clients are responsible for locally signing transactions. At no point are private keys shared or revealed to the protocol. As no sensitive account data is shared, account security through this protocol is maintained.

On the other hand, there are many considerations which developers should take into account when implementing this protocol into their applications:

Nothing can be done about a requesting enitity (intentionally or not) generating an incorrect transaction. A malicious Requesting Website can generate a transaction that is different than what the user is expecting. This protocol assumes that the Client properly unpackages the transactions that it receives and displays the information in a readable, clear manner to the user for their review, and that the User is given accurate information and a clear indication of what action they are approving by signing the transaction.

The permissions schema referenced below in the Open Issues section would provide more robust security for users.

## How to Teach This

Simple examples and guides will be incorporated into the existing Hedera documentation. Additionally, developer advocates can write educational content on the 'How to' of this feature. 

## Reference Implementation

To be developed.

## Rejected Ideas

N/A

## Open Issues

Open issues (not required for implementing the current HIP) allow users of web3 applications to provide partial information to the dApp—for example, implementing a wallet permissions schema and protocol. [EIP2255](https://eips.ethereum.org/EIPS/eip-2255) is a good resource for this.

## References

- [0] https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
- [1] https://docs.hedera.com/guides/docs/hedera-api
- [3] https://eips.ethereum.org/EIPS/eip-1102#eth_requestaccounts
- [4] https://www.w3.org/TR/REC-DOM-Level-1/introduction.html#
- [5] https://github.com/NoahZinsmeister/web3-react
- [6] https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
- [6] https://github.com/aragon/use-wallet
- [7] https://docs.metamask.io/guide/rpc-api.html#permissions

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
