---
hip: <HIP number (this is determined by the HIP editor)>
title: Account Virtual Addresses
author: Nana Essilfie-Conduah <@nana-ec>
working-group: Danno Ferrin <@shemnon>, Richard Bair <@rbair23> , Michael Tinker <@tinker-michaelj>, Ashe Oro <@ashe-oro>, Greg Scullard <greg.scullard@hedera.com>, Luke Lee  <@lukelee-sl>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-11-28
discussions-to: 
updated: 
requires: 583
replaces: 
superseded-by: 
---

## Abstract

The Hedera Smart Contract Service (HSCS) processes EVM aimed transactions in a fast and cheap manner, with logic that is equivalent to Ethereum utiliing theesu EVM client. 

The ledger does this while maintaining and advancing Hedera API (HAPI) transactions that provide native support for Account, Contract, File, Topic, Token and Schedule entities.

This inadvertently presents multiple points of Hedera vs Ethereum design choices that have occasionally reduced user experience and resulted in complicated scenarios.

For easy reference new and clarifying terms are listed here

- `ETH contracts`: Contracts lifted from Ethereum or other EVM compatible ledgers in which a maintainer does not desire to change code in porting and or explicitly wants to use precompile contracto operations such as `ECRECOVER`.

- `Hedera contracts`: Smart Contracts designed with additional logic to utilize Hedera system smart contracts.

- `Hedera address` - Also known as the `long-zero` address (as noted in [HIP 583](https://hips.hedera.com/hip/hip-583)) account identifier, this is the result of encoding the `<shard>.<relam>.<num>` integer values into a 20 bytes hex format to be conformant with ECDSA public addresses. This is a more explicit naming for exposure in products that highlights the essence of the address.

- Alias - An account alias can be an `ECDSA`/`ED25519` public key (per HIP 32). Notably, in the past the alias was sometimes used to refer to an `ECDSA` public address, however, it should solely refer to a public key. 

- Virtual Addresses: a list of ECDSA public addresses that are stored on the account entity and serve as the account identifier on the EVM for transactions.

Most of the challenges experienced to date around account interactions with smart contracts on the EVM can be summarized into 4 points.

1. **Account type compatibility**: All Hedera accounts are not equally EVM compatible. Currently only accounts with an `ECDSA` public key and an `ECDSA` alias are fully EVM compatible. This is due to the underlying `ECDSA` signature type which allows for EVM account address identifier (public address - as noted in [HIP 583](https://hips.hedera.com/hip/hip-583)) calculation. This negatively affects smart contract adoption for all other account types and results in EVM experience inconsistencies.
2. **Account identifier mismatches**: EVM addresses currently differ for accounts with and without an ECDSA public key alias. Accounts with an `ECDSA` public key alias will have a public address when interacting with the EVM. Accounts without an `ECDSA` public key alias will have their Hedera address used. In both cases the address is potentially stored in the contract state and utilized for future operation matching. 
3. **Potential feature and asset** **loss**: An account created with a ECDSA public key that has a corresponding public key alias where the account public key (tied to a cryptographic signing key) rotates no longer conforms to the EVM signature assumptions. That is smart contracts that extract the public address from the transaction signature will not be able to confirm that the sender address matches the extracted public address - this is the `ECRECOVER` precompile flow. This may result in loss of smart contract balance and permissions as smart contracts may no longer behave as expected.
4. **Complicated flows**: Education around the current EVM address possibilities is confusing and sometimes relies on uninformed users adopting complex technical solutions. This spans from the fundamental ethos difference where Ethereum holds that `Account ⇒ ECDSA public key ⇒ evmAddress` with a focus on `evmAddress`, whereas Hedera notes that Accounts contain a public key and an `evmAddress` with a focus on the Account.

The above has contributed to complicated Smart Contract considerations and slow adoption. 

This HIP proposes a way to rationalize a Hedera account with its features and identifiers together with standard EVM features and account identifiers. This presents a step towards EVM equivalence over EVM compatibility.

## Motivation

We want all accounts to be fully Smart Contract and EVM compatible without sacrificing Hedera feature functionality. 

Users familiar with EVMs should be able to maintain their standard EVM expectations (EVM equivalence) but be presented with additional possibilities unique to the Hedera network.

This should be with no little to no overhead for users, minimal efforts to devs and with no possibility of loss of assets in any migrations.

## Rationale

Fundamentally it holds true in Hedera that an account encompasses amongst other values an account identifier `shard.realm.num` (dictated by the next available entity counter), a modifiable cryptographic public signing key and an optional static public key account identifier i.e. alias or a temporary public address for Hollow accounts (as noted in [HIP 583](https://hips.hedera.com/hip/hip-583)).
This is contrary to the EVM view where an account encompasses an account identifier which is a derivative of its static cryptographic public signing key i.e. public address (as noted in [HIP 583](https://hips.hedera.com/hip/hip-583)). Here, it is not possible to dissociate an account from its public key as you can in Hedera. 

This has made it challenging when a Hedera account needs to be represented on the EVM or when an EVM feature that relies on the public key to account identifier mapping needs to be honored by the Hedera network. The alias concept from [HIP 32](https://hips.hedera.com/hip/hip-32) was modified to help alleviate this issue by providing a source for the EVM address an account would adopt on EVM transactions. However, this had its limitations as it was not originally intended to encompass EVM address logic which is fundamentally based on `ECDSA` keys and calculations on accounts state, not the next available entity identifier.

In exploration of the problems, the goal became to appropriately design a concept that encompassed both identification but also the cryptography requirement of `ECDSA` keys that is engrained in the `EVM` as defined by the Ethereum Yellow paper. For EVM equivalence, an account requires the ability to be identified in advance based on an `ECDSA` public key derived public address, and the ability to sign transactions submitted with that `ECDSA` key.
However, Hedera has provided a broader vision which allows pre-identification for both simple `ED25519` and `ECDSA` key types and allows for signing with simple or complex signatures natively.

It was also noted that due to Hedera's support of key rotation and multiple keys, enterprises and security minded users would not want to give up this ability solely to gain full EVM compatibility.

**Thus, the proposed solution is to allow an account to contain 1 or more `evmAddress` values for ECDSA keys it owns that dictate how an account appears on the EVM. These addresses will be known as Virtual Addresses.**

These `evmAddress` values map to `ECDSA` key pairs a user must prove ownership of. Ownership is proved by having the ECDSA private key sign the transaction that adds the ECDSA public key to the account. This dissociates the notion of Account entity, public key and public address to allow for a clear separation of concern between Ethereum and Hedera styled development and user experiences.

Whereas before an accounts alias dictated its EVM address but also limited its key rotation options, now EVM address specification is governed by a Virtual Address, removing the weariness around key rotation. This separates account identification logic allowing the preservation of EVM assumptions whiles allowing users to still capitalize on added Hedera features.

![Account Evm Address](../assets/hip-0000/account-evm-address.png)

The above diagram illustrates the current form in which public keys and aliases are tightly nit, vs the suggested form where keys remain the signing permission authority but Virtual Addresses (not tied to the alias) provide the value for a transactions EVM address. Users will utilize existing transactions to create and update accounts by adding or updating Virtual Addresses.

## User stories

1. As a user with non `ECDSA` keys invoking smart contracts I want my public address to have a predictable value represented on the `EVM`.
2. As a user with `ECDSA` keys invoking smart contracts regardless of alias value I want my public address to have a predictable representation on the EVM as I would on Ethereum.
3. As an existing user with `ECDSA` keys  but no alias  I want to gain compatibility with smart contracts utilizing `ECRECOVER` as I would be on Ethereum.
4. As an existing user without an `ECDSA` alias I want to interact with smart contracts that utilize `ECRECOVER` whiles still maintaining my existing key for signing.
5. As an existing user I want to utilize Hedera key rotation functionality without losing compatibility with `ECRECOVER` or changing the Ethereum public address viewed by the `EVM`.
6. As a user I want to be able to control the value of the public address the `EVM` will observe based on the `ECDSA` key pairs I own.
7. As a Hedera user, I want to add multiple EVM addresses to my existing account without needing to create a new Hedera account every time.
  
## Specification

To resolve the issue of account EVM compatibility and identification the proposal is to add a list of Virtual Addresses to a Hedera account that are responsible for `EVM` address logic.

To achieve this

1. Hedera accounts can have a list of `evmAddress` values known as “Virtual Address” which govern the address the EVM observes for a given account transaction.
2. The Hedera network will validate ownership by extracting the public key from the signature and comparing the calculated public address to the `evmAddress` passed in on addition of an address and will maintain an  `evmAddress` → `accountId` map there after.
3. Hedera Accounts can add and remove virtual address entries as desired.
4. The address seen by the EVM per transaction is either the default Hedera address or a verified virtual address.
5. Users with a simple `ECDSA` key will be migrated to accounts with a single virtual address 
6. Developers can utilize `HAPI` to specify EVM address overrides and retrieve account virtual address information.
7. Users with `non-simple-ECDSA` keys can utilize any `evmAddress` matching `ECDSA` key in their wallets when interacting with smart contracts to be `ECRECOVER` compatible. In some cases they may be able to authorize transaction submission.
8. Users can optionally update their simple account key structure to support signing of transactions  using the matching ECDSA key pair that maps to an `evmAddress` added
9. Contract accounts may utilize the `evmAddress` to store their address in accordance with `CREATE` and `CREATE2` EVM operations

![Transaction EVM Address Resolution](../assets/hip-0000/transaction-evm-address-resolution.png)

The above diagram illustrates how an account may be created/updated to contain virtual address and how these will be considered at transaction time when a node determines what account may be used for an EVM call.

Step 1: Alice submits a CryptoCreate or CryptoTransfer transaction specifying the public address of her ECDSA key pair and signing the transaction with her ECDSA private key. The common result in both cases is that the network creates a new account with an assigned AccountId and a single virtual address.

Step 2: Alice may submit a CryptoUpdate to add or remove a virtual address. She may also perform a key update and specify the public key for account be updated to hold in addition to her current key the ECDSA that maps to one of her virtual addresses.

Step 3: Alice may submit a Contract Create or Contract Call transaction for which the network will consult  her account to determine the appropriate address to provide to the EVM.

## HAPI Changes

Proto messages will need to be updated to represent the virtual address info in submissions and in record files exported

A `VirtualAddress` message proto captures the evm address and whether it’s the default on the account 

```protobuf
message VirtualAddress {
	
    /**
    * The 20-byte EVM address that is derived from the keccak-256 hash of a ECDSA_SECP256K1 primitive key.
    */
	bytes address = 1;

    /**
    * Flag if this address should now be set or is the default address on the account
    */
    bool is_default = 2;
}

```

Update `AccountID` with `evmAddress` to separate it from `alias`

```protobuf
message AccountID {
	...
	
	oneof account {
      ...
        /**
        * The ethereum account 20-byte EVM address to be used initially in place of the public key bytes. This EVM
        * address may be either the encoded form of the shard.realm.num or the keccak-256 hash of a ECDSA_SECP256K1 primitive key.
        *
        * If a transaction lazily-creates this account, a subsequent transaction will be required containing the public key bytes
        * that map to the EVM address bytes. Lazy account creates will only support the keccak-256 hash of a ECDSA_SECP256K1 primitive key form.
        */
        bytes evm_address = 5;
    }
}
```

Expose the virtual addresses in a `CrytptoGetInfo` response by updating `AccountInfo`

```protobuf
message AccountInfo {
	...
	/**
    * List of virtual addresses each of which is an EVM address that maps to an ECDSA key pair a user must prove ownership of. The size will be bounded.
    */
	repeated VirtualAddress virtual_addresses = 24;
}
```
Note: Initially the number of virtual address an account can hold will be bounded first to 1, with an eventual expansion to 3 to support override scenarios and a final maximum of 10 as required. Future community use cases requiring unbounded support may update this HIP in to explore and support unbounded cases.

Add the evm address to `CryptoCreateTransactionBody` to support the lazy create flow and separate it from alias

```protobuf
message CryptoCreateTransactionBody {
	...

	/**
	 * EOA 20-byte address to create that is derived from the keccak-256 hash of a ECDSA_SECP256K1 primitive key.
	 */
	bytes evm_address = 20;
}
```

Add `virtual_address_update` to `CryptoUpdateTransactionBody` to support the addition and removal of virtual addresses

```protobuf
oneof virtual_address_update {
    /**
     * The virtual address to be added.
     */
    VirtualAddress add = 20;

    /**
     * The 20-byte EVM address of the virtual address that is being removed.
     */
    bytes remove = 21;
}
```

Update `ContractCreateTransactionBody` and `ContractCallTransactionBody` to support overriding the default virtual address

```protobuf
message ContractCreateTransactionBody {
	...
    /**
    * The 20-byte EVM address (differs from account default) to use for the given transaction. This address must be owned by the account.
    */
	bytes virtual_address_override = 21;
}

message ContractCallTransactionBody {
	...
    /**
    * The 20-byte EVM address (differs from account default) to use for the given transaction. This address must be owned by the account.
    */
	bytes virtual_address_override = 5;
}
```

Update the `TranscationRecord` to expose virtual address updates

```protobuf
message TransactionRecord {
	...

    /**
    * The new default EVM address of the account created by this transaction.
    * This field is populated only when the EVM address is not specified in the related transaction body.
    */
    bytes evm_address = 21;
}
```

The following is a table of HAPI proto inputs and outputs to show case new/modified transaction calls and how details are exposed in record files

### Update Account state

The account objects will need to be updated to contain a list of 20 byte EVM address values and the default virtual address.

A matching set of change should be made to `MerkleAccountState`

```java
public interface HederaAccount {
	...

	Set<ByteString> getVirtualAddresses();

	void setVirtualAddresses(Set<ByteString> virtualAddresses);

	ByteString getDefaultVirtualAddress;

	void setDefaultVirtualAddress(ByteString virtualAddress);

}
```

Note: To support a larger number of virtual addresses on query an additional `CryptoGetAccountVirtualAddressesQuery` query type may be added to support a paid retrieval of the full list of virtual addresses.

```protobuf
message AccountGetVirtualAddressesQuery {
    ...
    QueryHeader header = 1;

    /**
     * The account instance for which the virtual records should be retrieved
     */
    AccountID accountID = 2;
}

message AccountGetVirtualAddressesResponse {
    ...
    ResponseHeader header = 1;

    /**
     * List of virtual addresses each of which is an EVM address that maps to an ECDSA key pair a user must prove ownership of.
     */
    repeated VirtualAddress virtual_addresses = 2;
}
```

### Virtual address creation

The process of adding a virtual address requires authentication of the account, storage of the address and the update of a map to allow for easy searching using the address.

- Add a new  `evmAddress` → `accountId`  map, for easy account lookups
- Account creation
    - `CryptoCreate` transactions with a simple ECDSA key will have its signature examined , the public key extracted from the signature and a corresponding Ethereum public address `evmAddress` calculated. For cases where a separate address is to be set the CryptoCreateTransaction may take the desired virtual address. For this  `CryptoCreateTransactionBody`  will be updated with
    - `CryptoTransfer` transactions to an Ethereum public address `evmAddress` will utilize the lazy-create flow and create a Hollow account with a single virtual address
    - `CryptoUpdate` transactions that add an Ethereum public address `evmAddress` will have signatures examined and the public key extracted and an Ethereum public address `evmAddress` calculated
    - The  `evmAddress` → `accountId` map and the account object should be updated with the `evmAddress`
    - Future transactions utilizing an `evmAddress` will verify a valid entry in the map or fail with `INVALID_SIGNATURE`
- Contract
    - `ContractCall` / `ContractCreate` smart contract transactions that result in new contract creation should add an Ethereum public address `evmAddress` for `CREATE` & `CREATE2` to `contract.account.virtualAddresses`. Contract addresses are calculated by the ledger based on internal state.
    - Contracts may only have 1 virtual address entry to insure immutability in accordance with the Ethereum yellow paper. The network should prevent the update of a contracts virtual addresses.
- Export virtual address added in record for account and contract transactions

Note: The concept of virtual address may be extended to support Contract Accounts, in which the result of the CREATE2 operation address is stored as a virtual address. This will provide feature expansion ramps down the line.

### Support virtual address list modification

The list of virtual addresses should support the ability to add and remove entries

To add a virtual address an account would submit a `CryptoUpdateTransactionBody` with a `virtual_address_update.add` containing the desired evmAddress and signing the transaction with the ECDSA private key that maps to the evm address being added.

To remove a virtual address an account a would submit a `CryptoUpdateTransactionBody` with a `virtual_address_update.remove` containing the existing evmAddress setting the remove flag to true and signing the transaction with the account key.

### Transaction EVM address value

The network will determine the appropriate Ethereum public address `evmAddress` per transaction based on the following logic

1. If no override `virtual_address_override` is provided
    1. if a non null `defaultEvmAddress` exists it is provided to the EVM
    2. If no `defaultEvmAddress` is present the `long-zero` address is provided to the EVM
2. If an override `virtual_address_override` is provided
    1. the `account.virtualAddresses` is verified for `evmAddress` presence
        1. if verified, transaction processing continues
        2.  if not present the transaction fails
    2. The `evmAddress` → `accountId` is verified for an entry 
        1. if verified, transaction processing continues
        2. if not present the transaction fails 

### Alias to Virtual Account Migration

To dissociate the alias concept from EVM public addresses and to reduce the overhead on users the network should perform a state migration for accounts and contracts

### Accounts

1. An `evmAddress` → `accountId` map is created to resolve future virtual address references
2. Traverse all accounts 
3. If `account.key` is not a simple ECDSA key (`evmAddress`) skip
4. If a simple `ECDSA` key based accounts
    1. Calculate the 20 byte `evmAddress` public address value
5. Check if `evmAddress` → `accountId` map contains an entry. If present skip
6. Perform `CryptoUpdate` with `virtual_address_update.add.evm_address = account.alias` and `virtual_address_update.add.is_default = true`
7. Add `evmAddress` to `evmAddress` → `accountId` map
8. Check `alias` → `accountId` map for an entry. If present remove the `evmAddress` from the `alias` → `accountId` map

Post migration the account creation logic should only update the  `alias` → `accountId` map with public keys and no longer utilize add the 20 byte address values. Additional, no ECDSA based account should have a `account.alias` with a public address format.

### Contracts

1. Traverse all contract accounts
2. Check `contract.alias`
3. If `contract.alias` is a Hedera address or empty then skip
4. If `contract.alias` is a 20 byte hex perform `CryptoUpdate` with `virtual_address_update.add.evm_address = account.alias` and `virtual_address_update.add.is_default = true`

### Connect to Hedera via Virtual Address ECDSA key

An account with a virtual address should be searchable by the public address.

Search by `evmAddress` will be supported by consulting the `evmAddress` → `AccountId` map on queries. Similarly, if an `ECDSA` public key is provided instead, the network should support extraction of the public address and subsequent search by the retrieved value. This will expand account import options in wallets and allow for account info retrieval in more scenarios.

## Transaction signing with matching simple key

There will be cases where users may have a simple key (`ECDSA` or `ED25519`) that does not correlate to the virtual address used in a transaction that requires `ECDSA` key signing. In this case users may want to utilize their virtual address key whiles maintaining the existing simple key(s) they have on their account.

To support such mobility cases where the security implications make sense a user may update their simple key to a 1 of n threshold key. In this way users can sign transactions with their initial simple key or their desired `ECDSA` simple key that maps to an evmAddress.

For example an early adopter of Hedera will most certainly have an `ED25519` key on their account. In this way they would not be able to successfully call smart contract transactions that utilize `ECRECOVER`. With the addition of a virtual address they are 1 step closer to being able to support this scenario but still do not match the `ECDSA` key signing requirements. In this case the user may update their `ED25519` key to a 1 of 2 threshold key where transactions may be signed by either the `ED25519`  or `ECDSA` private key the user has control over.

In this scenario it can be seen as a safe security modification, however this should be up to the discretion of the user.

Note: This scenario is reserved for simple key cases only. It is strongly advised that users do not modify complex keys to be a 1 of n in which the complex key is on one of the options as this dilutes the original security architecture.

## Contract account virtual address

With the addition of virtual addresses and the separation of alias logic allows a contract account to represent its contract address with its virtual address.

Note: A migration may be required to scan contracts, retrieve their evmAddress value and set it as the single virtual address on the account.

Note2: Contract account should be explicit prevented from updating their virtual address.

## Community product impacts

### SDK Impacts

To support these updates the SDK will need to update the available methods on some transactions

1. `CryptoUpdate` transactions will need support to add/remove and specify default `evmAddress`.
    
    ```java
    new CryptoUpdate
    	.addVirtualAddress('0x...') // String
    	.removeVirtualAddress('0x...') // String
    	.setDefaultVirtualAddress(true); // boolean
    ```
    
2. `ContractCreate`/`ContractCall` will require the ability to specify the desired `evmAddress` per transaction. Note this may also be an accounts Hedera address to support migration cases.
    
    ```java
    new ContractCreate
    	.setVirtualAddressOverride('0x...'); // String
    
    new ContractCall
    	.setVirtualAddressOverride('0x...'); // String
    ```
    
This does not impact the final contract address, which will be dictated by `CREATE` or `CREATE2` operations.

### Mirror Node Impacts

As the historic ledger of Hedera, the Mirror Node will require additional steps and updated assumptions to support Virtual Addresses.

1. Aliases will be simplified in their format as post migration they will always have a simple `ECDSA`/`ED25519` key value. That is the alias returned in `CryptoCreate` records will no longer take the format of a public address and will always be the protobuf value of a simple key. In this way some DB or service considerations may be simplified. 
2. Accounts will observe a new property `virtualAddressesList`. This will be a set of 20 byte hex addresses the account is associated with, with each value mapping to the same AccountId. 
3. To support search, the Mirror Node should support a `evmAddress` → `accountId` lookup. Utilizing the current table strategy a current and history table could be employed i.e. `account_virtual_addresses` and `account_virtual_addresses_history`. 
    
    ```sql
    create table if not exists account_virtual_address (
        evm_address         bytea null,
        id                  int not null,
        modified_timestamp  bigint not null,
        removed             boolean null,
        primary key (id, modified_timestamp, evm_address)
    );
    ```
4. Update entity table with a `default_virtual_address` column to capture.
5. To expose this the Mirror Node should update  `api/v1/accounts/{idOrAliasOrEvmAddress}` to list both the Hedera Address (`long-zero`) and its virtual addresses. This will disambiguate the potential addresses. Additionally, the endpoint should support search via Hedera or evm address.
    
    ```json
    {
      accounts: '0.0.1',
      ...,
      hederaAddress: '0x0...1',
      virtualAddresses: [
        {
          evmAddress: '0x2...3',
          isDefault: false
        },
        {
          evmAddress: '0x4...5',
          isDefault: true
        }
      ]
    }
    ```

Note: Should the network need to expand a larger number of virtual addresses an additional `api/v1/accounts/<accountId>/virtualAddresses` endpoint may be added to encompass an endpoint that supports paging the full list of virtual addresses.

### Wallet/Exchange Impacts

Wallets and exchanges continue to serve as the entry point for account user creation. In this way they should utilize new functionality for their purposes and to allow users to transact easily

1. Search accounts by virtual / Hedera address using Mirror Node or SDK
2. Import `ECDSA` private keys. In the past ED keys were the main type but with an influx of users from EVM chains `ECDSA` support will be important.
3. Transfer to  virtual / Hedera address using SDK or JSON RPC relay
4. Expose account details Hedera address and `virtualAddresses`

Multiple personas exist for which wallets need to explore support to ensure vibrancy of the smart contract scenarios.

An additional option exists for wallets that use a seed phrase to generate keys i.e HDWalllet - the same seed phrase can create both an `ED25519` and an `ECDSA` key. In this way wallets may create a new account, establish a 1 of 2 threshold key in which users may utilize any key to sign. This provides users with options, namely `ECRECOVER` support from creation. Additionally, users can recover both keys that may be regularly utilized.

Notably, wallets may also explore ETH native flows by supporting RLP transaction encoding and utilizing the HAPI `EthereumTransaction`. This would increase their support across other chain DApps which could now be pointed to Hedera and allow for in wallet and native scenarios that are faster, cheaper and more scalable on Hedera.

### Mirror Node Explorer Impacts

The mirror node explorers will continue to provide for many the go to source of account and ledger details. In this way the explorers should support

- Search by virtual / Hedera address - utilize the Mirror Node
- Expose account details Hedera address and `virtualAddresses`

## Backwards Compatibility

This HIP builds upon HIP 584 and also restores HIP 32’s consistency.

Accounts identifiers and feature applicability are unrestrained to apply in more scenarios with less crossover.

## Security Implications

The addition and removal of virtual addresses relies on the current Hedera methodology of singing transactions with the account private key. As such the network is able to confirm ownership of the evmAddress. Additionally, the ledger will ensure uniqueness of evmAddress and will ensure only 1 account will have the address.

Additionally, the use of an evmAddress provides no authorization for Hedera transaction functionality. On the EVM smart contracts can perform the appropriate authorization checks as they normally would before carrying out sensitive operations.

As such there are no security implications since the ledger and the EVM maintain their authorization capabilities. In fact, it may be argued security is enhanced by the precompile support for contracts to verify both raw and protocol formatted signatures

As always users and developers are responsible for key hygiene and proper storage of keys

## How to Teach This

- Additional documentation on protobufs
- SDK examples should be written to highlight
    - `Crypto`Update to add and remove virtual addresses
- Mirror Node
    - Open API spec should be updated for `/api/v1/accounts/{accountIdOrEVmAddress}`
    - DB documentation should be updated to highlight new table(s)
- Doc site tutorials utilizing SDKs should be written to highlight alias setting and the lazy account creation flow.

## Reference Implementation



## Rejected Ideas

The continuous conflict of pure Ethereum account matra vs Hedera Account layout resulted in multiple ideas being considered but ultimately rejected. These included

- A special reserved `ECDSA` based `aliasKey` on all accounts. This would have ensured only a single key was used on contract interactions.
- A special reserved `ECDSA` based `aliasKey` and an additional `evmAlias`. This would have provided complete separation of all EVM interactions with Hedera account keys.
- Requiring nested signing similar tot he relay in which an out HAPI transaction has the Hedera signatures and an inner EVM transaction has the appropriate transaction with the EC public address

## Open Issues



## References

- [ECRECOVER Precompiled Contract](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/vm/precompiled_contracts/ecrecover/index.html)
- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
