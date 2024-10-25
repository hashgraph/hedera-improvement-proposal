---
hip: <HIP number (assigned by the HIP editor), usually the PR number>
title: Sponsored Fees
author: Nana Essilfie-Conduah <@Nana-EC>, Brendon Vade <@brendonv>, Matt Woodward <@app-matt>, Tim Johnson <tim.johnson@auspayplus.com.au>
working-group: Greg Scullard <@gregscullard>, Ty Smith <ty-swirldslabs>, Keith Kowal <Reccetech>, Atul Mahamuni <@atul-hedera>
requested-by: <Name(s) and/or username(s), or name(s) and email(s) of the individual(s) or project(s) requesting the HIP. Ex: Acme Corp <request@acmecorp.com>>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2024-10-25
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/912
updated: 2024-10-25
Requested-By: HbarGasStation, AP+
---

## Abstract

This HIP proposes an expansion to the approval and allowance network logic (e.g.CryptoApproveAllowance ) by allowing
any account on the network to sponsor the payment of the fees for another account’s submitted transactions.
In this way account Alice may assign an HBAR / token transaction fee allowance for EOA account Bob or Contract account
Carol and pay the fees due to nodes, the network and accounts for any transactions they submit, thus allowing Bob or
Carol to have zero balance and still transact on chain.

This proposal extends the existing Approval and Allowance API by adding 2 new allowance types (TransactionFeeAllowance
and CustomFeeAllowance) that inform the delegation of fee payments to another account without requiring one-off
approval for each transaction. This feature enhances flexibility and efficiency in managing transaction costs,
particularly for high volume applications.

## Motivation

The web3 space user onboarding process is hindered by the the requirement of an account maintaining sufficient crypto
currency at all times to engage with the network. On Hedera, this means an account must always have sufficient hbar
balance at all times to submit a HAPI transaction to the network.

Whiles this serves as a security feature to ensure node and network resources utilized are paid, it requires that new
users must first obtain cryptocurrency value to engage with the network. It also prevents the abstraction of payments
from the submission of transactions. Many more users could be onboarded to the network as well as incentivized to
engage with the network if their transactions could be “Hbar Less”.

Additionally, ecosystem development grant providers find it challenging to distribute funds to partners in a way that
is accurate and encourages transaction on the network. Grant providers want to make sure their projects can only spend
hbars awarded on transaction fees to the network and not for value transfer cases sometimes unassociated. This make is
easier for grant givers to track funds and assure appropriate usage.

The appropriate solution is one that enables low barrier to entry for users but also maintains network security
regarding fee payment. To this end a flow that allows other users to sponsor the fees required of an account during a
transaction submission would satisfy both desires. 

Ultimately the current Hedera ecosystem lacks a native capability for an Owner account to cover transaction fees of a
Spender without co-signing for every transaction. This limitation hinders the development of user-friendly applications
and services that could benefit from a more flexible transaction fee payment flow.

## Rationale

Today the network supports 3 types of allowances `HbarAllowance`, `TokenAllowance` and `NftAllowance` . An account may
submit a `CryptoApproveAllowance` transaction and specify the amount of value they are willing to allow another account
to transfer out of their own balance. This HIP builds upon the allowance logic with the introduction of another
allowance type `TransactionFeeAllowance`. 

Accounts would follow the same pattern of `CryptoApproveAllowance` submission to designate and update an allowance.
When a designated account submits a transaction identified as sponsored, the network would debit the sponsoring account
balance for all HBar fees associated with the transaction, instead of the account sending the transaction. 

Notably, a pseudo sponsored transaction flow exists today if the sponsor submits a transaction signed by the sender.
However, this flow requires significant offline coordination and is time limited in some cases depending on transaction
validation timing window. This HIP provides a solution that is not limited by either of these considerations. A sponsor
need only know the accountId or EVM address of the account they want to sponsor. An account being sponsored need only
know the account id or EVM address of their sponsor to submit a transaction and specify to the network that the
transaction will be paid by the sponsor.

Additionally, this flow allows for a user with an EVM address but no Hedera account to share their address and be
sponsored in advance of their first transaction submission to the network. In this way their first transaction will
both not be rejected by the network but will also automatically create their account for them offering a seamless
onboarding process. 

The proposed changes are made in alignment with the current implementation of allowances for similar capabilities
(as seen in [HIP 336](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-336.md)).

## User stories

1. As an existing account on the network I want to be able to sponsor up to a certain HBAR limit the cost of future transaction fees due by another account by granting an explicit allowance.
2. As an existing account on the network I want to be able to sponsor an unlimited amount of HBARs to cover the cost of future transaction fees due by another account by granting an explicit allowance.
3. As an existing account on the network I want to be able to sponsor up to a certain HBAR limit the cost of different scopes of allowances such as transfers, fee payments and custom fees by granting an explicit allowance in a single transaction.
4. As an existing account on the network I want to be able to sponsor up to a certain fungible token limit the cost of future token custom fee fees due by another account by granting an explicit allowance.
5. As an account sponsoring transaction fees I want to be able to update the allowance amount higher or lower.
6. As an account sponsoring transaction fees I want to be able to revoke the allowance amount I previously granted.
7. As a user on the network with balance I want to be able to submit transaction that utilize my sponsors balance to pay for fees instead of mine.
8. As a user (hollow or complete) with no balance I want to be able to submit transaction that utilize my sponsors balance to pay for fees.
9. As a user of the network I want to be able to query the current transaction fee allowance balance granted to an account from a sponsor.
10. As an enterprise DApp operator I want to provide a Web3 service / product but do not want to handle crypto assets as part of the operational costs.
11. As a software provider I want to cover the transaction fees of a customer’s account to allow them to interact with my Software even with 0 HBARs in their account.
12. As a user of the network, Alice wants to utilize funs from an already approved allowance to her to pay for transaction fees even when she has more than enough hbars to pay for the transaction herself.
13. As a user of the network, Alice wants to utilize funds from her balance to pay for transaction fees even when she has more than enough hbars assigned to her in a transaction fee allowance to pay for the transaction.
  
## Specification

2 User journeys are illustrated below

### Enterprise DApp Operator

User Story: As an enterprise DApp operator I want to provide a Web3 service / product but do not want to handle crypto assets as part of the operational costs.

User Journey:

1. The enterprise DApp operator signs a commercial off-chain agreement with a crypto intermediary to service their crypto purchases for the operation of their DApp.
    1. The crypto intermediary whitelists the enterprise DApp operators primary Hedera account Id on their management platform (for ongoing management platforms needs).
    2. The crypto intermediaries signs and submits an AccountAllowanceApproveTransaction (using a new method of approveHbarFeeAllowance) to provide an on-chain reference to the agreement which designates the enterprise DApp operator as the spender.
        1. The fee for this transaction is covered by the crypto intermediary.
        2. The new approveHbarFeeAllowance method could allow for both fixed and unlimited values.
2. The enterprise DApp operator configures the Crypto intermediary as their Fee Sponsor for all HBAR transaction / query costs.
    1. E.g. Client.setFeeSponsor()
3. The enterprise DApp operator submits a signed transaction to the network, the transaction body is interrogated (by the network) for the fee_sponsor_account_id and the Fee Sponsors account identified (where present).
4. The Fee Sponsor’s Account is interrogated (by the network) for a Fee Allowance using the enterprise DApp operators account Id
    1. The transaction succeeds if the allowance is present and has either:
        1. unlimited remaining allowance; or
        2. A remaining balance greater than the current transaction fee
    2. Otherwise the transaction fails.
5. Where the transaction succeeds, the HBAR fees for the transaction are deducted from the Fee Sponsors account.
    1. The enterprise DApp operators HBAR account balance (used to sign the transaction) is left untouched
    2. The enterprise DApp operator’s HBAR balance can be zero.
6. The transaction is successful.

### Enterprise Software Provider

User Story: As a software provider I want to cover the transaction fees of a customer’s account to allow them to interact with my Software even with 0 HBARs in their account.

User Journey:

1. The software provider signs an AccountAllowanceApproveTransaction (using a new method of approveHbarFeeAllowance) which designates the customer as the spender.
    1. The fee for this transaction is covered by the software provider.
    2. The new approveHbarFeeAllowance method could allow for both fixed and unlimited values.
2. The software provider sets the customer’s fee sponsor as the software provider’s dedicated fee account (and synchronizes this with customer’s software for use during transaction submission).
3. The customer submits a signed transaction to the network, the transaction body is interrogated (by the network) for the fee_sponsor_account_id and the Fee Sponsors account identified (where present).
4. The Fee Sponsor’s Account is interrogated (by the network) for a Fee Allowance using the customer’s account Id.
    1. The transaction succeeds if the allowance is present and has either:
        1. unlimited remaining allowance; or
        2. A remaining balance greater than the current transaction fee
    2. Otherwise the transaction fails.
5. Where the transaction succeeds, the HBAR fees for the transaction are deducted from the Fee Sponsors account (i.e. the software provider).
    1. The customer’s HBAR account balance (used to sign the transaction) is left untouched
    2. The customer’s HBAR balance can be zero.
6. The transaction is successful.

### Protobuf

Allowance creation and update

A new `TransactionFeeAllowance` protobuf message
```protobuf
    /**
    * An approved allowance of hbar transfers for a spender.
    */
    message TransactionFeeAllowance {
        /**
        * The account ID of the hbar owner (ie. the grantor of the allowance).
        */
        AccountID owner = 1;

        /**
        * The account ID of the spender of the hbar allowance.
        */
        AccountID spender = 2;

        /**
        * The amount of the spender's allowance in tinybars. 
        * A value of -1 will signify an unlimited amount.
        */
        int64 amount = 3;
    }
```

A new CustomFeeAllowance
```protobuf
    /**
	 * An approved allowance of hbar transfers for a spender.
	 */
	message CustomFeeAllowance {
	  /**
	   * The account ID of the hbar owner (ie. the grantor of the allowance).
	   */
	  AccountID owner = 1;
	
	  /**
	   * The account ID of the spender of the hbar allowance.
	   */
	  AccountID spender = 2;
	
	  /**
	   * The number of units to assess as a fee (hbar of fungible token)
	   * A value of -1 for the FixedFee.amount will signify an unlimited amount.
	   */
	  FixedFee fungible_amount = 3;
	}
```

The updated CryptoApproveAllowanceTransactionBody
```protobuf
    message CryptoApproveAllowanceTransactionBody {
        ...

        /**
        * List of hbar transaction fee allowances approved by the account owner.
        */  
        repeated TransactionFeeAllowance transactionFeeAllowance = 4;
        
        /**
        * List of custom fee allowances approved by the account owner.
        */  
        repeated CustomFeeAllowance customFeeAllowance = 5;
    }
```

The updated TransactionBody will contain the sponsored transaction identifier
```protobuf
    message TransactionBody {
        ...

        /**
        * The account a spender is noting has provided prior willingness through an transaction fee allowance to sponsor transaction fees
        */
        AccountID fee_sponsor_account_id = 53;
        
        /**
        * The account a spender is noting has provided prior willingness through a custom fee allowance to sponsor custom fee transaction fees
        */
        AccountID custom_fee_sponsor_account_id = 54;
    }
```

The updated QueryHeader transaction would also contain the sponsored transaction identifier
```protobuf
    message QueryHeader {
        ...

        /**
        * The account a spender is noting has provided prior willingness through an HBAR allowance to sponsor transaction fees
        */
        AccountID fee_sponsor_account_id = 3;
    }
```

<aside>
Note: A user must specify the fee_sponsor_account_id for the network to consider the validity of the sponsored transaction. If not specified the network will treat this as a normal transaction for which the submitter is due the transaction fees.
</aside>

### Error Cases

As with normal transaction it’s possible for a sponsored transaction to fail. Existing transaction network rules will be applicable. 

A noted sponsoring account must be valid. A node that encounters an invalid sponsoring account value will respond with a new response code

```protobuf
    enum ResponseCodeEnum {
        ...

        INVALID_SPONSOR_ACCOUNT = 352;
    }
```

Transaction sponsorship will be complete in nature, a sponsor must be able to cover the full fee. In the case a sponsor lacks insufficient balance to cover an account that transaction will fail with a new response code.

```protobuf
    enum ResponseCodeEnum {
        ...
        
        INSUFFICIENT_SPONSOR_ACCOUNT_BALANCE = 353;
    }
```

### Transaction Id

Currently the transaction id of any submitted transaction takes the form of `<accountId>@<validStartTime>` format. Usually the `accountId` signifies the user who both submitted and paid for the transaction. With the changes from this HIP the `accountId` value in the transaction id of a sponsored transaction will refer only to the submitter and no longer the payer. The accountId of the payer will be located in the transaction body. 

### System Contract Functions

Similar to [HIP 906](https://hips.hedera.com/hip/hip-906), the system contract interface would need to be updated to support the similar management of allowances by a smart contract.

An EOA will be afforded the following functions
```solidity
    interface IHRCxyz {
        function transactionFeeHbarAllowance(address spender) external returns (responseCode, int256);
        function transactionFeeTokenAllowance(address spender, address token) external returns (responseCode, int256);
        function transactionFeeApprove(TransactionFeeAllowance transactionFeeAllowance, CustomFeeAllowance customFeeAllowance) external returns (responseCode);
    }
```

An update to the IHAS will allow contracts to
```solidity
    interface IHederaAccountService {
        ...
        function transactionFeeHbarAllowance(address owner, address spender) external returns (responseCode, int256);
        function transactionFeeTokenAllowance(address owner, address spender, address token) external returns (responseCode, int256);
        function transactionFeeApprove(address owner, TransactionFeeAllowance transactionFeeAllowance, CustomFeeAllowance customFeeAllowance) external returns (responseCode);
        ...
    }
```

### SDK API

With the introduction of new allowance pathways, the SDK will need to expose the functionality to developers.

AccountAllowanceApproveTransaction

- addTransactionFeeAllowance()
- approveTransactionFeeAllowance()
- addCustomFeeAllowance()
- approveCustomFeeAllowance()

AccountAllowanceAdjustTransaction

- addTransactionFeeAllowance()
- grantTransactionFeeAllowance()
- revokeTransactionFeeAllowance()
- addCustomFeeAllowance()
- grantCustomFeeAllowance()
- revokeCustomFeeAllowance()

### Mirror Node API

The Mirror Node, similar to hbar allowance, would need to be update to support the querying of `TransactionFeeAllowance` and `CustomFeeAllowance` values.

Namely, new `/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/transactionfees` and `/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/customfees` endpoints.

`/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/transactionfees` response may resemble

```json
    {
        "allowances": [
            {
                "amount": 75,
                "amount_granted": 100,
                "owner": "0.0.2",
                "spender": "0.0.2",
                "timestamp": {
                    "from": "1586567700.453054000",
                    "to": "1586567700.453054000"
                }
            }
        ],
        "links": {
            "next": null
        }
    }
```

`/api/v1/accounts/{idOrAliasOrEvmAddress}/allowances/customfees` response would resemble
```json
{
    "allowances": [
        {
            "amount": 75,
            "amount_granted": 100,
            "owner": "0.0.2",
            "spender": "0.0.2",
            "timestamp": {
                "from": "1586567700.453054000",
                "to": "1586567700.453054000"
            }
        },
        {
            "amount": 75,
            "amount_granted": 100,
            "owner": "0.0.2",
            "spender": "0.0.2",
            "timestamp": {
                "from": "1586567700.453054000",
                "to": "1586567700.453054000"
            },
            "token_id": "0.0.2"
        }
    ],
    "links": {
        "next": null
    }
}
```

## Backwards Compatibility

Currently the ledger allows for sponsored transaction fees by charging the transaction submitter/payer. This HIP does not conflict with this flow, but rather adds an additional flow.

The are also no changes to existing allowance concepts so there should be no regression in feature support.

## Security Implications



## How to Teach This

SDK examples, blogs and tutorials on docs.hedera.com

## Reference Implementation


## Rejected Ideas

### Partial Payments

The idea of partial payments was initially considered in which an account could sponsor a sub amount of fees (finite or percentage) in a transaction and a user would cover the rest. However, this flow becomes unnecessarily complex and the need isn’t clear initially. As such sponsorship of fees will be complete and not partial - if an account sponsors a transaction fee it much have provided enough in the allowance to cover the whole transaction fee. If this is not the case the transaction will fail.

## Open Issues

- [ ]  Should there be a flow to sponsor an infinite amount of HBAR for an account? In one sense this is an infinite allowance limited only by the sponsors balance.
    1. Yes, this is a valuable flow that simplifies accounting and is based on explicit specification.


## References


## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
