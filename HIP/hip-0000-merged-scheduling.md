- hip: <HIP number (this is determined by the HIP editor)>
- title: Opt-in merged scheduling
- author: Michael Tinker <michael.tinker@hedera.com>, Anirudh Ghanta <anirudh.ghanta@hedera.com>
- type: Standards Track
- category: Service
- status: Draft
- created: 2021-10-18
- discussions-to: <a href="https://github.com/hashgraph/hedera-improvement-proposal/discussions/172">Thread #172</a>
- updated: 2021-10-18

## Abstract

If a `ScheduleCreate` tries to re-create an existing scheduled transaction, the network rejects 
it with `IDENTICAL_SCHEDULE_ALREADY_CREATED`. This is a reasonable---albeit conservative---default, 
since there is always a chance that the involved parties _really_ wanted two separate transactions, 
and only "collided" by accident.

However, in some cases the scheduling parties can arrange to avoid any accidental 
collisions. In this case, when two or more parties submit `ScheduleCreate`s with the same transaction, 
the network can better serve their needs by "merging" all the provided signatures into the same 
scheduled transaction.

In this HIP we propose a single new protobuf field `ScheduleCreateTransactionBody#merge_with_identical_schedule`
which, if set to `true`, switches the network's behavior to this more friendly "merged" scheduling. The only 
exception is to be if the existing schedule has an explicit `payerAccountID` different than the `payerAccountID` 
for the `ScheduleCreate`; then the network will fail the `ScheduleCreate` with
`IDENTICAL_SCHEDULE_ALREADY_EXISTS_WITH_DIFFERENT_PAYER`.

## Motivation

Suppose a validator network is monitoring a stream of events, where each event `e` is uniquely identified
by a hash `He`, and should trigger the scheduling of a single related transaction `Xe` that needs a majority 
of the validators' signatures to execute. 

Suppose also that the validators all set `memo=He` when trying to schedule transaction `Xe`.

Then by the uniqueness of the memos, there is no risk that two identical `ScheduleCreate`s are 
_actually_ intended for two different events. But, with current network behavior, only the first 
validator to submit the `ScheduleCreate` for event `e` will have a "normal" workflow. All the other 
validators will receive `IDENTICAL_SCHEDULE_ALREADY_CREATED`, and need to submit a second `ScheduleSign` 
transaction to attach their signature to the scheduled `Xe` transaction.

This is at best inconvenient, as the network is enforcing protection the validator network simply does 
not need.

## Rationale

Improve the user experience when scheduling transactions on the network, especially in the use case
of a validator network as above.

## Specification

This HIP extends the `ScheduleCreateTransationBody` as follows,
```
message ScheduleCreateTransactionBody {
  SchedulableTransactionBody scheduledTransactionBody = 1;
  string memo = 2;
  Key adminKey = 3;
  AccountID payerAccountID = 4;

  /** 
   * Controls how the network will behave when there is an identical transaction already scheduled (but not yet executed).
   * 
   * If merge_with_identical_schedule=true, when this ScheduleCreate "collides" with an existing scheduled transaction, it 
   * will behave as a ScheduleSign for that schedule UNLESS the existing schedule includes an explicit payerAccountID different 
   * than the effective payerAccountID for this ScheduleCreate. In this case, it will resolve to 
   * IDENTICAL_SCHEDULE_ALREADY_EXISTS_WITH_DIFFERENT_PAYER and have no effects on the existing schedule.
   * 
   * If merge_with_identical_schedule=false, this ScheduleCreate will resolve to IDENTICAL_SCHEDULE_ALREADY_CREATED, and the 
   * receipt will contain the id of the existing schedule entity.
   */
  bool merge_with_identical_schedule = 5;
}
```

It stipulates the network's behavior for a `ScheduleCreate` then match the comment above.

## Backwards Compatibility

This HIP does not make any breaking changes. Clients that keep using the current protobufs will 
keep the same semantics for their `ScheduleCreate` transactions, since the default value of the
`merge_with_identical_schedule` flag will be `false`.

## Security Implications

We do not see any security implications for this change. If a client such as a validator network 
opts-in to merged scheduling, but cannot ensure duplicate `ScheduleCreate` transactions are 
always functionally equivalent, it could suffer a correctness failure. But this would be a form 
of user error, not a problem with the network.

## How to Teach This

In one sentence: "If you opt-in to merged scheduling, your `ScheduleCreate` will turn into a 
`ScheduleSign` when somebody else has already scheduled your transaction."

## Reference Implementation

Ongoing.
- For protobufs changes, please follow [this issue](https://github.com/hashgraph/hedera-protobufs/pull/98).
- For node software changes, please follow [this issue](https://github.com/hashgraph/hedera-services/issues/2269).

## Rejected Ideas

We briefly considered changing the default network behavior to "merged" scheduling, instead of 
introducing a new field to the `ScheduleCreateTransactionBody`. But not all use cases will have
operational properties that make merged scheduling a safe default.

## Open Issues

We are not aware of any issues blocking implementation at this time.

## References

Not applicable.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
