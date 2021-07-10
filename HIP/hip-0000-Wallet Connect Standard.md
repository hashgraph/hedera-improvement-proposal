- hip: XX
- title: Hedera Signing Protocol
- author: [0xJepsen](https://github.com/0xJepsen), [rocketmay](https://github.com/rocketmay)
- type: Standards Track
- category: Application
- status: Draft 
- created: <07/03/21>
- discussions-to: <https://github.com/hashgraph/hedera-improvement-proposal/discussions/98>
- updated: <07/09/21> <07/08/21> <07/03/21>
- requires: <HIP number(s)>
- replaces: <HIP number(s)>
- superseded-by: <HIP number(s)>

## Abstract

This specification proposes a protocol for web applications to send pregenerated unsigned transactions to client applications for users to sign, tentatively titled the Hedera Signing Protocol. 

This protocol describes the interactions of two actors:

The Server : The web application providing a service, henceforth referred to as the Server. This application is not controlled by the user, but is providing a service which interacts with the user's Hedera account in some fashion. An example would be Uniswap for the Ethereum blockchain.

The Client : The client application, henceforth referred to as the Client. This application is controlled by the user and has access to a Hedera Account Private Key, which is used to sign the transactions for the services provided by the Server. An example would be the Metamask wallet for the Ethereum blockchain.

This proposal does not require any new Hedera API endpoints. 

This proposal introduces a javascript module used to send and receive and sign transaction data before they are submitted to the Hedera public network. The module will be open source and installable as a public node module for ease of inclusion into applications. 

## Motivation

Developers are currently creating web authentication mechanisms from scratch for Hedera-based web apps. This is limits consumer adoption and results in a poor user and developer experience. A standard protocol for decentralized applications to communicate with clients and allow clients to sign transactions would significantly improve the developer and user experience. The Hedera development space is still young, with many new projects developing promising ideas. These projects will need a standardized method of communication, much like what exists in the Ethereum space.

Taking the Metamask wallet as an example, Metamask offers a seamless way for users to interact with dApps, sending requests and signing transactions without compromising the security of their accounts. Another example is Wallet Connect, which is an open protocol for signing ETH transactions.

Without a communication standard, projects in the space are required to reinvent the wheel for every application and wallet. This adds overhead for the project team. This also represents a significant risk to the user who must reveal sensitive account information to web applications in order to interact with the Hedera network.

## Rationale

We propose establishing a standard protocol for Servers to present Clients with transactions to be signed by the User. The module allows the Server to present transaction data to the DOM environment where it can be viewed by the Client. There is no sensitive account information within the transaction data. The Client recieves the transaction data and signs it using their private key without exposing the key to the Server. The signed transaction is then submitted to the Hedera API network by the Client and the receipt is sent to the Server.

This protocol is designed to allow any Client to implement it and be accessed by Servers, thus providing maximum flexibility for users and developers. It is similar to Wallet Connect, which is an open protocol. Contrast this with Metamask's protocol which is designed specifically for Metamask.


## Specification

JavaScript is the primary language that can communicate with the browser's [DOM](https://www.w3.org/TR/REC-DOM-Level-1/introduction.html#). It is thus necessary for this module to be a JavaScript module. The transaction signing process is governed by this protocol, hereby refered to as the Hedera Signing Protocol.

This is the generalized flow:

1. The User sends a request to the Server for a transaction that they wish to make through the Server's interface.
_Start of Protocol Scope
2. The Server queries the browser for extensions which implement the Hedera Signing Protocol
3. The Server generates a list of Clients and the Account IDs that the Clients manage
4. The User selects the desired account which they want to perform the transaction.
5. The Server creates a transaction, freezes it, and JSONifies it for use as txnObject in Step 6.
6. The Server then sends a sendTransaction RPC to the Client. This RPC method is standardized as part of the protocol and initializes the connection between the Server and the Client.
7. The Client displays the transaction to the User and prompts the user to Sign the transaction or Cancel.
8. The Client executes the signed transaction, and sends a response to the Server (transaction Receipt, or cancel).
_End of Protocol Scope
9. The Server displays the result and continues the user experience.

Notes:

Step 2: Clients that implement the protocol will contain a 'HederaSP' identifier in their manifest.json. The Server can then query for extensions which have the identifier and populate a list. 

Step 3: The Server sends the RPC "requestAccounts" to each Client identified in step 2.
		Each Client implements requestAccounts() which returns an array of Hedera Account IDs (type string).

Step 4: The Server should display the list of Accounts, sorted by Client. As part of this step the Server may query the network to obtain further information to assist the user in their choice (such as account balance), though this is not strictly part of the protocol.

		The User will then select the Account which they want to perform the transaction with.
		
Step 6: The Server calls the Client RPC sendTransaction, which contains a number of parameters.
	
	const txnParams = {
	
	txnObject: 'xxxx' // the frozen transaction object JSONified
	memo: 'string' // An optional string that contains further information about the transaction. Note that this can be different than the memo in the transaction object itself
	}
	
Step 7: The Client receives txnParams through sendTransaction() and displays the data to the user for their approval. Note that displaying the information of the transaction is not part of this protocol, however it is recommended as best practice that the Client unpackages the transaction and displays all the relevant information.

If the Client does not implement the specific transaction type that has been sent through, it can return a TransactionNotSupported error to the Server.

Step 8: The Client is responsible for executing the transaction, and sends a receipt to the Server so the Server can display an appropriate response.


## Backwards Compatibility

This HIP is entirely opt-in and does not modify any existing functionality. It simply provides standards that client applications (such as wallets) and dApps can follow to interact with each other.

## Security Implications

Clients are responsible for locally signing transactions. At no point are private keys ever shared or revealed to the Server. This is the main purpose of this protocol. Because no sensitive account data is shared, account security through this protocol is maintained.

On the other hand, there are many considerations which developers should take into account when implementing this protocol into their applications:

Nothing can be done about a Server (intentionally or not) generating an incorrect transaction. A malicious Server can generate a transaction that is different than what the user is expecting. This protocol assumes that the Client properly unpackages the transactions that it receives and displays the information in a readable, clear manner to the user for their review, and that the User is given accurate information and a clear indication of what action they are approving by signing the transaction.

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
