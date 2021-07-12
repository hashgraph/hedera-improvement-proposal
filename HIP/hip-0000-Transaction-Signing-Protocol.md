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

This specification proposes a protocol for exchanging unsigned transactions and signatures.


## Motivation

Developers are currently creating web authentication mechanisms from scratch for Hedera-based web apps. This is limits consumer adoption and results in a poor user and developer experience. A standard protocol for decentralized applications to communicate with clients and allow clients to sign transactions would significantly improve the developer and user experience. The Hedera development space is still young, with many new projects developing promising ideas. These projects will need a standardized method of communication, much like what exists in the Ethereum space.

Taking the Metamask wallet as an example, Metamask offers a seamless way for users to interact with dApps, sending requests and signing transactions without compromising the security of their accounts. Another example is Wallet Connect, which is an open protocol for signing ETH transactions.

Without a communication standard, projects in the space are required to reinvent the wheel for every application and wallet. This adds overhead for the project team. This also represents a significant risk to the user who must reveal sensitive account information to web applications in order to interact with the Hedera network.

## Rationale

We propose establishing a standard protocol for sending and receiving transactions to be signed. There is no sensitive account information within the transaction data. We prepose protobufs for four RPC calls and their corresponding requests and responses. The four calls shall be `RequestLimit`, `Sign`, `Submit`, and `SubmitAndSign`.  `RequestLimit` allows for information like `MaxTransactionFee` and `PreAuthorizationLimit` to be obtained entities utilizing the protocol. `Sign` allows an entity to provide a `SigMap` like that used in the hedera API to bytes of a transaction. `Submit` provides the requesting entity with a response containing information of a signed transaction. `SignAndSubmit` allows for both the sign and submit actions to be carried out in half of the number of responses and requests. These calls allow for a single transaction to be signed by multiple keys for multi signature protocols.

## Specification

```
message LimitsRequest{
    required int32 MaxTransactionFee  = 1; //maybe we make these types bigger to prevent overflow
    required int32 PreAuthorizationLimit = 2; //maybe we make these types bigger to prevent overflow
    //required publickey = 3; //potential auth, would also need a ECDSA
    //signed object
    optional Capabilities = 4; // What can this wallet do? Limitations 
    optional Memo = 5;
}

message limitResponse{
    required ResponseCode response = 1;
    required MaxTransactionFee = 2;
    required PreAuthorizationLimit = 3;
    optional Capabilities = 4;
    optional Memo = 5;
}

message signRequest {
    reuired Hash = 1; // corolation ID if not rpc
    required BodyBytes = 2; // hex
    optional Memo = 3;
}

message signResponse {
    required Hash = 1;
    required ResponseCode = 2;
    required SigMap = 3; //matches HAPI sigMap , examples is .net sdk
    optional Memo = 4;
}

message SignAndSubmitRequest {
    required Hash = 1;
    required BodyBytes = 2;
    required SigMap = 3;
    optional Memo = 4;
}
message SignAndSubmitResponse { // for optimization over the wire --> less req res
    required Hash = 1;
    required ResponseCode response = 2;
    required Receipt = 3;
    optional Memo = 4;
}

message SubmitRequest {
    required Hash = 1;
    required BodyBytes = 2;
    required SigMap = 3;
    optional Memo = 4;
}

message SubmitResponse {
    required Hash = 1;
    required ResponseCode response = 2;
    required Receipt = 3;
    optional Memo = 4;
}

message ResponseCode {
    optional Success = 1;
    optional Rejected = 2;
    optional UnrecognizedTransaction = 3;
    optional MaxTransactionFeeExceeded = 4;
    optional PreAuthroizationLimitExceeded = 5;
    optional CapabilityNotSupported = 6;
    optional TransactionException = 7;
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

This HIP is entirely opt-in and does not modify any existing functionality. It simply provides standards that client applications (such as wallets) and web applications can follow to interact with each other.

## Security Implications

Clients are responsible for locally signing transactions. At no point are private keys ever shared or revealed to the protocol. Because no sensitive account data is shared, account security through this protocol is maintained.

On the other hand, there are many considerations which developers should take into account when implementing this protocol into their applications:

Nothing can be done about a Requesting enitity (intentionally or not) generating an incorrect transaction. A malicious Requesting Website can generate a transaction that is different than what the user is expecting. This protocol assumes that the Client properly unpackages the transactions that it receives and displays the information in a readable, clear manner to the user for their review, and that the User is given accurate information and a clear indication of what action they are approving by signing the transaction.

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
