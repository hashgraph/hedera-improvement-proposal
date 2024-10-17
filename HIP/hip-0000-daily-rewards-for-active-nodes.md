---
hip: 0000
title: Daily Rewards For Active Nodes
author: Neeharika Sompalli <@Neeharika-Sompalli>
working-group: Richard Bair <@rbair23>, Michael Tinker <@tinker-michaelj>, Mark Blackman<
requested-by: Hashgraph
type: Standards Track
category: Core
needs-council-approval: Yes
status: Draft
last-call-date-time: 2024-04-08T07:00:00Z
created: 2024-10-16
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/1063
updated: 2024-10-16
---

## Abstract

This HIP proposes a reward mechanism that will incentivize nodes to remain active on the network. The definition of active node is described below. The minimum reward per day for nodes will be a configurable property decided by the council. This minimum reward may be adjusted based on fees already paid throughout the day.

## Motivation

The goal is to give a strong incentive for node operators to keep them active and properly configured throughout every staking period.

## Rationale

Clearly defining the criteria for node activity, we can ensure that rewards are distributed fairly, incentivizing nodes to remain active and contribute to the network’s stability and growth.

### Terminology

In the Hashgraph consensus algorithm, nodes communicate by sharing information through events. An event contains some transactions.

In each round, each node creates a *witness* which is an event created in that round that does not have any descendants from the same node in that round. A *judge* is a specific type of witness event that gains importance because it is known and agreed upon by a majority of the network.

This HIP defines a node as *active* if it creates a judge in a significant fraction of rounds during a staking period, for example 80%. Any node that is trustworthy and submits events will create judges. If the node doesn’t submit events or when other nodes don’t build on this node’s events ,  the node will not create judges.

**User Stories**

The implementation will be tested under various scenarios, including:

- As a node operator, I will expect to get a minimum node reward when the node is active for atleast `nodes.activeRoundsPercent`  rounds
- As a node operator, I will not expect to get any node rewards when the node is not active for atleast `nodes.activeRoundsPercent`  rounds
- As a network operator, when `nodes.adjustNodeFees` is set to true, each nodes gets reward reduced by the average node fees already collected during that period.
- As a network operator, when `nodes.adjustNodeFees` is set to false, node rewards are not reduced by the average node fees already collected during that period.
- As  a network operator, each active node will get minimum reward defined by `nodes.minNodeReward`

## Specification

There will be three configurable properties added, which can be changed using `FileUpdate` transaction signed by the council.

- `nodes.minNodeReward` : The minimum daily node reward amount per day
- `nodes.adjustNodeFees` : A flag if set, will reduce the rewards given for a staking period by the average node fees already collected during that period.
- `nodes.activeRoundsPercent` : The percent number of rounds a node must create a judge to be considered active. This is set to 80% by default.

Note that the reward is adjusted by same amount for all nodes when `staking.fees.adjustNodeFees` is true. I.e., Alice’s node is paid the constant reward minus the average node fees received that day, averaged across all nodes. We will NOT subtract the node fees earned by Alice in particular.

The node rewards are distributed at the end of a staking period using CryptoTransfer transactions from `ledger.fundingAccount` to each of the node accounts. Since each CryptoTransfer only allows `ledger.transfers.maxLen` number of transfers, based on the it is possible there will be multiple CryptoTransfers that will distribute rewards based on number of node accounts in the network.

This HIP modifies the following state protobufs.

- Currently PlatformState’s ConsensusSnapshot contains information about the `judge_hashes`. But, it doesn’t provide the creator ids. We will deprecate the existing `judge_hashes`  and add a list of `judge_infos` . Each `JudgeInfo` will include the creator node id and the judge hash for that node. Any node that didn’t create a judge in a round will not be present in the list.

```
/**
 * A consensus snapshot.<br/>
 * This is a snapshot of the consensus state for a particular round.
 *
 * This message SHALL record consensus data necessary for restart
 * and reconnect.
 */
message ConsensusSnapshot {
    ....
    /**
     * A list of SHA-384 hash values.<br/>
     * The hashes of all judges for this round.
     * <p>
     * This list SHALL be ordered by creator ID.<br/>
     * This list MUST be deterministically ordered.
     */
    repeated bytes judge_hashes = 2 [deprecated=true];
    ....
    /*
     * A list of judges.
     * This list SHALL be ordered by creator ID.<br/>
     * This list MUST be deterministically ordered.
     */
    repeated Judge judges = 6;
}

/**
 * A judge information
 */
message Judge {
  /**
   * The creator node ID who created this judge.
   */
    uint64 creator_id = 1;
    /**
     * SHA-384 hash value of this judge
     */
    bytes judge_hash = 2;
}
```

- To store the number of rounds in a staking period and the number of rounds in which each node created judges, a new singleton state `NodeRewards`will be added to `TokenService` . This singleton state will be updated at the end of every round.

```
syntax = "proto3";

package proto;

option java_package = "com.hederahashgraph.api.proto.java";
// <<<pbj.java_package = "com.hedera.hapi.node.state.token">>> This comment is special code for setting PBJ Compiler java package
option java_multiple_files = true;

/**
 * A node rewards message. This is used to find number of active nodes in a staking period based on number of judges
 * each node created in that period.
 */
message NodeRewards {
    /**
     * Number of rounds in a staking period.
     */
    uint64 num_rounds_in_staking_period = 1;
    /**
     * Number of judges created by each node in a staking period.
     */
    repeated NodeActivity node_activities = 2;
}
/**
  * A node activity containing number of judges created in a staking period.
 */
message NodeActivity {
    /**
     * Node ID of the node.
     */
    uint64 node_id = 1;
    /**
     * Number of judges created by the node.
     */
    uint64 num_judge_rounds = 2;
}
```

## Backward Compatibility

Existing nodes will not require any changes to their software or configuration to be eligible for rewards, as long as they meet the active criteria.

## Security Implications

No known security concerns.

## How to Teach This

This HIP incentivizes node operators for keeping the node active by guaranteeing a minimum reward in the periods that they accomplish this.

## Rejected Ideas

- Considered using number of submitted transactions to node to treat the node as active.

## Reference Implementation

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](https://github.com/Neeharika-Sompalli/hedera-improvement-proposal/blob/1cad867e75071dad048ec633e04e208ca242c0df/LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)