---

- hip: 0000
- title: Staking
- author: Leemon Baird (leemon@swirldslabs.com)
- type: Standards Track
- category: Core
- needs-council-approval: Yes
- status: Draft
- created: March 25, 2022
- last-call-date-time: TBD
- discussions-to: TBD

---

## Abstract

Hedera is a **Proof of Stake** network. Staking is the process by which a user stakes the hbar in their account directly or indirectly to a node. Nodes use stake to weight their contributions to consensus. Staking enables community nodes by securing the network by making [Sybil attacks](https://coincentral.com/sybil-attack-blockchain/) prohibitively expensive. This document describes a system for staking. It is designed to ensure security in both the short term and long term, by having several parameters that can be set by the Council.

## Motivation

Currently, all nodes are deployed by the governing council, and each node has equal stake. As the network is further decentralized, it becomes important to allow for uneven staking in the networking, and to permit users to choose to which nodes they want to stake their `hbar`. The code for the mainnet nodes needs to be updated to understand and take staking into account when determining consensus, and needs to add support for allowing users to select which node to which they stake (either directly or indirectly). The record files produced by the main nodes need to include staking information and mirror nodes need to take staking information into account when determining a 1/3 superminority for validating record files. The SDKs need to be updated with the API for allowing users to control staking on their accounts.

It is possible for applications to be written and deployed through smart contracts to enable other forms of "staking", completely independent of this HIP. Such contracts can implement novel reward mechanisms like earning NFTs or giving voting rights. This HIP is unrelated to such smart contracts. This HIP discusses only the transactions needed to enable the form of native staking that impacts consensus, ensures security, and enables the possibility in the future of anonymous, permissionless nodes.

## Rationale

In a Proof of Stake network, the network must support native staking so consensus can be weighted by stake. The design is based on that defined in the [Hedera Hashgraph Whitepaper](https://hedera.com/hh_whitepaper_v2.1-20200815.pdf). There is no "bonding" or "slashing" and the account balance in each account that chooses to stake is liquid at all times. There is a reward mechanism built into the system so those who choose to stake their coins to the network can earn appropriate rewards for their contribution to the operation and security of the network.

There is no "bonding" or lock-up period, but there is a minimum _staking period_ defined by the council and presumed to be 1 day in this document, within which a _staking election_ is made before rewards are earned.

This staking system offers an addition feature that is unusual: indirect staking. If account `A` stakes to node `N`, then the staking increases the consensus weight of `N`, and account `A` is rewarded for each day that it stakes. If account `A` stakes to account `B`, and account `B` stakes to node `N`, then the stake from `A` will still increase the consensus weight of `N`, and it will still earn rewards, and the rewards will be received by `B`.

There are a number of use cases for indirect staking. A game might create many accounts for its users, and set up the accounts to indirectly stake through the account of the game manufacturer, allowing the manufacturer to direct the staking of all those accounts, and to earn the resulting rewards. Of course, the game players can always intervene and change their staking to go directly to the node, and earn the rewards themselves. But their "reward" for not intervening may be the right to play the game. Similar use cases could be imagined for those who write wallet software, for custody providers, or exchanges, and for many others. This feature is optional, and no user has to use it. But if people do decide to use it, it enables new business models.

## User Stories

### 1. An account stakes to a node for several staking periods and then does a crypto transfer

I modify my account to stake to a node in the network. Once I stake my account, I do nothing else with the account for several staking periods. Then, I transfer a single tinybar to another account. I find that my account balance was reduced by the cost of the transfer and increased by the reward amount I earned through staking.

### 2. An account stakes to a node for several staking periods and then stakes to a different node

I modify my account to stake to a node in the network. Once I stake my account, I do nothing else with the account for several staking periods. Then, I update my account to stake to a different node. Afterwards, I find that my account balance has increased as a result of rewards that I earned while staking to the first node.

### 3. An account stakes to a node that is offline during the staking period

My account is configured to stake to a node. During several staking periods, the node is down. When I earn my staking rewards through a crypto-transfer or some other transaction, I find that I have **not** earned rewards for staking during those days when the node I staked to was down. I only earned during the staking periods when it was active.

### 4. An account stakes to a node and changes to another node within the same staking period

Suppose the staking period is one day, running from each midnight to midnight UTC. On Monday, I update my account to stake to node `A`. Then, shortly after (and still within the Monday staking period) I change my mind and update my account to stake to node `B`. I earn no reward for Monday, because those changes happened within the Monday staking period. Then on Thursday, I change my mind and stake to the `C` node. At that moment, I earn rewards for staking to the `B` node for Tuesday and Wednesday, but not for Thursday. Then, the next time I earn a reward, it will be for staking to `C` on Friday and later, but not for Thursday. I only earn for staking periods during which I was not changing the staking target.

### 5. An account stakes to a node but elects to earn no rewards

I update my account to stake to a node, but in that same transaction I set a field to select to earn no rewards. Since I never elect to earn rewards, no rewards are ever computed on my behalf. But the node still has increased weight in consensus due to my staking, and my staking helps it reach the minimum stake needed to participate.

### 6. An account stakes to another account which stakes to nothing.

Alice decides to stake her account to Bob's account (not to a node). Bob, however, never enables staking. Neither Alice nor Bob ever earn rewards and neither Alice nor Bob contributes stake to consensus.

### 7. An account stakes to another account which eventually stakes to a node

Alice decides to stake her account to Bob's account. Some time later, Bob stakes to a node. Alice earns no rewards, but Bob does earn staking rewards based on the combination of his account `balance` and Alice's account's `balance`. That combined amount is contributed to consensus by being staked to the node of Bob's choice. The staking only affects consensus (and the rewards only start earning) once Bob starts staking. Alice earns no reward.

### 8. An account stakes to another account which stakes to a third account

Alice decides to stake her account to Bob's account. Bob decides to stake to Carrol's account. Alice contributes nothing to consensus, and no one is rewarded for Alice's staking.

### 9. An account stakes to another account which stakes to the original account

Alice decides to stake her account to Bob's account. Bob in turn decides to stake to Alice's account. Neither Alice nor Bob are staked to a node, and so neither have an effect on consensus, and neither earn staking rewards.

### 10. An account fails to stake to itself

Alice tries to stake her account to itself, but finds she receives an error from the network, forbidding self-staking.

### 11. An account stakes to another account that stakes to a node and has elected not to earn rewards

Alice decides to stake her account to Bob's account. Bob stakes to a node. He also configures his account so as not to earn any rewards. Neither Alice nor Bob earn any rewards for staking, but their combined stake does contribute towards consensus by staking to the node of Bob's choice.

### 12. Many accounts decide to stake to the same account

Alice, Bob, and Carol all decide to stake to Dave's account. Dave stakes to a node. The combined account balance from Alice, Bob, Carol, and Dave are all staked to the node of Dave's choice. Dave earns rewards based on that combined balance. The node's influence on consensus is affected by the combined balance.

### 13. An account stakes to a node and then spends some hbars

Alice stakes to node `X` on Monday (assuming a staking period of one day). On Wednesday, Alice transfers out some of the hbars in the account. Her effect on consensus (and earned rewards) for Monday are zero. For Tuesday, it is for the balance in the account on Tuesday. On Wednesday it is for the _minimum_ balance throughout the day of Wednesday. So if she only had a single transfer on Wednesday, and it was a transfer out, then it is her balance after that transfer. If it had been a single transfer into the account, then the minimum would be the balance just before the transfer.  

### 14. An account stakes to another account and then spends some hbars

Alice stakes to Bob's account. Bob then stakes to a node. Alice has 100 `hbar`. She then spends 10 `hbar` by transferring it to the account of a charity. When she does so, the amount of stake contributed by Alice and Bob to the node of Bob's choice is reduced by 10 `hbar`.

### 15. An account stakes to another account and then both spend or receive some hbars

Alice stakes to Bob's account on Monday (assuming a staking period of one day). Bob then stakes to a node on Tuesday. At the end of Tuesday, their combined balance is 1000 hbars. On Wednesday morning, Alice receives 10 hbars, and on Wednesday afternoon, Bob spends 100 hbars. Their combined balance was therefore 1000 hbars at the start of Wednesday, 990 hbars at noon on Wednesday, and 1090 hbars at the end of Wednesday. The minimum of 1000, 990, and 1090 is 990. Therefore, the effect on consensus, and reward earned by Bob, will be based on the 990 hbars. The effect on consensus starts at the end of the day on Wednesday, and continues until the end of Thursday. The reward is earned the next time Bob sends or receives hbars on Thursday or later.

### 16. An account stakes to a node and is then deleted

Alice stakes 100 hbars to a node and lets this account stay put for many days (assuming a staking period is one day). Then Alice decides to delete her account and transfer all her remaining hbars to Bob. The 100 hbars, plus the staking rewards she earned, minus the transaction fees, are deposited in Bob's account. Alice's account is deleted, and has no effect on consensus during that staking period nor later staking periods.

### 17. An account stakes to a node and loses its key

Alice stakes her account containing 1 hbar to a node and then loses her key. Eventually, her account comes up for auto-renewal. The system computes the reward she has earned, adds it to her balance, and then subtracts the auto-renewal fee. In that order. If she earned enough rewards, her account expiration date extends for the entire renewal period. If she did not earn enough reward, then her account extends for a shorter period, and has zero balance. If she earns more rewards than the auto-renew fee during each expiration period, then her account grows over time, while auto-renewing repeatedly. 

## Specification

Each node in the network shares responsibility for securing the network. Not all nodes have the same inherent trustworthiness. *Stake* is used to as an indication for trustworthiness. Nodes with greater *stake* are deemed to be more trustworthy as determined by the users of the network. *Stake* is expressed as an amount in hbars. The stake is used to compute a node’s contribution to consensus, is counted when collecting signatures on streaming record files, and will affect a node’s share in the signature for the state. When determining a *strong minority* or *super majority majority* of the network for consensus or other uses, we use the stake of each node as a fraction of the total staked to all nodes to determine whether we have at least 1/3 of the *stake* of the network or greater than 2/3 of the *stake* of the network, rather than just counting 1/3 or 2/3 of the *nodes* on the network.

There is a *staking period*. During the staking period, a user may choose to stake their hbars to a node, or indirectly stake through another account. At the start of a *staking period* the network updates the weight of the nodes in consensus to reflect these choices during the period that is ending. Thus, the stake computation of the network is updated atomically once per staking period. If the total stake for a node is fluctuating throughout a staking period, then the weight in consensus starting at the end of that period is based on the minimum stake that it had throughout that period.

The staking period will not initially be implemented as a setting. It will initially be defined to be the time from one midnight UTC to the next. Each period will be referenced by a `long` representing the number of days since the start of the epoch. In Java, the current day number is `LocalDate.now(ZoneID.of("UTC")).toEpochDay()`. If it is desirable to change it in the future, then the code will have to be updated to handle the history of 365 periods when different periods are of different lengths. So initially, it will be kept simple by hard coding the period length as being a single day.

### Nodes

Each node is represented in state as an object with some fields. The following fields are used for staking:
  - `long minStake` (must be ≥ 0) A node can't participate in consensus unless it has at least this much stake
  - `long maxStake` (must be ≥ `minStake`) Any hbars staked to the node over this limit are ignored
  - `long stakedReward` (value ≥ 0) current total of `balance` of all accounts staked to this node that have `declineReward == false`, and all accounts staked to those accounts (in tinybars)
  - `long stakedNoReward` (value ≥ 0) current total of `balance` of all accounts staked to this node that have `declineReward == true`, and all accounts staked to those accounts (in tinybars)
  - `long stake` (must be ≥ 0) Number of tinybars staked to this node that affect the current influence on consensus (based on `stakedReward` and `stakedNoReward` at the end of the last staking period)
  - `long[] rewardSumHistory` (array with 365+1 elements) a running sum of reward rates per hbar for the last 365+1 staking periods. Element 0 is the reward up to and including the last full period that finished before the present. Element 1 is the reward up to and including the period before that. And so on.

Each node has a `minStake` and a `maxStake` which must be nonnegative numbers of tinybars. It is not required that all nodes have the same values for `minStake` and `maxStake`. Any node that has `stake` less than `minStake` will be treated as though its stake is 0 and will not contribute to consensus, or to rewards, or to the total stake of all nodes. Any node that has more `stake` than `maxStake` will be treated as though its stake is `maxStake`, when calculating its weight on consensus, and the rewards earned by staking to it, and the sum of stake to all nodes. The purpose of these values is to make sure every node has some significant “skin in the game” to prevent sock puppets, while also preventing any single node from having excessive weight in the system.

Initially, council nodes will have twice the maximum stake as community nodes. `minStake` will be set to half of `maxStake`. The sum of all `maxStake` will equal 50 billion. In the future, these settings may change, as defined by the council.

The `stake` represents the *current stake values for this staking period*. During the staking period, accounts may change their *staking election* — perhaps from one node to another, or the amount to stake, or from an account to a node, or from a node to an account, or to stop participating in staking all together. Any such changes result in the `nextStake` (and possibly `nextRewardStake`) being updated on affected nodes. The `nextStake` doesn’t have any impact on the behavior of the network (i.e. it does not contribute to consensus), only the `stake`. The `stake` is set to the value of `nextStake` at the beginning of each staking period.

The node's state are recorded in `DualState`, which means it is in the part of state that can be used by both the application (services) and the platform.

The `rewardSumHistory` array gives a cumulative sum of all rewards earned by staking to that node, for each of 365+1 days. The units are tinybars earned per hbar staked. For example, if the staking period is a day, and it is currently the middle of Friday, then element 0 of the array gives the total reward through all of history up to and including the reward for staking throughout the day on Thursday. Element 1 gives the total for history up through Wednesday. Element 2 goes up through Tuesday, and so on. That means that the difference between elements 0 and 1 gives the reward for Thursday, the difference between elements 1 and 2 gives the reward for Wednesday, the difference between 2 and 3 gives the reward for Tuesday, and so on. Each of those differences gives the reward for one day. If the reward for Thursday (the difference of elements 0 and 1) is 1000, then that means that for any account that was staked to this node throughout the day on Thursday, if the minimum balance in that account throughout that day was `b` hbars, then the staking account will earn `(1000 * b)` tinybars for staking that day. The array is intended to record the rewards for the last 365 full days. It does not yet include any information about Friday, because that day is not yet completed. It contains 365+1 elements, so that there can be 365 differences (difference of elements 0 and 1, difference of elements 1 and 2, ..., difference of elements 364 and 365).

### Accounts

Any account may *elect to contribute stake* to a node. Accounts that contribute stake are essentially expressing a vote of confidence in that node. For contributing to the security of the network by contributing stake, accounts that stake will earn a *reward*. This reward is primarily based on the *transaction fees* paid to the network for handling transactions, but may also include additional rewards contributed by the council, or other organizations or individuals, and deposited into the *staking reward account*, `0.0.800`. That account has no keys associated with it, and therefore no transaction can ever transfer hbars out of it, not even a transaction signed by the Council. the network code itself will withdraw from the account to transfer earned staking rewards to staking accounts. Deposits into the account come from a fraction of transaction fees, but can also come from ordinary hbar transfer transactions, if any individuals or organizations decide to contribute to it.

Hedera staking does not including "bonding" or "slashing". Each account may simply specify which node to stake to, and the current balance of the account is automatically staked to the specified node! The balance is still liquid and can be adjusted at any time. The staking period will initially be set to one day. So at the start of each day (midnight UTC), each node's weight is adjusted to reflect the amount that was staked to it throughout the previous 24 hours, and this determines its weight in consensus throughout the next 24 hours. 

The following fields on the account are used for staking:
  - `long balance` (value ≥ 0) this is the normal account balance, in tinybars
  - `long stakedToMe` (value ≥ 0) total of `balance` of all accounts staked to this account
  - `long stakedNode` (value ≥ -1) the id of the node to stake to. If not staked to a node, the value is -1. The default value is -1.
  - `AccountID stakedAccount` (value ≥ -1); the account to which the account is staking. If not staked to an account, the value is null. The default value is null. It can never happen that `stakedAccount` is non-null and `stakedNode` is nonnegative at the same time.
  - `boolean declineReward` true if the account declines receiving a staking reward. Default is false.
  - `long stakePeriodStart` (value ≥ -1) the staking period during which either the staking settings for this account changed (such as starting staking or changing `stakedNode`) or the most recent reward was earned, whichever is later. If this account is not currently staked to a node, then the value is -1. 

The account’s `balance` is not a new field, it is the same as currently exists with the same rules and semantics as currently exist. It holds the current balance of the account, in tinybars.

When an account wants to stake to a node, the account owner will submit a transaction that sets `stakedNode` to the node ID, and will set the `stakedAccount` to null. For example, the Swirlds node has an ID of 1. If the owner wants to stake indirectly — delegate staking rights for its hbars to another account to stake on its behalf — then the transaction will set `stakedAccount` to the account ID of the account to delegate to. It can never be staked to both a node an and account at the same time. The `stakedToMe` field is the total of all tinybars that are currently staked to this account. For example, if account `0.0.1000` and `0.0.2000` both staked to `0.0.3000`, then the value of `stakedToMe` on `0.0.3000` would reflect the sum of the `balance` of `0.0.1000` and `0.0.2000`.

While it is possible to form long chains of indirect staking, only a single level of staking depth will be used. For example, suppose Alice stakes to Bob's account, and Bob stakes to Carol's account, and Carol stakes to a node. The `stakedToMe` for Carol will only include Bob's `balance`, and **not** Bob's `stakedToMe` that he got from Alice. If Alice's `balance` changes, Bob's `stakedToMe` will be updated, but **not** Carol's. The amount staked to the node of Carol's choice is simply Carol's `balance` plus Carol's `stakedToMe`. The amount that Alice is staking to Bob has no effect on consensus, and no effect on anyone's earned rewards.

While it is possible to form cycles, they won't impact the system, since the network will never follow more than one step around the cycle.

It is **not** possible for any account to stake to itself, or "self-stake". Any attempt to do so will result in an error code being returned.

If an account sets its `declineReward` to true, then it will not receive any staking rewards, but its stake can still give a node increased weight in consensus. This field is false by default.

The `stakePeriodStart` is a staking period number. Initially, the staking period will be implemented to be one day, and the period number will be Java's `getEpochDay` for the UTC day, which is the number of days since the starty of the epoch in 1970. This is set to the day when the staking settings for this account were last changed, or for when it last received a staking reward, whichever is later. If it is not staked, or if it is staked to an account (rather than to a node), then it is not currently earning staking rewards, and the `stakePeriodStart` is -1. 

### Rewards

We implement a lazy reward mechanism. Rather than performing extensive computation at the end of each staking period and updating all accounts with their rewards proactively, we compute and reward accounts lazily based on one of several _reward situations_. When one of these situations arises, we compute the reward and apply it to the account balance. This is a highly scalable solution that minimizes the computation overhead as well as the impact on the record stream.

The following situations cause a reward to be computed and applied:
  1. When any change is made to the account `balance`
  2. When any change is made to `stakedNode`, `stakedAccount`, `declineReward`, or `stakedToMe`
  3. During auto-renew (a corollary of #1 above)
  4. When an account staked to this one has its `balance` change (a corollary of #2 above)  

When it is time to computer the reward, the reward is calculated based on the time from `stakePeriodStart` until the current staking period. It is then given the reward, and `stakePeriodStart` is updated to equal the current staking period. 

If an account does not want to receive any rewards, but only wants to stake, then the account’s `declineReward` field will be set to `true`. It will still be able to stake and increase a node's weight in consensus, but it will not earn any rewards until it sets `declinedReward` back to false again.

#### Computing Rewards

Suppose the staking period is one day, and an operation occurs that triggers rewards for an account, such as a transaction is executed, or a scheduled transaction is executed, or an entity expires and tries to autorenew. 

At that moment, if account `0.0.800` has never had a balance of at least `StakingStartThreshold` tinybars, then no reward is given. If a transaction causes `0.0.800` to be equal to or greater than the threshold for the first time, then rewards are activated from then on. They never turn off. At the moment they turn on, the `rewardSumHistory` array for every node should be set to all zeros. That zeroing will also never happen again.

If rewards are activated (because `0.0.800` reached the threshold sometime in the past), then the following steps should be performed, to give a reward to every account that has earned a reward.

1. Calculate a local variable `long todayNumber = LocalDate.now(zoneUTC).toEpochDay();` where `zoneUTC` is a global constant defined as `constant ZoneID zoneUTC = ZoneID.of("UTC");`. 

2. If this transaction is a smart contract call, then execute the call, and identify which accounts had their balance changed.  For any other transaction type, identify which accounts will have balances that change (such as  due to the account paying the transaction fees, or the account being modified by an hbar transfer during a cryptocurrency transfer or an account deletion). Either way, do all the following steps on each account whose balance is changing.

4. If `stakePeriodStart > -1` and `stakePeriodStart < todayNumber - 365` then set `stakePeriodStart = todayNumber - 365`. This ensures the rewards are only calculated for at most the last 365 days of staking (so the account balance must change at least once a year to receive all the earned rewards).

5. Examine `stakePeriodStart`. If it equals -1, that means it is unstaked or is staked to an account (not a node). If it equals `todayNumber`, that means the staking changed today, so it should never be rewarded for today. If it equals  `todayNumber-1`, that means it has already been rewarded for yesterday and may be rewarded for today after today ends, but shouldn't yet be rewarded for today. In all 3 of those cases, no reward is earned now, and `stakePeriodStart` remains unchanged. 

6. Otherwise, if it is any other case (`-1 < stakePeriodStart < todayNumber - 1`), then transfer a reward from the staking reward account (`0.0.800`) to this account, then set `stakePeriodStart` to `todayNumber-1`. The value of `stakedNode.rewardSumHistory[todayNumber - 1 - t]` is the total reward in tinybars that has been earned by those staking to node `stakedNode` per token staked, throughout all of history up to and including the reward for the full day `t`. The account should rewarded for the first day of staking that hasn't yet received an award (`stakePeriodStart` minus the previous day), proportional to the minimum balance during that day. Plus, it should be rewarded for all later days (from `stakePeriodStart + 1` to `todayNumber`), proportional to the unchanging balance that it has had throughout that period. So, if `balance` is the balance of this account at the start of this transaction (before it might have been changed by running the smart contract), then the amount of the reward is calculated as:
```
    reward = declinedReward ? 0 : 
                balance * (  stakedNode.rewardSumHistory[ todayNumber - 1 - (todayNumber - 1) ] 
                           - stakedNode.rewardSumHistory[ todayNumber - 1 - (stakePeriodStart - 1) ]);
```
5. Execute the transaction (if it wasn't already executed in step 2).

6. Let `delta` be the amount by which `balance` increased due to the reward or as a result of executing the transaction. If `delta` is nonzero, then add `delta` to the appropriate field of the staking target. That is the `stakedToMe` field of an account it is staked to, or the `stakedReward` field of a node it is staked to (if `declineReward == false`), or the `stakedNoReward` fields of a node it is staked to (if `declineReward == true`).

7. If step 6 changed a field of another account, then repeat all the steps here on that account, to give it any rewards it might have earned so far.

#### End of Staking Period Computations

At the end of each staking period, the nodes will be updated. If the staking period is a day, lasting from one midnight UTC to the next, then this update is calculated immediately before handling the first transaction each day whose consensus timestep is after midnight. The calculation is described by the following pseudocode:

```
    long rate = min(accountBalance(0.0.800), stakingRewardRate); //total tinybars to give all stakers today
    long totalStakedRewarded = 0; 
    long totalStakedNoReward = 0;
    for each node {
        stake = stakedReward + stakedNoReward;
        if (stake < minStake) stake = 0;
        if (stake > maxStake) stake = maxStake; 
        long t = min(stake, stakedReward);
        totalStakedRewarded += t;
        totalStakedNoReward += stake - t;
        for (i=365; i>0; i--)
            node.rewardSumHistory[i] = node.rewardSumHistory[i-1];
    }
    for each node {
        long t = min(stake, stakedReward);    
        rewardSumHistory[0] = rewardSumHistory[1] + rate * t / totalStakedRewarded;
    }  
```

This divides the daily reward equally among all tinybars that were staked and didn't decline the reward. Except there is no reward for staking to a node that is under the minimum stake allowed, and it does not reward a portion of a stake to a node that was over its max limit. The daily reward is `stakingRewardRate`, unless account `0.0.800` has insufficient balance to give the full reward, in which case it simply distributes everything in `0.0.800`.

Note that all of the above is done during the time that a single transaction is handled. But it will be very fast, because it is only updating information for each node. It does not actually give any rewards. The accounts that stake are rewarded only when they are used, as described above.

During transaction handling, fees are computed and paid to `0.0.98` which are subsequently disbursed to node operators. A new fee called a *reward fee* will be added and a small percentage of the existing network fees paid into `0.0.98` will instead be paid into the reward account, `0.0.800`. The council will define the percentage for the reward fee. The balance of `0.0.800` will continue to accumulate until some threshold defined by the council, at which point staked accounts will begin to earn rewards.

For example, suppose the council set the distribution size to be 1M `hbar`. Once account `0.0.800` reaches 365M `hbar`, reward distributions will begin. All previous staking periods will have 0 rewards, but all subsequent staking periods will have 1M rewards. If all nodes have ≥ `minStake` and ≤ `maxStake` then each `hbar` staked will earn the same amount of reward, regardless of which node it is staked to. For any node that has < `minStake` then no `hbar` staked to that node will earn rewards. For any node with > `maxStake`, the `hbar` reward will be as if it were `maxStake`, and then distributed pro-rata to those accounts staked to that node. For example, if `maxStake` were 1B and a node actually had 3B `hbar` staked to it, and if Alice's account is staked to that node, then Alice will earn a third of the reward that she would have earned had this node not been staked beyond `maxStake`.

To make the computation of earned rewards a constant-time operation, the `rewardSumHistory` in the node contains cumulative reward values. At the beginning of each staking period, the existing `stake` is added to `rewardSumHistory[rewardSumHistory.length-1]` and added to the end of the history. When computing rewards, even those that involve tens or hundreds of days, we can simply subtract the value at `rewardSumHistory[stakePeriodStart]` from `rewardSumHistory[rewardSumHistory.length -1]` to get the total stake this node saw during that time period.

### Records

All transactions generate records, including transactions that change account balances, and transactions that change staking fields. These records are all sent to the mirror nodes. Therefore, a mirror node can know at all times the balance of each account, and whether it is staked. Therefore, it can know at all times the total stake to each node.

### New settings

The following new settings will be added to the system, and set by transactions signed by a majority of the Council.

- `StakingPeriod` - staking rewards are earned on hbars staked for at least this long (initially defined as one day)
- `StakingRewardRate` - the total tinybars earned as staking reward during each staking period (example: 100\_000\_000L * 1\_000\_000\_000 / 365 to emit rewards at a total rate of one billion hbars per year)
- `StakingStartThreshold` - Staking rewards are earned starting when `0.0.800` reaches this balance (example: 1 billion)
- `MinStake` (per node) - the minimum amount that must be staked to that node, in order for the node to participate in consensus
- `MaxStake` (per node) - the maximum amount of the stake to that node that will count (any amount staked above this is ignored for purpose of consensus weight and for staking rewards)
- `StakingRewardFeeFraction` - the fraction of each transaction fee (excluding node fee) that goes to the staking reward account `0.0.800`.
- `NodeRewardFeeFraction` - the fraction of each transaction fee (excluding node fee) that goes to the node reward account `0.0.801`. The remaining fraction `(1 - StakingRewardFeeFraction - NodeRewardFeeFraction)` goes to the treasury account `0.0.98`. Therefore, the sum of the two fractions must be between 0 and 1, inclusive.

### Activation

When this feature is first implemented, users will not immediately start earning staking rewards. Instead, the start will be triggered by the first time that the staking reward account (`0.0.800`) reaches a balance of at least `StakingStartThreshold` tinybars, which will be a setting that is set or changed by a signed transaction from the Council. Once it reaches that threshold, the rewards will be earned at a rate of `StakingRewardRate` tinybars per staking period.  

For example, if the staking period is 24 hours, and `StakingRewardRate` is a billion hbars divided by 365, and the `StakingStartThreshold` is a billion hbars, then that would mean that staking would not earn any rewards until `0.0.800` has reached a balance of a billion hbars. At that time, users could start to earn rewards from it, and the rate would be such that the staking rewards would continue to be earned for at least a year at that rate. The rewards would also continue to be earned after that, at a rate dependent on the amount of additional hbars that are transferred to that account, from a combination of transaction fees and grants from organizations and individuals. If there were a total of 15 billion hbars staked and earning rewards, then during the course of that year, each user staking 100 hbars would be earning between 6 and 7 hbars during that year. At the end of the year, when `0.0.800` is depleted, the staking rewards would continue, using only the portion received from transaction fees (a de minimus amount), until another grant is given to `0.0.800`, or until the transactions per second on the network are high enough to fund the entire `stakingRewardRate` each day. 

During the discussion period for this HIP, if any organizations or individuals reading it are planning to transfer grants to `0.0.800` for this purpose, then it will be useful to say so in the comments on this issue. Preferably, such comments could include projected amounts. These comments are not legal committments. But they will help the community as a whole understand how the community is thinking and planning.

## Backwards Compatibility

The API definition for `proxyAccountID` in `CryptoCreateTransactionBody` and other protobuf definitions will be updated to match this HIP specification. This field was not usable before, and was not exposed through any SDK.

Any mirror nodes or tools parsing record files will need to begin tracking staking changes and use staking to determine 1/3 superminority of record files.

Everything else is expected to be strictly backwards compatible.

## Security Implications

The definition of `minStake` and `maxStake` is essential to make sure no one node has too much stake in the overall system.

Staking will *not* be taken into account when determining the throttles for each node. It is possible that a small number of "bad" nodes can have a negative impact on overall network throughput. We mitigate this by using the mathematics of the hashgraph plus various forms of throttling. 

## How to Teach This



## Reference Implementation



## Rejected Ideas



## Open Issues / FAQ

Q: Can a node’s account change over time? What happens if I stake to a node’s account, only to find the node has moved to another account?

A: You stake to a node, not to its account. So if the node’s account changes, it makes no difference to the accounts that are staking to the node.


Q: Do we permit multiple levels of indirection in staking? We support account A → Node N, and we support account A → account B → Node N. But do we support account A → account B → account C → Node N? What about A → B → A? What about A → A?

A: We only support one level of indirection in staking. Cycles (A → A) are illegal. Longer chains like account A → account B → account C → Node N can exist, but then A will not actually be increasing the consensus weight of any node, and no reward will be generated for the staking by A. The only effect is that if B ever switches to staking to an active node, then A will automatically start giving that node more consensus weight, and B will automatically start receiving the earned rewards.


Q: Define how long we keep a history of staking amounts per node. If you don’t collect rewards before that time period, you will lose whatever rewards happened before the oldest retained data.

A: The history is kept for at most 365 staking periods (which means 365 days in the initial implementation). So as long as an account (or an account staked to it) has its balance change at least once a year (or the account changes its staking settings at least once a year), then it will never lose out on any earned rewards.


Q: Should nodes have a way to prohibit who can stake to it? The problem is that as a node owner, suppose I setup a node and give myself the min stake (let’s say, 1M hbar). Then some bozo comes along, and stakes a huge amount like 10M hbar, where the maxStake was maybe 5M. This whale is reducing the amount of return the node owner gets. They may not like that.

A: No. And the whale is hurt by this behavior, because they get less reward. So this incentivizes good behavior. Users should check how much is staked to a node before staking to it. And should check periodically to see if the node has been active, and generating earned rewards.


Q: Should we even allow anybody to stake a tinybar? Is there a minimum amount they should be able to stake?

A: There is no minimum amount to stake. Since staking is based on balance, anyone with a balance will get a reward. **Rewards are rounded down**. So staking a single tinybar is likely to earn a reward rounded to zero.


Q: Should throttle be based on stake?

A: No.


Q: What happens to the reward that would have been earned by an account electing not to receive stake?

A: The amount of reward for a given day is divided among all stakers that elected to receive rewards. So if an account is set to decline the rewards, there will simply be more rewards for others.


Q: Are rewards automatically compounded?

A: Yes, if there are transactions that trigger the reward, such as the account sending/receiving hbars, paying for a transaction, or changing its staking settings.


Q: What happens when an account is deleted?

A: We compute rewards and send them to whichever account is specified to receive the balance of that account.

