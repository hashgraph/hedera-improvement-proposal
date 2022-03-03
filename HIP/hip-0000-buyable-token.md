---
hip: <HIP number (this is determined by the HIP editor)>
title: Buyable Tokens
author: author: Justin Atwell <justin.atwell@hedera.com>, The Matt Smithies <matt.s@dovu.io>, Sergey Metelin <sergey.metelin@hedera.com, Andrew Gastwirth <andrew.gastwirth@dlapiper.com>, Brian Johnson <johnsonb@objectcomputing.com>, 
working-group: a list of the technical and business stakeholders' name(s) and/or username(s), or name(s) and email(s).
type: Service
category: Service
needs-council-approval: No
status: Draft
created: 2022-03-03
discussions-to: <a URL pointing to the official discussion thread>
---

## Abstract

Proposes the addition of a boolean field to enable a token transaction without an additional signature.

## Motivation

Currently there is no token type that enables tokens to be purchased without the owner initiating the transaction. The current HTS structure requires signatures for every token transfer .

## Rationale

For tokens that have been programmatically minted, such as in supply chain scenarios or generative NFTs, the need to have a signature when transferring is simply not needed. The seller just requires an amount of HBAR (or token) be transferred to their account.

In the enterprise scenario, requiring an additional signature is just an additional cost. Therefore as a one time event upon minting, we introduce the boolean field “is_buyable_token”. When this field is selected, the token will transfer to the account that sent the required HBAR (or token).

In the DEFI scenario, it might be appropriate to programmatically purchase every NFT created by a certain artist, or a series of carbon offsets with particular attributes. This HIP would allow you to purchase NFTs without the facilitation of a third party marketplace. In more decentralized scenarios, where multi-attribute matching is a requirement, but supply from a single source is not sufficient, this allows for tokens with attributes to be purchased at scale across a variety of sources, directly from the source with no intermediary. This can also enable mechanisms such as a smart contract using machine learning models to infer attributes of certain tokens and buy them at scale from accounts on the network without an exchange intermediary.

## User stories

As a software program I want to be able to purchase “buyable tokens” without a signature. I just want to buy it for the listed price, vacuum up the token and move on.

As a person who wants a particular amount of HBAR (or token) for the buyable tokens listed but does not care about anything else, I want to check a button to make that happen.

  
## Specification

```message TokenCreateTransactionBody {

    string name = 1;
    string symbol = 2;
    uint32 decimals = 3;
    uint64 initialSupply = 4;
    AccountID treasury = 5;
    Key adminKey = 6;
    Key kycKey = 7;
    Key freezeKey = 8;
    Key wipeKey = 9;
    Key supplyKey = 10;
    bool freezeDefault = 11;
    Timestamp expiry = 13;
    AccountID autoRenewAccount = 14;
    Duration autoRenewPeriod = 15;
    string memo = 16;
    TokenType tokenType = 17;
    TokenSupplyType supplyType = 18;
    int64 maxSupply = 19;
    Key fee_schedule_key = 20;
    repeated CustomFee custom_fees = 21;

    //new field
    Bool is_buyable_token = 22;
}

//new messages
Message buyableTokenProperties {
   Uint64 amount = 1;
   //need to add blacklisted accounts?
   Uint64 accountLimit = 1;
   Timestamp buyable_at;
   Timestamp expire_at;
   string expected_token_id;
}
```

## Backwards Compatibility

All HIPs that introduce backward incompatibilities must include a section describing these incompatibilities and their severity. The HIP must explain how the author proposes to deal with these incompatibilities. HIP submissions without a sufficient backward compatibility treatise may be rejected outright.

## Security Implications

If there are security concerns in relation to the HIP, those concerns should be explicitly addressed to make sure reviewers of the HIP are aware of them.

## How to Teach This

For a HIP that adds new functionality or changes interface behaviors, it is helpful to include a section on how to teach users, new and experienced, how to apply the HIP to their work.

## Reference Implementation

The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation.

## Rejected Ideas

Throughout the discussion of a HIP, various ideas will be proposed which are not accepted. Those rejected ideas should be recorded along with the reasoning as to why they were rejected. This both helps record the thought process behind the final version of the HIP as well as preventing people from bringing up the same rejected idea again in subsequent discussions.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

While a HIP is in draft, ideas can come up which warrant further discussion. Those ideas should be recorded so people know that they are being thought about but do not have a concrete resolution. This helps make sure all issues required for the HIP to be ready for consideration are complete and reduces people duplicating prior discussions.

## References

A collections of URLs used as references through the HIP.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
