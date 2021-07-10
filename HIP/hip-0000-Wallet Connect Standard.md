- hip: XX
- title: Wallet connect experience
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

This specification proposes a method for daps to send (yet-to-be-signed) transactions to (browser based) wallets for users to sign. Once a user authorizes a transaction it is send back to the applicaion where it can be submitted to the network.

Since the signed transactions are submitted to the network (via the Hedera API) by the decentralized applications, this preposal does not require any new endpoints in from the Hedera API.

The preposed solutions introduces a simple new module used to send and recieve transaction data before they are submitted to the Hedera publilc network.

## Motivation

Developers are currently creating web authentication mechanisms from scratch for Hedera-based web apps. This is limiting consumer adoption and resulting in a poor user and developer experience. A standard protocol for decentralized applications to communicate with clients and allow clients to sign transactions would significantly improve the developer and user experience. The Hedera development space is still young, with many new projects developing promising ideas. These projects will need a standardized method of communication, much like what exists in the Ethereum space.

Taking the Metamask wallet as an example, Metamask offers a seamless way for users to interact with dApps, sending requests and signing transactions without compromising the security of their accounts. 

Without a communication standard, projects in the space are required to reinvent the wheel for every application and wallet. This adds overhead for the project team and represents a risk to the user who must reveal sensitive account information to these projects.

## Rationale

We propose establishing a standard for applications to present clients with a transaction to be ssigned by the user. The module allows the Dapp to present transaction data the the DOM environment where it can be viewed by browsser extensions. There is no sensitive information within the transaction data. The brower extension wallets can then recieve the transaction data and sign it with a digital signature from there private key. It is well known that digital signatures do not expose and sensitive information about the private key. There well established digital signing and verification algorithms.


## Specification

JavaScript is the primary language that can communicate with the browser's [DOM](https://www.w3.org/TR/REC-DOM-Level-1/introduction.html#). It will be necessary for this module to be a JavaScript module. The module with create an HTML element with the transaction data in the required format. 

Both browsers and web-aplications utilize a [manifest.json](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) file configure how the application will behave under certain circumstances. The `browserAction.enable()` should be called when the aplication see's that the preposed module is being used by the webapplication. This allows the browser action for the tab. It will be disabled by default. The browser extension can then use [content-scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/content_scripts) to execute a specific file with the `.js` extension. 

This file will establish a connection with the server using [expressjs](https://expressjs.com/) or [socket.io](https://socket.io/). Communication should be established with a handshake for a secure connection.

The server can then send unsigned transactions to the user for them to sign and then send back to the Dapp server.

The schema for the transactions would `jsonRpcRequest` and `jsonRcpResponse`

Access refers to the user authorizing a transaction presented to it by the server with a digital signature. 

### Protocol

```START dapp
IF provider is defined
    REQUEST[1] account access
    IF user approves
        RESOLVE[2] account access
        CONTINUE dapp
    IF user rejects
        REJECT[3] account access
        STOP dapp
IF provider is undefined
    STOP dapp
  ```

## Backwards Compatibility

This HIP is entirely opt-in and does not break any existing functionality. It simply provides standards that wallets and dApps can follow to interact with each other.

## Security Implications

The permissions schema referenced below in the Open Issues section would provide more robust security for users.

## How to Teach This

Simple examples and Guides will be incorporated into the existing Hedera documentation. Additionally, developer advocates can write education content on the 'How to' of this feature. 

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
