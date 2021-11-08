---
hip: 32
title: Auto Account Creation
author: Leemon Baird <leemon@hedera.com>
type: Standards 
category: Service
needs-council-approval: Yes
status: Last Call
last-call-date-time: 2021-11-22T07:00:00Z
created: 11-01-2021
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/187
---

## Abstract

This hip introduces a new way to create accounts on Hedera using a public key.
  
## Motivation
If a user has an account on Hedera, it is easy to create new accounts, paying for the new accounts from the old one. But if a user has no account, then it is inconvenient to create a new account, because they need the help of someone else to pay for the creation of the account. 

## Rationale

A possible solution would have been to make all account creation free, but this would encourage denial of service attacks that over-use the free service. So this is not ideal.

A better solution is to allow users to create "accounts" for free that are not actually accounts on Hedera that use resources, but that convert into Hedera accounts in a way that is automatic and invisible to the user.

The Hedera API (HAPI) can be modified very slightly, so that HBAR transfers can continue to send to account IDs (such as 0.0.123), but can optionally send to an account identified only by its public key. When such an account doesn't yet exist, then it will be automatically created, with the fee being subtracted from the HBAR amount being transferred.

### Wallets
  
Wallet software can allow the user to create an "account" instantly, for free, even without an internet connection. In this case, it will not create an actual account on Hedera. Instead, it will simply create a public/private key pair for the user. The software will then display this as an "account" with a zero balance, with a "long account ID", which doesn't look like 0.0.123, but instead is a long base-64 string encoding the public key.

The user can then buy HBAR on an exchange, or receive HBAR sent from a friend, or receive HBAR paid by a customer. In all those cases, they will tell the other party that their "account ID" is that public key. And the transfer will actually create an actual Hedera account, deducting the creation fee from the amount transferred.

The wallet software can then query a mainnet node (or a mirror node) for info about their "account" using the long form of the account ID, and the reply will indicate whether it exists, what its actual account ID in short format is, and what its current balance is. At that point, the wallet can start displaying the short-format account ID rather than the long format.

## User stories

As a wallet provider, I would like to create free Hedera accounts for users.
 
## Specification
  
### Implementation for Hedera

HAPI will need to be updated to add 2 optional fields to the crypto transfer transaction. One is the "long-format account ID" (which is actually the public key in base 64). The other is the amount to transfer to that ID.

The transaction receipt and record will need additional fields to include this information. Including the actual account ID, if the transaction actually created an account. 

An automatically-created account will be created with only one public key (the one that is its long-form account ID). It will have received signature required turned off. It will be created with whatever is the default expiration time at the time it is created (currently about 3 months). Its initial balance will be the amount transferred, minus the creation fee. If the amount is insufficient to pay the fee, then the transaction fails, and nothing is created.

Each account in memory will need to store an additional field for the `aliasKey`. This is a single public key. It is the one that was used to create the account, if it was automatically created.  It will be null if that account was created normally.  It will remain unchanged, even if the account later has its keys changed, to add new keys, or even to remove this one.

At most one account can ever have a given alias key. If a transaction auto-creates the account, any further transfers to that alias will simply be deposited in that account, without creating anything, and with no creation fee being charged.

Hedera Services will then need to store a map from public key to the created account. This can be a rebuilt data structure, that is regenerated each time a new state is loaded from disk. It is only populated with (key,account) pairs for accounts that were auto-created, and still exist.  

When an account expires, it is frozen for a period of time, then eventually deleted. At the moment it is deleted, its alias (if any) is removed from the map.

The `getAccountInfo` query will also need an optional field for the long form of an account ID. If the account exists, it will return the standard information, including the short account ID, plus the alias key.

The receipt and record for a transaction should also be updated as appropriate.

### Implementation for mirror nodes

Mirror nodes will need to record the new information, and allow queries by long-form account number, in addition to the current short-form queries.

### Implementation for wallet software

The wallet software will need to support the workflow described in the summary. Whenever it would query for the balance of a normal account, it will also query for one of these long-form "accounts". Once it learns that an "account" has turned into a real account, it should update what it knows so that it is treated exactly like any other real account.

From the user's point of view, these virtual "accounts" should be indistinguishable from normal accounts, other than the fact that their "account ID" is in a long format.

## Backwards Compatibility
* Accounts created prior to the implementation of this feature cannot use the public key of the account to transfer hbars to
* New accounts created after the release of this feature can use the public key to transfer funds to
  
## Security Implications

## How to Teach This

* Generate a key pair offline, send hbar to the public key address

## Reference Implementation

## Rejected Ideas

## Open Issues

## References

## Copyright/license
This document is licensed under the Apache License, Version 2.0 -- see LICENSE or (https://www.apache.org/licenses/LICENSE-2.0)
