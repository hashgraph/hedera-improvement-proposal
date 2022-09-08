---
hip: 000
title: Blanket exemptions for custom fee collectors
author: Michael Tinker (@tinker-michaelj)
working-group: Ken Anderson (@kenthejr), Richard Bair (@rbair23), Nick Poorman (@nickpoorman)
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-09-08
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/571
requires: 18
replaces: 18
---

## Abstract

We propose to give token creators the option to exempt _all_ of their token's fee collectors from a custom 
fee. This differs from current network behavior, which only exempts a fee collector from fees for which it 
is the collector. The new option adds a single new protobuf field in the `CustomFee` message,
```
message CustomFee {
  ...
  AccountID fee_collector_account_id = 3;
  bool all_collectors_are_exempt = 4;
}
```

## Motivation

The tokenomics of a fungible token with several fee collectors can be awkward when these collectors try to
exchange units of the token.

## Rationale

By extending the definition of a custom fee via this `all_collectors_are_exempt` flag, we provide the 
most flexibility to token creators; and avoid surprising any users who may be depending on the current 
behavior.


## User stories

- As the creator of a fungible token whose tokenomics require three custom fees with three different collection
accounts, I want my collectors to be able to exchange units of the token without paying custom fees. 
  
## Specification

The network needs to include the new `all_collectors_are_exempt` field in state when it appears in a `CustomFee` 
specification; and when deciding whether to assess a custom fee with `all_collectors_are_exempt = true`, needs to 
check if the potential payer is a collector for the token type of that custom fee.

## Backwards Compatibility

This HIP does not propose any breaking changes. All existing custom fees will be unchanged. Any unchanged 
`TokenCreate` operation or `TokenFeeScheduleUpdate` operation will continue to have the same semantics.

## Security Implications

This HIP does not change the precedent importance of securing fee collection accounts.

## How to Teach This

If you don't want your fee collectors to pay a custom fee, create it with `all_collectors_are_exempt = true`.

## Reference Implementation

Please follow [this issue](https://github.com/hashgraph/hedera-services/issues/3836) to track progress of 
the reference implementation.

## Rejected Ideas

Because HIP-18 did not stipulate any fee exemptions, and arguably it is surprising for fee collectors to 
_ever_ pay custom fees for their token type, we considered just changing the default behavior to match
this proposal. But we could not rule out the possibility of breaking current users, so opted for a 
backward-compatible approach.

## Open Issues

We do not know of any open concerns with this proposal.

## References
- [HIP-18](https://hips.hedera.com/hip/hip-18)
- [Reference implementation tracker](https://github.com/hashgraph/hedera-services/issues/3836)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
