---
hip: 
title: Schedule Service System Contract
author: Nana Essilfie-Conduah (@nana-ec)
working-group: Richard Bair (@rbair23), Jasper Potts (@jasperpotts)
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2023-06-14
discussions-to: 
updated: 
requires: 
replaces: 
superseded-by: 
---

## Abstract

This proposal addresses the feature gap of a smart contracts ability to issue scheduled transactions via the HAPI scheduled transactions.

Since smart contracts executions do not utilize the Hedera signature map they are unable to carry along the authorizations that the Hedera ledger uses to confirm an accounts participation and acknowledgment in a transaction. 

To address this Smart Contracts could utilize the Hedera Schedule Service by submitting a scheduled transaction to which accounts can sign / authorize as an acceptance of the desired transaction. This flow provides as easy route for asynchronous coordination of transaction approval.

## Motivation

In many decentralized scenarios a contract may issue a transaction that would require participation by multiple entities.

However, under the Hedera Smart Contract Service (HSCS) Security Model v2 it is not possible to authorize a contract in advance to modify an accounts property or cause a debit to their balance without their authorization. This essentially means multi party operations made challenging if not infeasible on smart contracts.

This is a step back in the Hedera UX that was made easier by the use of in transaction signatures.

## Rationale

By providing a secure mechanism to acquire asynchronous authorization from multiple accounts, smart contracts can continue to be used for more decentralized operations whiles still maintaining the integrity of account sovereignty by allowing accounts to approve confirm their participation in a transaction.

## User stories

1. As an EOA I would like to initiate a smart contract transaction that schedules a supported transaction.
2. As an EOA I would like to initiate a smart contract transaction that allows me to sign a scheduled transaction.
3. As an EOA I would like to initiate a smart contract transaction that prompts a contract to authorize a scheduled transaction.
4. As an EOA I would like to initiate a smart contract transaction that allows me to extract information about a scheduled transaction.
  
## Specification

The ledger HSCS will utilize the existing scheduled transaction service supported on the ledger within the system contract logic. 

To achieve this a new Hedera Schedule Service (HSS) system contract will need to be created to encompass and expose the necessary scheduled transaction features.

### Hedera Schedule Service (HSS) system contract

A new `IHederaScheduleService` interface will be implemented to allow accounts to authorize a pre-existing scheduled transaction via smart contracts

|   Hash        |   Selector                                |   In contract support |
|---------------|-------------------------------------------|-----------------------|
| `0xf0637961`  | `authorizeSchedule(address)`              | Y                     |
| `0x5e147101`  | `getScheduledTransactionInfo(address)`    | Y                     |
| `0xd797b304`  | `signSchedule(address)`                   | N                     |
| `0x358eeb03`  | `signSchedule(address,bytes)`             | Y                     |

Since `signSchedule(address scheduleAddress) returns (int64 responseCode)` relies on an implicit signature it will only callable by EOA’s via the IHRC facade.
In this case the signature will be the inner ECDSA signature found in the RLP encoded `EthereumTransaction`. 
For `Contract` and `ContractCreate`  any applicable signature found in the signature map will be utilized as in `ScheduleSign`.

Note this HIP does not provide an API to create a scheduled transaction. This is left to future HIPs to present the appropriate transactions that may be scheduled.
No further protobuf or application level changes are needed as HSS is already implemented and functional.

## Backwards Compatibility

Backwards compatibility is ensured as no existing features are modified. Similar to HTS system contract this HIP simply exposes HAPI entity functionality and the system comtract will utilize the same HAPI services on the node.

## Security Implications

Existing security consideration such as throttles will remain applicable. 
Additional considerations may include

### Storage considerations

Schedule transaction timespan will continue to be honored and scheduled transactions will be removed from memory upon execution or expiration.

### Fee considerations

Gas collections should encompass the following aspects of the network

- Storage cost via fees
- EVM execution work via gas
- Consensus Node execution work via fees

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

- https://github.com/hashgraph/hedera-services/blob/develop/hedera-node/docs/scheduled-transactions/revised-spec.md
- https://docs.hedera.com/guides/docs/hedera-api/schedule-service
- https://docs.hedera.com/guides/docs/sdks/schedule-transaction
- https://docs.hedera.com/guides/docs/mirror-node-api/rest-api#schedule-transactions

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
