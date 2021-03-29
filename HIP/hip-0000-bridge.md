---
hip: 0000
title: Hedera <-> Ethereum Bridge
author: Daniel Ivanov (@Daniel-K-Ivanov)
type: Application
status: Draft
created: 2021-02-11
discussions-to: TODO
---

## Abstract

The HIP defines an application network run set of parties in order to faciliate HBAR and HTS token transfers from Hedera to Ethereum and vice-versa.

## Motivation 

With the recent release of HTS and the growing growth in the Ethereum ecosystem, it seems that a Bridge Network between Hedera and Ethereum will be highly beneficial to the community. The current value stored on Hedera (HBARs/HTS) would become available on Ethereum.

On the other hand, tokens on Ethereum can be transferred to Hedera to utilise the high-troughput and low-fees that the network provides. The effect will be net positive for both Hedera and Ethereum native assets and their communities.

Bridges are inherently untrusted, since there are no efficient and completely trustless setups. In one way or another, users must have trust assumptions on the entities/parties operating the Bridge.

The best way to successfully integrate a bridge network would be through the community and that is why this HIP is inteded for. Using this HIP, the community will have full transperency in both the design and the operations of the bridge.

## Rationale

The level of decentralisation in a bridge network is highly important. In the specification described below we have tailored our trade-offs so that we are achieving maximum decentralisation possible. Bridge operators (validators) have a setup on both Ethereum and Hedera networks. On Hedera, a threshold account with `n / m` signatures is to be used and on Ethereum, the set of validators are defined in the `Router` smart contract that requires supermajority for a given `mint` operation.

HCS topics are used for publishing authorisation signatures by the validators. This way the anyone is able to trustlessly audit the authorisation messages used to mint wrapped tokens on Ethereum. This mechanism provides full transperancy and auditability on the bridge operations.

## Specification

## Backwards Compatibility

## Security Implications

## Hot to Teach This

## Refernce Implementation

## Rejected Ideas

## Open Issues

## Reference

## Copyright
This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
