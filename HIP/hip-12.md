- hip: 12
- title: Zero Knowledge Proofs
- author: Rahul Kothari - rahul.kothari.201@gmail.com
- type: Standards Track
- category: API
- status: Draft
- created: 2021-03-06
- discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/52

## Abstract

Zero Knowledge Proofs (ZKP) is the idea that a user can prove something without revealing any information to other users. For e.g. ability of logging into a forum without revealing my password or transferring of cryptocurrency on a blockchain without revealing the to, from addresses or the amount.

ZKPs are a cryptographic concept popularised by ZCash with their implementation of ZK-SNARKS (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge), which is a proof construction where one can prove possession of certain information, e.g. a secret key, without revealing that information, and without any interaction between the prover and verifier. ZKP algorithms like zkSnarks, bulletproofs and zkstarks allow for privacy in public DLTs. This will enable the creation of private tokens on HTS (something enterprises could be interested in) or even authenticating HCS data for a topic, without the appnet having to provide all the data. 

Encryption is good for hiding information but the data still needs to be revealed for authentication. This is still a lot of work for auditors, verifiers etc. but more importantly, the real data would have to be released.


## Motivation

There are several reasons why implementing ZKPs at the HAPI level make a lot of sense:
1. True privacy is central to DLT adoption, especially if the goal is to have enterprise, small business or even individuals use cryptocurrencies in their daily lives. More and more people look up to ZKPs for this.
2. ZKPs enable private tokens, make token balances private and also not reveal sender and recipients. Currently, this is possible on hedera using HCS but it requires a lot of work, setting up databases to store token balances, having a good appnet structure etc. Even after all the work, for a user to verify that the appnet is working as intended, they would have to replay all transactions all the way from the first sequence number. When building private tokens on HCS, typically the memos (that would show the transfer details of a transaction) would be hashed/encrypted. For a user to verify, the token creators would have to thus reveal not just the real data (to replicate the hash), but also the state of the final database (for comparison). This is a lot of headache for the verifier and token creators. Moreover, privacy is once again lost.  
3. Point 2 is true for any use case on HCS where the memos are encrypted and a verifier wants to verify if the appnet is doing a good job.
4. ZKPs give the ability to prove the validity of a set of data and this works hand-in-hand with HCS.
5. ZK Rollups help when there is a batch of off-chain transactions that need to be brought on-chain validity
6.  ZKPs for inter-opreability: move tokens from one chain to another chain with ZKPs as proofs of validity. Recursive snarks help condense large blockchains into light chains (that can even be used on mobiles. Refer Celo or Mina). This could have really nice benefits for cross-chain constructions, specifically those that depend on lightclients and bridges.
7. Most people flock to Ethereum for build ZKP dapps. However ZKPs are expensive and extremely slow. Hedera's consensus model would take the same ZKPs and make it extremely efficient - making it a no-brainer for most new ZKP protocols to hop on here. (Note: Hedera's smart contract service uses EVM which has ZKSNARKS implementation. However the 300,000 gas limit and a limit on the amount of data a Hedera smart contract can hold make them a sub-par choice.)
8. Hedera has a new feature called "Live hashes" for credential certifications. Even here, the certifications would have to be exposed publicly. ZKPs would help with this.
9. Other use cases can also be found here: https://sikoba.com/docs/zklux1/ZKLux1_Drevon_PracticalApps.pdf
## Rationale

The idea is to bake a Zero Knowledge protocol in the network layer of Hedera, so that dApp developers can create their own zk-Snarks easily without having to go through the pain of understanding and building elliptic curves, prover, verifier systems, trustless setups etc. 
Serveral folks within the hedera community have expressed their views that ZKPs on Hedera based services make as much sense as they do in other blockchains.

For example, Ethereum has made it relatively simple to add zkSNARKS on your smart contracts - https://consensys.net/blog/blockchain-development/introduction-to-zk-snarks/

Several design desicions and implementation methods are described in the Specification section of this document. 

## Specification
A comparison of the most popular ZKP systems:
|                                       | SNARKs                     | STARKs                        | Bulletproofs    |
| ------------------------------------: | -------------------------: | ----------------------------: | --------------: |
| Algorithmic complexity: prover        | O(N * log(N))              | O(N * poly-log(N))            | O(N * log(N))   |
| Algorithmic complexity: verifier      | ~O(1)                      | O(poly-log(N))                | O(N)            |
| Communication complexity (proof size) | ~O(1)                      | O(poly-log(N))                | O(log(N))       |
| - size estimate for 1 TX              | Tx: 200 bytes, Key: 50 MB  | 45 kB                         | 1.5 kb          |
| - size estimate for 10.000 TX         | Tx: 200 bytes, Key: 500 GB | 135 kb                        | 2.5 kb          |
| Ethereum/EVM verification gas cost    | ~600k (Groth16)            | ~2.5M (estimate, no impl.)    | N/A             |
| Trusted setup required?               | YES :unamused:             | NO :smile:                    | NO :smile:      |
| Post-quantum secure                   | NO :unamused:              | YES :smile:                   | NO :unamused:   |
| Crypto assumptions                    | Strong :unamused:          | Collision resistant hashes :smile: | Discrete log :smirk: |

Taken from https://github.com/matter-labs/awesome-zero-knowledge-proofs

[The ArtWorks GitHub](https://github.com/arkworks-rs) has implementations of all the curves and algorithms for zkSnarks in the Rust language. A lot of the blockchain frameworks like Celo have used forks of this library to build their SNARKS.

In case of a ZK-SNARK, a one time trusted setup would be created. And then after that, dapp developers could simply use a `.setZKSNARKS(true)` method on the SDK side to use zkSnarks for the transaction.

Any ZKP transactions would be slightly slower and more expensive to perform and hedera fees could be increased correspondingly.

## Backwards Compatibility
In the ideal state, ZKPs would be an additional optional service within the hedera ecosystem. It is difficult to determine the exact backwards-compatibility problems without sufficient implementation discussion within the cryptographers within Hedera. I anticipate that because this is a layer on top of the current services, it shouldn't create any issues.

## Security Implications

ZKPs if not implemented perfectly wouldn't work at all. This would undermine the quality of the offering. 

## How to Teach This

A more general awareness and understanding of ZKPs and their use-cases is needed. 

## Reference Implementation
N/A

## Rejected Ideas
N/A

## Open Issues
* What particular ZKP protocols need to be implemented?
* How to carry out the trusted setup, should zkSnarks be selected?
* Exact implementation details.
* How much fees should be charged for using ZKP when submitting transactions?

## References
* https://consensys.net/blog/blockchain-development/introduction-to-zk-snarks/
* https://sikoba.com/docs/zklux1/ZKLux1_Drevon_PracticalApps.pdf
* https://github.com/matter-labs/awesome-zero-knowledge-proofs
* https://github.com/arkworks-rs

## Copyright/license
This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)