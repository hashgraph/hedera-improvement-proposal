**hip: TBD </br>
title: Integrate '.setTokenAmount()' custom function for 'TokenFreezeTransaction()' </br>
author: Tomachi Anura [shibartoken@protonmail.com](mailto:shibartoken@protonmail.com)</br>
type: Standards Track</br>
category: Service</br>
needs-council-approval: Yes</br>
status: Draft</br>
last-call-date-time:</br>
created: 22.02.13</br>
discussions-to:**</br>

## Abstract

When "locking" or "freezing" liquidity related to an associated Account Id, There is no way to freeze a specific amount of tokens. The Shibar Network Team strongly believes that it would bring many advantages to have the tokenFreezeTransaction like in the sequent example:

<img width="711" alt="Screen Shot 2022-02-13 at 5 44 48 PM" src="https://user-images.githubusercontent.com/96840872/153778591-6ba9b8b7-92a7-4438-b9fb-23e77a469e4d.png">

## Motivation

When "locking" or "freezing" liquidity related to an associated Account Id, There is no way to freeze a specific amount of tokens. This could be potentially detrimental in regards of DeFi, if the same token offers many use-cases. As it stands now, Users would have to set different accounts in order to use the same Network.

## Rationale

## User Stories

- Funds may be frozen according to various amounts, without limiting the User experience if they wanted to leverage the same account with many different use-cases. 
- It would eliminate the need of trusting third party pools.

## Specification
## Backwards Compatibility
## Security Implications
## How to Teach This
## Reference Implementation
## Rejected Ideas
## Open Issues

No blocking issues are known at this time.
## References
## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](https://github.com/hashgraph/hedera-improvement-proposal/LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
