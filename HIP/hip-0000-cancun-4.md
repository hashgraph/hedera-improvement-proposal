---
hip: <HIP number (this is determined by the HIP editor)>
title: Support Cancun Self-Destruct Semantics in Smart Contract Services
author: Danno Ferrin (@shemnon)
working-group: // TBD
type: Standards Track
category: Core
needs-council-approval: Yes
status: Draft
created: // TBD
discussions-to: // TBD
updated: <comma separated list of dates>
requires: <HIP number(s)>
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

Add support for EIP-6780 SELFDESTRUCT semantics while supporting the Hedera
account model.

## Motivation

Ethereum Equivalence requires that Hedera add features supported by Ethereum
Mainnet (mapped to Hedera semantics). This effort also spans to the rare
occasion that Ethereum removes features from the EVM.

In this case Ethereum is wanting to remove the SELFDESTRUCT opcode in order to
make future upgrades achievable. The removal of all contract state as part of
self-destruction would make future data model changes prohibitively expensive.
However, there were a number of contracts that depended on side effects of
SELFDESTRUCT not related to the contract storage and contract code removal,
namely the transfer of Ether to a beneficiary address. Similarly, some DeFi
usage patterns used "transient" contracts to store data between calls within the
same transaction, and self-destruction was key to being a good citizen and not
leaving garbage around.

To reduce the damage that would occur from simply disabling the opcode Ethereum
decided to change the behavior of SELFDESTRUCT depending on the age of the
contract. If the contract existed prior to the start of the transaction the
operation would change so that neither the code nor the storage was deleted, but
the ether balance would be sent to the beneficiary. This moved the operation
into a "sweep" operation that allowed contracts to clean up all balance without
having to query it. For contracts that did not exist prior to the transaction
SELFDESTRUCT would continue to operate normally. Balance would be sent to the
beneficiary, and code and storage would be deleted. Since none of this data had
been part of the committed data the deletion did not impact any plans for
changes to their storage model.

Within the EVM Hedera should support a similar model, as contracts will now
expect SELFDESTRUCT to operate as a sweep in some cases. Outside the EVM,
however, there is no need to change any semantics. HAPI calls can still be used
to delete a contract and state expiry can still delete an account.

## Rationale

Hedera will support the [EIP-6780](https://eips.ethereum.org/EIPS/eip-6780)
change to the SELFDESTRUCT operation. If the contract existed prior to the
transaction the contract will not be destroyed and the contents will instead be
swept to the beneficiary. Contracts within the same transaction will be
destroyed as per prior behavior.

However, since Hedera places "ownership" of token balances with the account
holding the balance we will need to extend the behavior of the sweep mode to
also transfer all HTS tokens to the beneficiary. This is consistent with current
self-destruct behavior and consistent with the spirit of the Ethereum change in
that code and the account are no longer deleted.

When the self-destruct is invoked on a contract within a transaction the
behavior of Hedere will remain as it currently is in all respects.

## User stories

* As a smart contract developer I want to use the "sweep" semantics of EIP-6780
  in my contracts to sweep out hbar while not destroying the contract.
* As a smart contract developer I want to be able to continue to use the
  transient contract pattern and have it behave the same way prior to this HIP.
* As a HAPI user I want to be able to control my contract account in the same
  ways I did prior to this HIP.

## Specification

There are no changes needed to the JSON-RPC relay.

### EVM Implementation

The SelfDestructOperation will be re-implemented with hedera semantics. An
existing hedera version of self-destruct exists that may be manipulated in a way
similar to how the Besu EVM's implementation was altered.

The existing transient self-destruct behaviors will be retained, and the new
sweep mode changes will be added. All hBar and HTS tokens will be swept as part
of the self-destruct to the beneficiary address, what will change is that the
contract will not be marked for removal.

### Hedera Services

Hedera services may need to be changed to ensure that the transaction processing
does not leave a "shadow" account number for transient self-destructs. Such
transient self-destructs will also need to be tested to ensure all HTS tokens
are properly swept during the sweep as well as the transient contract modes.

### Hedera Activation

The operation will be added into a new EVM version of Hedera (notionally
version 0.50, but subject to change), like the versions added for Shanghai
support (v 0.38) and Paris support (v 0.34). There will be multiple HIPs rolled
into this EVM version.

## Backwards Compatibility

This change could break contracts that depend on selfdestruct destroying old
contracts. Relying on such behaviors has been discouraged for years and formally
deprecated for at least a year on Ethereum Mainnet, so it is expected that such
use cases have never found their way onto Hedera's Mainnet.

In the event such a pattern is discovered, the ability to use HAPI calls to
delete the contract can be used as a shim to restore proper functionality
between transactions.

## Security Implications

The substantial changes of this HIP are the removal of some functionality in
some circumstances. There are no known security impacts of this removal and
furthermore there are no known security mitigations that require the presence of
the removed functionality. It is expected the security implications will be
minimal to none.

## How to Teach This

When discussing fork compatibility it should be called out that HTS token
balances will be included in sweep operations. Such documentation should already
exist for the existing self-destruct behavior. Because the SELFDESTRUCT
operation is still formally deprecated for remove it is not recommended that any
tutorials be written to demonstrate sweep mode or transient contract deletions.
Tutorials should only be written for features that have been signaled as long
term stable.

## Reference Implementation

//TODO

## Rejected Ideas

One alternative is to simply not implement EIP-6780 and to continue to allow
contracts to use SELFDESTRUCT. This was rejected because we do not want to
encourage smart contracts to use deprecated design patterns and rely on
out-of-date features within Hedera.

## Open Issues

// NONE

## References

* [EIP-6780](https://eips.ethereum.org/EIPS/eip-6780): SELFDESTRUCT only in same
  transaction

## Copyright/license

This document is licensed under the Apache License, Version 2.0 --
see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
