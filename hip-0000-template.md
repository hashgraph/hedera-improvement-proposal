---
hip: 
title: Partially Fungible Tokens
author: Albert Tam <albert.tam@hedera.com>
working-group: John Shipman <jshipman@centre.io>, Chad Richman <crichman@centre.io>, Atul Mahamuni <atulmahamuni@hedera.com>, Mohsin Qamar <mohsin.qamar@hedera.com>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-02-10
discussions-to: 
updated: 2022-02-10
---

## Abstract

This proposal describes a feature that allows institutions to manage a token that is partially fungible with other related tokens. The fungibility of the tokens is determined by a transfer policy that is comprised of triggered smart contracts that decide the transfer outcome and are capable of re-calculating the transfer list.

## Motivation

The motivation is critical for HIPs that want to change the Hedera codebase or ecosystem. It should clearly explain why the existing specification is inadequate to address the problem that the HIP solves. HIP submissions without sufficient motivation may be rejected outright.

## User stories

As a token issuer, I want to mint and manage my own token and have this token be fungible with tokens issed by other issuers in my consortium.

As a token issuer, I want to attach tags or alternative identifiers to the token to distinguish if from other tokens that it is fungible with.

As a token issuer, I want the transfer of tokens to conditionally trigger a smart contract execution based upon the properties of the token such as its tags or the transfer amount.

As a token issuer, I want the transfer logic triggers to NOT be smart contract based in order to utilize the full speed of token transfers.

As a token issuer, I want the triggered smart contract to be able to approve or deny the transfer. 

As a token issuer, I want the triggered smart contract to be able to modify the transfer list to allow for custom discounts.

As a token issuer, I want the triggered smart contract to be able to modify the transfer list to allow for other tokens (such as reward tokens) to be granted to transfer parties.

As a token user, I want to be able to identify the number of partially fungible tokens in my account that were issued by each issuer.

## Specification

### Terminology

The following terms will be used repeatedly throughout this section:

- root token: the token containing the transfer policy.
- sub-token: a token associated with the root token that contains a set of tags.
- transfer policy: a series of rules that govern transferability of the root token and any constituent sub-tokens.
- transfer rule: combination of a trigger expression and a smart contract address that will be executed if the expression evaluates to true.
- family - a root token plus all of the sub-tokens that are associated with it.

### Introduction of Root Token Type

The main component of the partially fungible token family is the root token. This token serves as the repository for the transfer policy that will be applied during transfer of the root and sub-tokens.

In an object-oriented sense, the root token can be thought of as an abstract base class while the sub-tokens are derived concrete classes. The root token itself cannot be minted, but any transfers of the associated sub-tokens can use the `TokenID` of the root token and allow the transfer policy to determine the actual concrete sub-tokens to use instead.

The exising `TokenCreate` Hedera API will be extended to handle the creation of a root token.

```protobuf
enum TokenType {
	// existing values
	FUNGIBLE_COMMON = 0;
	NON_FUNGIBLE_UNIQUE = 1;
	
	// new values
	FUNGIBLE_PARTIAL_ABSTRACT = 2;
	FUNGIBLE_PARTIAL_DERIVED = 3;
}

// existing message
message TokenCreateTransactionBody {
	// existing fields
	string name = 1;
	string symbol = 2;
	uint32 decimals = 3;    // must be 0
	uint64 initialSupply = 4;    // must be 0
	AccountID treasury = 5;    // not used
	Key adminKey = 6;
	Key kycKey = 7;
	Key freezeKey = 8;    // not used
	Key wipeKey = 9;    // not used
	Key supplyKey = 10;    // not used
	bool freezeDefault = 11;    // must be false
	Timestamp expiry = 13;
	AccountID autoRenewAccount = 14;
	Duration autoRenewPeriod = 15;
	string memo = 16;
	TokenType tokenType = 17;    // FUNGIBLE_PARTIAL_ABSTRACT
	TokenSupplyType supplyType = 18;    // FINITE
	int64 maxSupply = 19;    // must be 0
	Key fee_schedule_key = 20;    // not used
	repeated CustomFee custom_fees = 21;    // not used
	Key pause_key = 22;
	
	// new field for root tokens
	repeated PolicyRule transfer_policy = 23;
	
	// new field for sub-tokens
	TokenID root_token_id = 24;
	repeated string tags = 25;
}
```

Two new `TokenType` enumeration values will be introduced to denote the root and sub-token types:

- `FUNGIBLE_PARTIAL_ABSTRACT` - root token
- `FUNGIBLE_PARTIAL_DERIVED` - sub-token

A majority of the fields in the `TokenCreateTransactionBody` message are not required for root token creation as there is no supply to manage. The following fields will be ignored if specified in any `TokenCreate` for a root token:

- `decimals` will use value 0 instead
- `initialSupply` will use value 0 instead
- `treasury`
- `freezeKey`
- `wipeKey`
- `supplyKey`
- `freezeDefault` will use value `false` instead
- `supplyType` will use value `FINITE` instead
- `maxSupply` will use value 0 instead
- `fee_schedule_key`
- `custom_fees`
- `root_token_id`
- `tags`

The transfer policy is optional and need not exist for a root token. Note that transfers of the root token without a default sub-token (see Root Token CRUD for details) or a transfer policy that will determine the actual sub-tokens to use will result in a failed transaction.

The root token cannot be associated with an account as this token type cannot be minted. Any `TokenAssociate` transactions involving a root token will fail.

#### Transfer Policy

The transfer policy consists of a series of rules, each of which are executed during a token transfer of either the root or associated sub-tokens.

Each of the rules consists of two parts:

1. A trigger boolean expression that will always be evaluated during a transfer.
2. The address of a previously deployed smart contract that will be executed if the trigger expression evaluates to true.

The trigger boolean expression is specified using the following protobuf messages.

```protobuf
message TriggerExpression {
	oneof expr {
		AndExpression and_expr = 1;
		OrExpression or_expr = 2;
		NotExpression not_expr = 3;
		FunctionExpression fx_expr = 4;
	}
}

message AndExpression {
	TriggerExpression left_expr = 1;
	TriggerExpression right_expr = 2;
}

message OrExpression {
	TriggerExpression left_expr = 1;
	TriggerExpression right_expr = 2;
}

message NotExpression {
	TriggerExpression expr = 1;
}

message FunctionExpression {
	oneof fx {
		HasSubTokenFunction has_sub_token_fx = 1;
		HasTagFunction has_tag_fx = 2;
		HasTagsFunction has_tags_fx = 3;
		HasNoTagsFunction has_no_tags_fx = 4;
	}
}

message HasSubTokenFunction {
	TokenID token_id = 1;
}

message HasTagFunction {
	string tag = 2;
}

message HasTagsFunction {
	repeated string tags = 1;
}

message HasNoTagsFunction {
}

message PolicyRule {
	TriggerExpression trigger = 1;
	ContractID contract_id = 2;
}
```

Each of the rules are executed in the order they are defined. This means that it is possible for the trigger expression of one rule to be affected by the execution of an earlier triggered smart contract that altered the transfer list.

No gas is required to execute the policy rule triggers. Payment for trigger execution will be covered by hbar transaction fees.

The gas to use for all of the policy rule contracts executed will be specified as part of the transfer transaction. Insufficient gas will result in `INSUFFICIENT_GAS`.

##### Trigger Expression Functions

| Function    | Parameters | Description |
| :---        | :----      | :---        |
| HasSubToken  | token_id   | Returns `true` if any of the transfers involves the a sub-token with the specified `token_id`. |
| HasTag      | tag        | Returns `true` if any of the transfers involves a sub-token with the specified `tag`. |
| HasTags     | tags       | Returns `true` if any of the transfers involves a sub-token with all of the specified `tags`. |
| HasNoTags   |            | Returns `true` if all of the transfers involve the root token. |

### Introduction of Sub-Token Type

The sub-token constitutes the main transferable component in the partially fungible token family. It is created in a similar manner to regular fungible tokens in that it can be minted, burned, frozen, transferred, etc... Each sub-token contains a series of custom tags that help to distinguish the sub-token from other sub-tokens in the same family.

```protobuf
// existing message
message TokenCreateTransactionBody {
	// existing fields
	string name = 1;
	string symbol = 2;
	uint32 decimals = 3;    // must be 0
	uint64 initialSupply = 4;    // must be 0
	AccountID treasury = 5;    // not used
	Key adminKey = 6;
	Key kycKey = 7;
	Key freezeKey = 8;    // not used
	Key wipeKey = 9;    // not used
	Key supplyKey = 10;    // not used
	bool freezeDefault = 11;    // must be false
	Timestamp expiry = 13;
	AccountID autoRenewAccount = 14;
	Duration autoRenewPeriod = 15;
	string memo = 16;
	TokenType tokenType = 17;    // FUNGIBLE_PARTIAL_ABSTRACT
	TokenSupplyType supplyType = 18;    // FINITE
	int64 maxSupply = 19;    // must be 0
	Key fee_schedule_key = 20;    // not used
	repeated CustomFee custom_fees = 21;    // not used
	Key pause_key = 22;
	
	// new fields
	repeated PolicyRule transfer_policy = 23;
	TokenID root_token_id = 24;
	repeated string tags = 25;
}
```

Each sub-token is managed separately from other sub-tokens in the same family. There is no over-arching aggregate supply for all sub-tokens so each sub-token supply can be independently modified.

The `transfer_policy` field is not relevant for sub-tokens and will be ignored if a value is given.

The `root_token_id` field is required and must refer to an existing root token.

The `tags` field must be non-empty and its value must be unique (when sorted) across all other sub-tokens within the same family.

As with other tokens, a user must be associated with the sub-token prior to a transfer or they must have a free auto-association slot in their account.

### CRUD Operations

#### Update

The existing `TokenUpdate` Hedera API will be used to modify a previously created root token or sub-token. The protobuf message `TokenUpdateTransactionBody` will be modified to include the following fields:

- `transfer_policy` (for root tokens)
- `default_sub_token_id` (for root tokens)
- `tags` (for sub-tokens)

```protobuf
// existing message
message TokenUpdateTransactionBody {
	// existing fields
	TokenID token = 1;
	string symbol = 2;
	string name = 3;
	AccountID treasury = 4;
	Key adminKey = 5;
	Key kycKey = 6;
	Key freezeKey = 7;
	Key wipeKey = 8;
	Key supplyKey = 9;
	AccountID autoRenewAccount = 10;
	Duration autoRenewPeriod = 11;
	Timestamp expiry = 12;
	google.protobuf.StringValue memo = 13;
	Key fee_schedule_key = 14;
	Key pause_key = 15;
	
	// new fields for root tokens
	repeated PolicyRule transfer_policy = 16;
	TokenID default_sub_token_id = 17;
	
	// new field for sub-tokens
	repeated string tags = 18;
}
```

The `default_sub_token` field specifies the sub-token to use in lieu of the root token if a transfer of the root token occurs. If the root token contains both a `default_sub_token` and a transfer policy, the final sub-token assignment may be determined by a policy rule contract if the contract modifies the transfer list. The purpose of the `default_sub_token` value is to establish a sub-token assignment if none of the policy rule contracts do.

If the transaction is updating a sub-token and the fields `transfer_policy` and `default_sub_token_id` are not empty, the values will be ignored. These fields are only relevant for root tokens.

If the transaction is updating a root token the `tags` field will be ignored.

If the transaction is updating a sub-token and the `tags` field is empty or its value is not unique (when sorted) across all other sub-tokens within the same family, the transaction will fail.

If any of the following fields are specified in the `TokenUpdateTransactionBody` message, they will be ignored:

- `treasury`
- `freezeKey`
- `wipeKey`
- `supplyKey`
- `fee_schedule_key`

#### Delete

An existing root token or sub-token can be deleted using the `TokenDelete` Hedera API. The existing protobuf message `TokenDeleteTransactionBody` will be reused for the transaction.

```protobuf
// existing message
message TokenDeleteTransactionBody {
    TokenID token = 1;
}
```

This transaction will fail if the transaction is deleting a root token and there are sub-tokens in the family. In order to delete the root token, all of its associated sub-tokens must be deleted first.

#### Get Token Info

The existing `TokenGetInfo` query API will be used to return configuration data regarding a root token or sub-token. The existing protobuf message `TokenInfo` will be modified to include the following fields:

- `transfer_policy` (for root tokens)
- `default_sub_token_id` (for root tokens)
- `tags` (for sub-tokens)

```protobuf
// existing message
message TokenInfo {
	// existing fields
	TokenID tokenId = 1;
	string name = 2;
	string symbol = 3;
	uint32 decimals = 4;
	uint64 totalSupply = 5;
	AccountID treasury = 6;
	Key adminKey = 7;
	Key kycKey = 8;
	Key freezeKey = 9;
	Key wipeKey = 10;
	Key supplyKey = 11;
	TokenFreezeStatus defaultFreezeStatus = 12;
	TokenKycStatus defaultKycStatus = 13;
	bool deleted = 14;
	AccountID autoRenewAccount = 15;
	Duration autoRenewPeriod = 16;
	Timestamp expiry = 17;
	string memo = 18;
	TokenType tokenType = 19;
	TokenSupplyType supplyType = 20;
	int64 maxSupply = 21;
	Key fee_schedule_key = 22;
	repeated CustomFee custom_fees = 23;
	Key pause_key = 24;
	TokenPauseStatus pause_status = 25;
	bytes ledger_id = 26;
	
	// new fields for root tokens
	repeated PolicyRule transfer_policy = 27;
	TokenID default_sub_token_id = 28;
	
	// new field for sub-tokens
	repeated string tags = 29;
}
```

When querying root tokens, the majority of the fields in the `TokenInfo` message will either be omitted or will contain the default empty value (that is, 0 or `false`). The affected/omitted fields are:

- `decimals` will have value 0
- `totalSupply` will have value 0
- `treasury`
- `freezeKey`
- `wipeKey`
- `supplyKey`
- `defaultFreezeStatus`
- `maxSupply` will have value 0
- `fee_schedule_key`
- `custom_fees`
- `root_token_id`
- `tags` (pertinent to sub-tokens)

When querying sub-tokens, the `transfer_policy` and `default_sub_token_id` fields will be empty.

#### Get Token Balance

The existing `CryptoGetInfo` query API will be used to retrieve balances of sub-tokens held in an account. The details of each owned sub-token will be contained in a `TokenRelationship` message. No root tokens will be returned via this API as this token type can neither be minted nor owned.

```protobuf
// existing message
message TokenRelationship {
	TokenID tokenId = 1;
	string symbol = 2;
	uint64 balance = 3;
	TokenKycStatus kycStatus = 4;
	TokenFreezeStatus freezeStatus = 5;
	uint32 decimals = 6;
	bool automatic_association = 7;
}
```

#### Get Sub-Token Balances

A new Hedera query API will be added under the Token Service called `TokenGetAccountSubTokenBalances`. This function will return all of the sub-tokens associated with the specified root token within a given account.

```protobuf
// new message
message TokenGetAccountSubTokenBalancesQuery {
	/**
	 * Standard info sent from client to node, including the signed payment, and what kind of
	 * response is requested (cost, state proof, both, or neither)
	 */
   QueryHeader header = 1;

	/**
	 * The Account for which information is requested
	 */
	AccountID account_id = 2;
	
	/**
	 * The root token of the partially fungible token family.
	 */
    TokenID root_token_id = 3;
}

// new message
message TokenGetAccountSubTokenBalancesResponse {
	/**
	 * Standard response from node to client, including the requested fields: cost, or state proof,
	 * or both, or neither
	 */
	ResponseHeader header = 1;

    /**
     * List of sub-token balances contained within the account.
     */
	repeated TokenBalance token_balances = 4;
}

// existing message
message TokenBalance {
	TokenID tokenId = 1;
	uint64 balance = 2;
	uint32 decimals = 3;
}
```

The query will fail under the following circumstances:

- The `root_token_id` does not refer to a root token.
- The `account_id` does not exist.

### Change CryptoTransfer to Support Partially Fungible Token Transfers

The existing CryptoTransfer API will be used to support the transfer of root tokens or sub-tokens. The existing protobuf message for `CryptoTransfer` will be reused with one minor change to the `TokenTransferList` message - the addition of a `policy_rule_invocation` field to store parameters required for policy rule contract execution.

```protobuf
// existing protobuf
message CryptoTransferTransactionBody {
	TransferList transfers = 1;
	repeated TokenTransferList tokenTransfers = 2;
}

// existing message
message TokenTransferList {
	// existing fields
	TokenID token = 1;
	repeated AccountAmount transfers = 2;
	repeated NftTransfer nftTransfers = 3;
	google.protobuf.UInt32Value expected_decimals = 4;
	
	// new field
	PolicyRuleInvocation policy_rule_invocation = 5;
}

// new message
message PolicyRuleInvocation {
	int64 gas = 1;
}
```

All transfers of root tokens and sub-tokens will cause the transfer policy specified on the root token to be executed. If any of the policy rule triggers evaluate to `true`, the associated rule smart contract will be executed with the gas specified in the `PolicyRuleInvocation` message being used for the contract call.

If the `TokenTransferList` references a root token in the `token` field, the root token must either be configured with a default sub-token or possess a policy rule contract that will modify the transfer list to refer solely to sub-tokens. The transfer transaction will fail if any root tokens remain in the transfer list after the transfer policy has been executed.

Excluding the possible modification of the transfer list by policy rule contracts, transfers of sub-tokens will behave the same regular fungible tokens.

The transfer transaction will fail under the following circumstances:

- The `accountID` sending and receiving the token cannot be the same address.
- The recipient account does not have an association with the token yet.
	- If the recipient account has auto-association enabled, at least one open slot must be available for the transfer to succeed.
- The recipient account has `receiverSigRequired` enabled and the recipient has not signed the transaction.
- The sender account does not have `amount` of token available.
- The transfer `amount` plus custom fixed fees will exceed the total amount of token available.
- Either the sender or recipient accounts are frozen for the specified token.
- The specified `token` is paused.
- A policy rule contract has thrown an error thereby denying the transfer.
- Insufficient gas has been specified in the `PolicyRuleInvocation` message for all of the policy rule contracts that are called.

## Backwards Compatibility

All HIPs that introduce backward incompatibilities must include a section describing these incompatibilities and their severity. The HIP must explain how the author proposes to deal with these incompatibilities. HIP submissions without a sufficient backward compatibility treatise may be rejected outright.

## Security Implications

If there are security concerns in relation to the HIP, those concerns should be explicitly addressed to make sure reviewers of the HIP are aware of them.

## Rejected Ideas

Throughout the discussion of a HIP, various ideas will be proposed which are not accepted. Those rejected ideas should be recorded along with the reasoning as to why they were rejected. This both helps record the thought process behind the final version of the HIP as well as preventing people from bringing up the same rejected idea again in subsequent discussions.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

## References

- [ERC 1410 Proposal](https://github.com/ethereum/eips/issues/1410)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
