---
hip: 17
title: HTS Non Fungible support
author: Daniel Ivanov (@Daniel-K-Ivanov)
type: Standards Track
category: Service
status: Draft
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/74
---
## Abstract

The HIP defines the changes that must be applied in order for Hedera Services to support Non-fungible tokens.

## Motivation

The growing demand and use-cases for tokenisation point out that the current HTS design does not support all of the needs of the community. In this HIP we would like to describe a set of changes that would enable non-fungible types of tokens to be issued natively on Hedera Hashgraph. Having support for such tokens will allow an extended range of applications to be built on top of HTS.

## Rationale

The following proposal is building on top of the current HTS API instead of creating a brand new NFT service. There are 2 major reasons for that:
- Developers desire the tokenization APIs to look similar for both fungible and non-fungible tokens
- Though fungible and non-fungible tokens are different, there are a lot of commonalities - admin keys, KYC, supply, mint and burn behaviours

## Specification

Based on the [IWA specification](https://github.com/InterWorkAlliance/TokenTaxonomyFramework) we can define the following combinations of fungible and non-fungible tokens:

```
 HTS
│
└─── Fungible
│   └─── Fractional ---> Currently supported by HTS
│   └─── Whole ---> Currently supported by HTS   
└─── Non-Fungible
    └─── Whole ---> Supported with the current proposal             
    └─── Fractional ---> Not supported by the proposal, though can be supported by HIP standards
    └─── Singleton ---> Supported with the current proposal
```

### Fungible

Tokens that have interchangeable value with one another, where any quantity of them has the same value as another equal quantity if they are in the same class or series.

#### Fractional
Describes a token that can be divided into smaller fractions, represented as decimals. The current version of HTS supports these types of tokens. They can be implicitly defined and created by setting `decimals != 0`. 

#### Whole
Describes a token that cannot be divided into smaller fractions. Meaning that subdivision is not allowed - just whole number quantities. Current version of HTS supports these types of tokens. They can be implicitly defined and created by setting `decimals=0`.

### Non-fungible
The NFT type is not interchangeable with other tokens of the same type as they typically have different values. 

#### Whole
Each instance of a token in the class can share some property values with other tokens in the class and have distincly unique values between them. They cannot be divided into smaller fractions, represented as decimals. Whole NFTs can be created by defining the `tokenType` as `NON_FUNGIBLE` and executing `Mint` operation on the Token.

#### Fractional
Similar to `Whole`, in terms that each instance of a token in the class can share some property values with other tokens in the class and have distincly unique values between them, but unlike `Whole`, they CAN be divided into smaller fractions.

The proposed specification does not support Fractional NFTs natively. They can be supported using the [Hybrid](#Hybrid-Tokens) approach.

#### Singleton
There can only be one instance in the deployed token class and that instance is indivisible. Useful when there is an asset or object to be tokenized that shares no properties or values with any other object. Singleton NFTs can be created by defining the `tokenType` as `NON_FUNGIBLE`, setting `maxSupply=1` and executing `Mint` operation on the token.

### Hybrid Tokens

TODO

### Explicit vs Implicit definition
There are 2 approaches available when it comes to the HTS API and the configuration of the Token. 
1. **Explicit**
	The [IWA specification](https://github.com/InterWorkAlliance/TokenTaxonomyFramework)  uses an explicit approach when it comes to defining the different types of tokens. This can be seen by the `Token Type (Fungible/Non-Fungible)`, `Token Unit(Fractional, Whole or Singleton)`, `Value  Type(Intrinsic or Reference)` or `Supply(Fixed, Capped-Variable, Gated or Infinite)` categories.
2. **Impllcit**
	It is fair to say that some of the described properties above are not necessary to be explicitly defined, f.e instead for HAPI to request both `Supply` and `maxSupply` to be set, HAPI can implicitly derive the types of the supported tokens based on the arguments passed.

The proposed solution uses a hybrid approach, meaning that only the required properties categorising the Tokens are added as enums (example `Token Type`) and the rest of the configuration is derived implicitly from the provided variables.

The following matrix provides information on the mapping between token types/properties and the corresponding configuration:



**Fungible Token Matrix**

|                     	| Fractional, Fixed             	| Fractional, Capped-Variable              	| Fractional, Infinite                     	| Whole, Fixed                  	| Whole, Capped-Variable                   	| Whole, Infinite                          	|
|---------------------	|-------------------------------	|------------------------------------------	|------------------------------------------	|-------------------------------	|------------------------------------------	|------------------------------------------	|
| **tokenType**           	| FUNGIBLE                      	| FUNGIBLE                                 	| FUNGIBLE                                 	| FUNGIBLE                      	| FUNGIBLE                                 	| FUNGIBLE                                 	|
| **decimals**            	| decimals != 0                 	| decimals != 0                            	| decimals != 0                            	| 0                  	| 0                             	| 0                             	|
| **maxSupply**           	| N                   	| N                              	| UINT64_MAX_VALUE               	| N                   	| N                              	| UINT64_MAX_VALUE               	|
| **initialSupply**       	| N               	| x, where x <= N 	| x, where x <= N 	| N               	| x, where x <= N 	| x, where x <= N 	|
| **supplyKey & wipeKey** 	| supplyKey=null & wipeKey=null 	| supplyKey=* & wipeKey=*                  	| supplyKey=* & wipeKey=*                  	| supplyKey=null & wipeKey=null 	| supplyKey=* & wipeKey=*                  	| supplyKey=* & wipeKey=*                  	|


**Non-fungible Token Matrix****
|                     	| Whole, Fixed* 	| Whole, Capped-Variable      	| Whole, Infinite             	| Singleton**                 	|
|---------------------	|---------------	|-----------------------------	|-----------------------------	|-----------------------------	|
| **tokenType**           	| NON_FUNGIBLE  	| NON_FUNGIBLE                	| NON_FUNGIBLE                	| NON_FUNGIBLE                	|
| **decimals**            	| N/A           	| 0                           	| 0                           	| 0                           	|
| **maxSupply**           	| N/A           	| n                           	| UINT64_MAX_VALUE            	| 1                           	|
| **initialSupply**       	| N/A           	| 0                           	| 0                           	| 0                           	|
| **supplyKey & wipeKey** 	| N/A           	| supplyKey!=null & wipeKey=* 	| supplyKey!=null & wipeKey=* 	| supplyKey!=null & wipeKey=* 	|

*Non-fungible tokens cannot have `Fixed` supply since the creation of  `N` number of NFTs will not be supported in version 1. `initialSupply` must always be `0` for tokens of type `NON_FUNGIBLE`

**Fixed/Capped-Variable or Infinite are invalid properties for NFT of type Singleton

***The proposal does not support Fractional NFTs

## HAPI Changes

### Legend

```diff
+ Green represents new property/message added
! Orange represents modified property/message
```

### TokenService
The current proposal requires the addition of 3 new RPC endpoints to the existing `HTS` service - `getNftInfo`, `getTokenNftInfo` and `getAccountNftInfo`

Other than adding new `rpc` calls the following, already existing, operations must be modified: `createToken`, `mintToken`, `burnToken`, `wipeTokenAccount`, `getTokenInfo`

```diff
service TokenService {
   // Creates a new Token by submitting the transaction
   rpc createToken (Transaction) returns (TransactionResponse);
   // Updates the account by submitting the transaction
   rpc updateToken (Transaction) returns (TransactionResponse);
   // Mints an amount of the token to the defined treasury account
   rpc mintToken (Transaction) returns (TransactionResponse);
   // Burns an amount of the token from the defined treasury account
   rpc burnToken (Transaction) returns (TransactionResponse);
   // Deletes a Token
   rpc deleteToken (Transaction) returns (TransactionResponse);
   // Wipes the provided amount of tokens from the specified Account ID
   rpc wipeTokenAccount (Transaction) returns (TransactionResponse);
   // Freezes the transfer of tokens to or from the specified Account ID
   rpc freezeTokenAccount (Transaction) returns (TransactionResponse);
   // Unfreezes the transfer of tokens to or from the specified Account ID
   rpc unfreezeTokenAccount (Transaction) returns (TransactionResponse);
   // Flags the provided Account ID as having gone through KYC
   rpc grantKycToTokenAccount (Transaction) returns (TransactionResponse);
   // Removes the KYC flag of the provided Account ID
   rpc revokeKycFromTokenAccount (Transaction) returns (TransactionResponse);
   // Associates tokens to an account
   rpc associateTokens (Transaction) returns (TransactionResponse);
   // Dissociates tokens from an account
   rpc dissociateTokens (Transaction) returns (TransactionResponse);
   // Retrieves the metadata of a token
   rpc getTokenInfo (Query) returns (Response);
+  // gets info on a NFT by TokenID (of type NON_FUNGIBLE) and serial number
+  rpc getNftInfo (Query) returns (Response);
+  // Gets info on NFTs N through M on the list of NFTs associated with a given Token of type NON_FUNGIBLE
+  rpc getTokenNftInfo (Query) returns (Response);
+  // Gets info on NFTs N through M on the list of NFTs associated with a given account
+  rpc getAccountNftInfo (Query) returns (Response);
}
```

### TokenCreateTransactionBody

- By default, already existing tokens will be of type `FUNGIBLE` (backwards compatible)
- By default, if `maxSupply` is not provided, the token will be defined as having `Infinite` supply. (backwards compatible)

```diff
+//Fungible or Non-Fungible Token Base. Cannot be updated using admin key
+enum TokenType {
+	FUNGIBLE = 0;
+	NON_FUNGIBLE = 1;
+}

message TokenCreateTransactionBody {
+	TokenType tokenType = 1; // IWA compatibility. Specifies fungible or not
	string name = 2; // The publicly visible name of the token, limited to a UTF-8 encoding of length <tt>tokens.maxSymbolUtf8Bytes</tt>.
   	string symbol = 3; // The publicly visible token symbol, limited to a UTF-8 encoding of length <tt>tokens.maxTokenNameUtf8Bytes</tt>
!	uint32 decimals = 4; // For tokens of type FUNGIBLE - the number of decimal places a token is divisible by. For tokens of type NON_FUNGIBLE - value must be 0. 
+	uint64 maxSupply = 5; // IWA Compatibility. For tokens of type FUNGIBLE - the maximum number of tokens that can be in circulation. For tokens of type NON_FUNGIBLE - the maximum number of NFTs (serial numbers) that can be minted. This field can never be changed!
!	uint64 initialSupply = 6; // Specifies the initial supply of tokens to be put in circulation. The initial supply is sent to the Treasury Account. The supply is in the lowest denomination possible. In the case for NON_FUNGIBLE Type the value must be 0
!   	AccountID treasury = 7; // The account which will act as a treasury for the token. This account will receive the specified initial supply or the newly minted NFTs in the case for NON_FUNGIBLE Type
	Key adminKey = 8; // The key which can perform update/delete operations on the token. If empty, the token can be perceived as immutable (not being able to be updated/deleted)
   	Key kycKey = 9; // The key which can grant or revoke KYC of an account for the token's transactions. If empty, KYC is not required, and KYC grant or revoke operations are not possible.
   	Key freezeKey = 10; // The key which can sign to freeze or unfreeze an account for token transactions. If empty, freezing is not possible
   	Key wipeKey = 11; // The key which can wipe the token balance of an account. If empty, wipe is not possible
   	Key supplyKey = 12; // The key which can change the supply of a token. The key is used to sign Token Mint/Burn operations
   	bool freezeDefault = 13; // The default Freeze status (frozen or unfrozen) of Hedera accounts relative to this token. If true, an account must be unfrozen before it can receive the token
	Timestamp expiry = 14; // The epoch second at which the token should expire; if an auto-renew account and period are specified, this is coerced to the current epoch second plus the autoRenewPeriod
   	AccountID autoRenewAccount = 15; // An account which will be automatically charged to renew the token's expiration, at autoRenewPeriod interval
   	Duration autoRenewPeriod = 16; // The interval at which the auto-renew account will be charged to extend the token's expiry
   	string memo = 17; // The memo associated with the token (UTF-8 encoding max 100 bytes)
}
```

### TokenAssociateTransactionBody 

```diff
message TokenAssociateTransactionBody {
    AccountID account = 1; // The account to be associated with the provided tokens
!   repeated TokenID tokens = 2; // The tokens to be associated with the provided account. In the case of NON_FUNGIBLE Type, once an account is associated, it can hold any number of NFTs (serial numbers) of that token type.
}
```
### TokenMintTransactionBody

The property `amount` is to be deprecated and instead a new message `AmountOrMemo` to be used.

**Pros**
- Explicit definiton - using the `oneof` structure, clients can explicitly differenciate between the 2 types of minting operations

**Cons**
 - Breaking change

Once created, an NFT instance cannot be updated, only transferred/wiped or burned.
```diff
+message AmountOrMemo {
+	oneof {
+		uint64 amount = 1; // Applicable to tokens of type FUNGIBLE. The amount to mint to the Treasury Account. Amount must be a positive non-zero number represented in the lowest denomination of the token. The new supply must be lower than 2^63
+   		string memo = 2; // Applicable to tokens of type NON_FUNGIBLE. The metadata for the given NFT instance that is being created
+	}
+}

message TokenMintTransactionBody {
    TokenID token = 1; // The token for which to mint tokens. If token does not exist, transaction results in INVALID_TOKEN_ID
!   uint64 amount = 2; [deprecated=true] // The amount to mint to the Treasury Account. Amount must be a positive non-zero number represented in the lowest denomination of the token. The new supply must be lower than 2^63.
+   AmountOrMemo amountOrMemo = 3;
}

```

### TransactionReceipt
The transaction receipt is to be updated with a new field `serialNumber` used to represent the newly created NFT instance.

```diff
message TransactionReceipt {
    // The consensus status of the transaction; is UNKNOWN if consensus has not been reached, or if the
    // associated transaction did not have a valid payer signature
    ResponseCodeEnum status = 1;
    // In the receipt of a CryptoCreate, the id of the newly created account
    AccountID accountID = 2;
    // In the receipt of a FileCreate, the id of the newly created file
    FileID fileID = 3;
    // In the receipt of a ContractCreate, the id of the newly created contract
    ContractID contractID = 4;
    // The exchange rates in effect when the transaction reached consensus
    ExchangeRateSet exchangeRate = 5;
    // In the receipt of a ConsensusCreateTopic, the id of the newly created topic.
    TopicID topicID = 6;
    // In the receipt of a ConsensusSubmitMessage, the new sequence number of the topic that received the message
    uint64 topicSequenceNumber = 7;
    bytes topicRunningHash = 8;
    // In the receipt of a ConsensusSubmitMessage, the version of the SHA-384 digest used to update the running hash.
    uint64 topicRunningHashVersion = 9;
    // In the receipt of a CreateToken, the id of the newly created token
    TokenID tokenID = 10;
    // In the receipt of TokenMint, TokenWipe, TokenBurn, the current total supply of this token
    uint64 newTotalSupply = 11;
    // In the receipt of a ScheduleCreate, the id of the newly created Scheduled Entity
    ScheduleID scheduleID = 12;
    // In the receipt of a ScheduleCreate or ScheduleSign that resolves to SUCCESS, the TransactionID that should be used to query for the receipt or record of the relevant scheduled transaction
    TransactionID scheduledTransactionID = 13;
+   // In the receipt of a TokenMintTransactionBody, the serial number of the newly created NFT
+   uint64 serialNumber = 14;     
}
```

### TokenBurnTransactionBody
The property `amount` is to be deprecated and instead a new message `AmountOrSerialNumbers` to be used.

**Pros**
- Explicit definiton - using the `oneof` structure, clients can explicitly differenciate between the 2 types of burn operations

**Cons**
 - Breaking change

All serial numbers specified must be owned by the Treasury account in order for them to be burned successfully.
```diff
+message AmountOrSerialNumbers {
+	oneof {
+		uint64 amount = 1; //Applicable to tokens of type FUNGIBLE. Amount of fungible tokens to burn/wipe
+		repeated uint64 serialNumbers=2; //Applicable to tokens of type NON_FUNGIBLE. The list of serial numbers to be burned/wiped.
+	}
+}

message TokenBurnTransactionBody {
	TokenID token = 1; // The token for which to burn tokens. If token does not exist, transaction results in INVALID_TOKEN_ID
!	uint64 amount = 2; [deprecated=true] // The amount to burn from the Treasury Account. Amount must be a positive non-zero number, not bigger than the token balance of the treasury account (0; balance], represented in the lowest denomination.
+	AmountOrSerialNumbers amountOrSerialNumbers= 3; // Defines the amount or list of serial numbers to be burned
}
```

### TokenWipeAccountTransactionBody
The property `amount` is to be deprecated and instead a new message `AmountOrSerialNumbers` to be used. 

**Pros**
- Explicit definiton - using the `oneof` structure, clients can explicitly differenciate between the 2 types of wipe operations

**Cons**
 - It is a breaking change

All serial numbers specified must NOT be owned by the Treasury account in order for them to be wiped successfully.
```diff
message TokenWipeAccountTransactionBody {
	TokenID token = 1; // The token for which the account will be wiped. If token does not exist, transaction results in INVALID_TOKEN_ID
	AccountID account = 2; // The account to be wiped
!	uint64 amount = 3; [deprecated=true] // The amount of tokens to wipe from the specified account. Amount must be a positive non-zero number in the lowest denomination possible, not bigger than the token balance of the account (0; balance]
+	AmountOrSerialNumbers amountOrSerialNumbers= 3; // Defines the amount or list of serial numbers to be wiped
}

```

### TokenInfo
New `tokenType` and `maxSupply` fields to be added in the `TokenInfo` query. 

```diff
message TokenInfo {
+  TokenType tokenType = 1; // IWA compatibility. Specifies fungible or not
   TokenID tokenId = 2; // ID of the token instance
   string name = 3; // The name of the token. It is a string of ASCII only characters
   string symbol = 4; // The symbol of the token. It is a UTF-8 capitalized alphabetical string
!  uint32 decimals = 5; // The number of decimal places a token is divisible by. Always 0 for tokens of type NON_FUNGIBLE. This field can never be changed! 
+  uint64 maxSupply = 6; // For tokens of type FUNGIBLE - The Maximum number of fungible tokens that can be in circulation. For tokens of type NON_FUNGIBLE - the maximum number of NFTs (serial numbers) that can be in circulation. This field can never be changed! 
!  uint64 totalSupply = 7; // For tokens of type FUNGIBLE - the total supply of tokens that are currently in circulation. For tokens of type NON_FUNGIBLE - the number of NFTs created of this token instance
   AccountID treasury = 8; // The ID of the account which is set as Treasury
   Key adminKey = 9; // The key which can perform update/delete operations on the token. If empty, the token can be perceived as immutable (not being able to be updated/deleted)
   Key kycKey = 10; // The key which can grant or revoke KYC of an account for the token's transactions. If empty, KYC is not required, and KYC grant or revoke operations are not possible.
   Key freezeKey = 11; // The key which can freeze or unfreeze an account for token transactions. If empty, freezing is not possible
   Key wipeKey = 12; // The key which can wipe the token balance of an account. If empty, wipe is not possible
   Key supplyKey = 13; // The key which can change the supply of a token. The key is used to sign Token Mint/Burn operations
   TokenFreezeStatus defaultFreezeStatus = 14; // The default Freeze status (not applicable, frozen or unfrozen) of Hedera accounts relative to this token. FreezeNotApplicable is returned if Token Freeze Key is empty. Frozen is returned if Token Freeze Key is set and defaultFreeze is set to true. Unfrozen is returned if Token Freeze Key is set and defaultFreeze is set to false
   TokenKycStatus defaultKycStatus = 15; // The default KYC status (KycNotApplicable or Revoked) of Hedera accounts relative to this token. KycNotApplicable is returned if KYC key is not set, otherwise Revoked
   bool deleted = 16; // Specifies whether the token was deleted or not
   AccountID autoRenewAccount = 17; // An account which will be automatically charged to renew the token's expiration, at autoRenewPeriod interval
   Duration autoRenewPeriod = 18; // The interval at which the auto-renew account will be charged to extend the token's expiry
   Timestamp expiry = 19; // The epoch second at which the token will expire
   string memo = 20; // The memo associated with the token
}

```

### TokenTransferList

**Rationale**

With the current proposal, HTS API is being extended to support `NON_FUNGIBLE` types of tokens. All of the changes to the HAPI are being contained under the HTS service. Transfers in the HAPI are unified, meaning that there is only 1 `CryptoTransferTransactionBody` that is used to represent both `hbar` and HTS token transfers. The proposed solution keeps the consistency of containing the changes under the HTS specific API by extending the `TokenTransferList` with new type of transfer - Non fungible token transfer

The change is backwards compatible due to the usage of `oneof`.

The major difference between `FUNGIBLE` and `NON_FUNGIBLE` transfers is the representation type.  As per the [IWA specifciation](https://github.com/InterWorkAlliance/TokenTaxonomyFramework/blob/main/token-taxonomy.md#representation-type), we can distinguish 2 types of representations - `common` and `unique`. `AccountAmount` message type uses the `common` representation type and `NftTransfer` uses the `unique` representation type.

```diff
message CryptoTransferTransactionBody {
   TransferList transfers = 1;
   repeated TokenTransferList tokenTransfers = 2;
}

+message NftTransfer {  
+   AccountID fromAccount = 1;  // Sending account
+   AccountID toAccount = 2;  // Receiving account
+   uint64 serialNo = 3;  // Serial number that is being transferred
+}

/* A list of token IDs and amounts representing the transferred out (negative) or into (positive) amounts, represented in the lowest denomination of the token */
message TokenTransferList {
    TokenID token = 1; // The ID of the token
+   oneof {
!	repeated AccountAmount transfers = 2; // Applicable to tokens of type FUNGIBLE. Multiple list of AccountAmounts, each of which has an account and amount
+	repeated NftTransfer nftTransfers = 3; // Applicable to tokens of type NON_FUNGIBLE
+   }
}
```

### CryptoGetInfoResponse

```diff
/* Response when the client sends the node CryptoGetInfoQuery */
message CryptoGetInfoResponse {
    ResponseHeader header = 1; //Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither
    message AccountInfo {
        AccountID accountID = 1; // The account ID for which this information applies
        string contractAccountID = 2; // The Contract Account ID comprising of both the contract instance and the cryptocurrency account owned by the contract instance, in the format used by Solidity
        bool deleted = 3; // If true, then this account has been deleted, it will disappear when it expires, and all transactions for it will fail except the transaction to extend its expiration date
        AccountID proxyAccountID = 4; // The Account ID of the account to which this is proxy staked. If proxyAccountID is null, or is an invalid account, or is an account that isn't a node, then this account is automatically proxy staked to a node chosen by the network, but without earning payments. If the proxyAccountID account refuses to accept proxy staking , or if it is not currently running a node, then it will behave as if proxyAccountID was null.
        int64 proxyReceived = 6; // The total number of tinybars proxy staked to this account
        Key key = 7; // The key for the account, which must sign in order to transfer out, or to modify the account in any way other than extending its expiration date.
        uint64 balance = 8; // The current balance of account in tinybars
        // [Deprecated]. The threshold amount, in tinybars, at which a record is created of any transaction that decreases the balance of this account by more than the threshold
        uint64 generateSendRecordThreshold = 9 [deprecated=true];
        // [Deprecated]. The threshold amount, in tinybars, at which a record is created of any transaction that increases the balance of this account by more than the threshold
        uint64 generateReceiveRecordThreshold = 10 [deprecated=true];
        bool receiverSigRequired = 11; // If true, no transaction can transfer to this account unless signed by this account's key
        Timestamp expirationTime = 12; // The TimeStamp time at which this account is set to expire
        Duration autoRenewPeriod = 13; // The duration for expiration time will extend every this many seconds. If there are insufficient funds, then it extends as long as possible. If it is empty when it expires, then it is deleted.
        repeated LiveHash liveHashes = 14; // All of the livehashes attached to the account (each of which is a hash along with the keys that authorized it and can delete it)
        repeated TokenRelationship tokenRelationships = 15; // All tokens related to this account
        string memo = 16; // The memo associated with the account
+	uint64 ownedNFTs = 17; // The number of NFTs that are owned by this account
    }
    AccountInfo accountInfo = 2; // Info about the account (a state proof can be generated for this)
}
```

### TokenRelationship

```diff
/* Token's information related to the given Account */
message TokenRelationship {
    TokenID tokenId = 1; // The ID of the token
    string symbol = 2; // The Symbol of the token
!   uint64 balance = 3; // For token of type FUNGIBLE - the balance that the Account holds in the smallest denomination. For token of type NON_FUNGIBLE - the number of NFTs held by the account
    TokenKycStatus kycStatus = 4; // The KYC status of the account (KycNotApplicable, Granted or Revoked). If the token does not have KYC key, KycNotApplicable is returned
    TokenFreezeStatus freezeStatus = 5; // The Freeze status of the account (FreezeNotApplicable, Frozen or Unfrozen). If the token does not have Freeze key, FreezeNotApplicable is returned
!   uint32 decimals = 6; // The number of decimal places a token is divisible by. Always 0 for tokens of type NON_FUNGIBLE
}
```

### GetNftInfo
The following messages must be added in order to support the new `GetNftInfo` rpc call added to `HTS`.

```diff
+/* Applicable only to tokens of type NON_FUNGIBLE. Gets info on a NFT for a given TokenID (of type NON_FUNGIBLE) and serial number */
+message GetNftInfoQuery {
+    QueryHeader header = 1; // Standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither).
+    TokenID tokenId = 2; // The ID of the token for which information is requested
+    uint64 serialNumber = 3; // The serial number for the NFT for which information is requested
+}

+message NftInfo {
+    uint64 serialNumber = 1; // the serial number of the NFT
+    AccountID owner = 2; // The current owner of the NFT
+    Timestamp creationTime = 3; // The effective consensus timestamp at which the NFT was minted
+    string memo = 4; // Represents the unique metadata for a given NFT instance
+}

+message GetNftInfoResponse {
+    ResponseHeader header = 1; // Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither
+    TokenID tokenId = 2; // The Token with type NON_FUNGIBLE that this record is for
+    NftInfo nft = 3; // The NFT that his record is for
+}
```

### GetTokenNftInfo
The following messages must be added in order to support the new `GetTokenNftInfo` rpc call added to `HTS`.

Global dynamic variable must be added in the node configuring the maximum value of `maxQueryRange`. Requests must meet the following requirement: `end-start<=maxQueryRange`

```diff
+/* Applicable only to tokens of type NON_FUNGIBLE. Gets info on NFTs N through M on the list of NFTs associated with a given NON_FUNGIBLE Token */
+message GetTokenNftInfoQuery {
+    QueryHeader header = 1; // Standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither).
+    TokenID tokenId = 2; // The ID of the token for which information is requested
+    uint64 start = 3; // Specifies the start (including) of the range of NFTs to query for. Value must be in the range (0; totalSupply]
+    uint64 end = 4; // Specifies the end (including) of the range of NFTs to query for. Value must be in the range [start; totalSupply]
+}

+message GetTokenNftInfoResponse {
+    ResponseHeader header = 1; // Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither
+    TokenID tokenId = 2; // The Token with type NON_FUNGIBLE that this record is for
+    repeated NftInfo nfts = 3; // List of NFTs associated to the specified token
+}
```

### GetAccountNftInfo
The following messages must be added in order to support the new `GetAccountNftInfo` rpc call added to `HTS`.

Global dynamic variable must be added in the node configuring the maximum value of `maxQueryRange`. Requests must meet the following requirement: `end-start<=maxQueryRange`

`ownedNFTs` is the number of NFTs that the specified account owns. The value can be retrieved from the `CryptoGetInfo` query.

```diff
+/* Applicable only to tokens of type NON_FUNGIBLE. Gets info on NFTs N through M owned by the specified accountId */
+message GetAccountNftInfoQuery {
+    QueryHeader header = 1; // Standard info sent from client to node, including the signed payment, and what kind of response is requested (cost, state proof, both, or neither).
+    AccountID accountId = 2; // The Account for which information is requested
+    uint64 start = 3; // Specifies the start (including) of the range of NFTs to query for. Value must be in the range (0; ownedNFTs]
+    uint64 end = 4; // Specifies the end (including) of the range of NFTs to query for. Value must be in the range [start; ownedNFTs]
+}

+message NftOwnedInfo {
+    TokenID tokenId = 1; // The ID of the token
+    uint serialNumber = 2; // The serial number of the NFT
+    Timestamp creationTime = 3; // The effective consensus timestamp at which the NFT was minted
+    string memo = 4; // Represents the unique metadata for a given NFT instance
+}

+message GetAccountNftInfoResponse {
+    ResponseHeader header = 1; // Standard response from node to client, including the requested fields: cost, or state proof, or both, or neither
+    AccountID accountId = 2; // The Account that this record is for
+    repeated NftOwnedInfo nfts = 3; // List of NFTs associated to the account
+}
```


## Backwards Compatibility

There are several implications for already existing HTS integrations. Due to the significant changes in the HAPI the following operations are not backwards compatible:

- [Mint](#TokenMintTransactionBody)
- [Burn](#TokenBurnTransactionBody)
- [Wipe](#TokenWipeAccountTransactionBody)

## Security Implicattions

### Fees

The existing fee schedule must be updated to support two separate fee schedule definitions for the same operation depending on the type of the Token. The current fee schedule for the HTS operations will be preserved for tokens of type `FUNGIBLE` and new fee schedule will be added for tokens of type `NON_FUNGIBLE` that will define the costs for executing operations on `NON_FUNGIBLE` token types.

### Throttling

One trade off that must be clarified is that by extending HTS with `NON_FUNGIBLE` support its impossible to throttle the operations separately. All HTS related operations (independent on the token type) will be using one throttling configuration and it will be applied for both token types.

## How to Teach This

The Hedera documentation is to be updated with the new version of HTS once implemented. Blog posts and guides can be written and distributed in the social media channels for educating the community on the new functionality.

## Reference implementation

Reference implementation for the protobuf will be implemented once the HAPI is finalised and approved

## Rejected Ideas

No rejected ideas so far

## Open Issues

TODO

## References

- [IWA Specification](https://github.com/InterWorkAlliance/TokenTaxonomyFramework/blob/main/token-taxonomy.md)

## Copyright
This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
