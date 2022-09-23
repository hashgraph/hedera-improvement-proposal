---
hip: <HIP number (this is determined by the HIP editor)>
title: Expand alias support in CryptoCreate & CryptoTransfer Transactions
author: Nana Essilfie-Conduah <@Nana-EC>
working-group: Danno Ferrin <@shemnon>, Atul Mahamuni, Richard Bair <@rbair23>, Ali Katamjani, Michael Tinker <@tinker-michaelj>, Mohsin Qamar, Leemon Baird <lbaird>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2022-09-20
discussions-to: <a URL pointing to the official discussion thread>
updated: <comma separated list of dates>
requires: 32
replaces: <HIP number(s)>
superseded-by: <HIP number(s)>
---

## Abstract

Through the implementation of [HIP 32](https://hips.hedera.com/hip/hip-32), the Hedera Network supports the auto creation of accounts using an ECDSA or ED25519 public key to establish an account alias. This alias can be used as a unique identifier for a Hedera account as part of crypto transfers before and after it is created in place of the `shard.realm.num` accountId format.

Notably, today the Hedera network supports 4 forms of account identifiers

1. `Hedera account id` - `shard.realm.num` format. This is the main account identifier for the network across the ecosystem.
2. `Hedera account long-form` - This is the bytes of the cryptographic public key of the account, appended to the shard and realm in the form `shard.realm.bytes`. Currently, this can only be specified via the `auto-create` flow using the `CryptoTransfer` transaction. 
3. `Hedera account long-zero address` - This is the Hedera account id styled as an Ethereum account hex string. The Hedera account id numbers are hex encoded and the value is prefixed with zeros to form a 20 byte address. This was added to represent all accounts in an `EVM` conformant manner.
4. `Ethereum account address` / `public-address` - This is the rightmost 20 bytes of the 32 byte `Keccak-256` hash of the `ECDSA` public key of the account. This calculation is in the manner described by the Ethereum Yellow Paper. Note, that the recovery id is not formally part of the public key and not included in the hash. This is calculated on the consensus nodes using the `ECDSA` key provided in the auto create `CryptoTransfer` transaction.

Examples of each format are noted below

| Identifier Type | Example |
| --- | --- |
| Hedera Account ID | 0.0.10 |
| Hedera Long-Form Account ID | 0.0.CIQNOWUYAGBLCCVX2VF75U6JMQDTUDXBOLZ5VJRDEWXQEGTI64DVCGQ ([base32url bytes](https://datatracker.ietf.org/doc/html/rfc4648#section-6)) |
| Hedera Account Long-Zero address | 0x000000000000000000000000000000000000000a (for accountId 0.0.10) |
| Ethereum Account Address / public-address | 0xb794f5ea0ba39494ce839613fffba74279579268 |

To provide greater context for this HIP some additional terms are defined here in advance

- `Ethereum-native wallets` - wallets that utilize the Ethereum JSON RPC APIs to interact with an Ethereum node. Accounts created via this wallet are ECDSA key based and only expose the account `public-address`.
- `Hedera-native wallets` - wallets that utilize the  Hedera SDK or gRPC HAPI calls to interact with Hedera consensus and mirror nodes. Historically, accounts created via these wallet are `ED25519` based and usually identify the account via the `Hedera account id`.
- `auto-create` - a unique account creation flow in which the public key that a crytotransfer is addressed to is used to automatically create a new account (if none exists) without an explicit `CryptoCreate` transaction being submitted.
- `Hollow account` - a partially created account which lacks a public key but does have a valid `shard.rela.num` accountId. Such an account may receive assets but may not take part in transactions that require its signature.
- `lazy-create` - a unique account creation flow in which the public address (extracted from an ECDSA public key) provided is used to automatically create a hollow account without an explict CryptoCreate transction being submitted.

Post the implementation of [HIP 32](https://hips.hedera.com/hip/hip-32), only accounts created via `auto-create` using the `CryptoTransfer` transaction have aliases set. Wallets and exchanges often utilize the `CryptoCreate` transaction and therefore have not fully integrated alias logic into their UX flows. This limits full applicability of Smart Contract scenarios for Hedera accounts created using `Hedera-native wallets` and web3 tool compatibility for new users coming from external chains using `Ethereum-native wallets`. 

In some cases complex onboarding steps are required to gain detailed information necessary for onboarding to the Hedera network i.e. when integrating with Hedera an external account usually identified by its `public-address` requires extraction or export of its public or private key respectively. 

Additionally, the `public-key` is currently the only alias format supported in `CryptoTransfer` transactions.

As such, onboarding scenarios and account address formats should be expanded to support a greater portion of the present and incoming user market.

## Motivation

The current system presents limited pathways to create an account that is smart contract compatible or identify that account post creation using current industry formats

1. The `CryptoTransfer` transaction using an `ECDSA` based `public-key` alias is the only way to create an account with an alias. 
2. The `ECDSA` account creation with `alias`  flow only supports the `public-key` alias and not the `public-address` styled address.

The usage of multiple transactions and standard market account identifier formats should be supported to streamline the easy onboarding of new users from external chains and transfers between these accounts.


## Rationale

With [HIP 32](https://hips.hedera.com/hip/hip-32) it’s possible to send HBARs in a `CryptoTransfer` to an account before it exists on the ledger by providing an alias using a cryptographic public key (`ED25519` or `ECDSA`) of the `public-key` format. 
Using this, the ledger will confirm the uniqueness of the alias and create an account that can be referenced via this accounts public key alias.

However, the ability to create accounts or refer to accounts with an alias is limited and confusing for Smart Contract user experiences since

- Aliases can only be set using a `CryptoTransfer` transaction, whereas wallets would prefer to do this in a `CryptoCreate` transaction in addition to a `CrytoTransfer` transaction.
- Users who only know their `public-address` must find innovative ways to find their public key or safely export their private key to extract the public key for use in the `CryptoTransfer`.
- HBAR or token transfers using an alias only support the `public-key` alias format and not the `public-address` format.

Notably, most ledgers in the market utilize the `ECDSA` key for accounts, especially where an `EVM` is concerned. In fact to completely support all Smart Contract scenarios on the `EVM` used by Hedera, an account must possess an alias based on its `ECDSA` public key that dictates the address value observed by teh EVM in transactuions. 

## User stories

1. As a user with an `ECDSA` based account from another chain I would like to create my Hedera account using my `public-address`.

2. As a developer, I would like to `auto-create` a new account using a public key via the `CryptoCreate` transaction.

3. As a developer, I would like to `lazy-create` a new account using a `public-address` via the `CryptoCreate` transaction.

4. As a developer, I would like to `lazy-create` a new account using a `public-address` via the  `CryptoTransfer` transaction.

5. As a developer, I would like to transfer HBAR or tokens to a Hedera account using their `public-address`.

6. As a Hedera user with an `Ethereum-native wallet`, I would like to receive HBAR or tokens in my account by sharing only my `public-address`.

7. As a Hedera user with a `Hedera-native wallet`,  I would like to transfer HBAR or tokens to another account using only the recipient's `public-address`.
  
## Specification

This HIP proposes an expansion to the ways in which an account with an alias can be created and referenced to ensure compatibility with users coming from existing chains with `ECDSA` keys and provide greater applicability to smart contract scenarios.

It is thus proposed to

- Add an alias to public key mapping validation check to ensure single user ownership
- Expand `CryptoCreate` transactions to support setting an alias using a public-key
- Expand `CryptoTransfer` and `CryptoCreate` transactions to support the input of an alias of the Ethereum account address style with no public key

### Add Public key → alias validation

Additional alias validation logic will be necessary to mandate that at the time of setting an alias it must map to the public key set for the account.

`ED25519` → The alias must match the public key provided/set on the account

`ECDSA` → The alias match the public key or be the public-address of the `ECDSA` key provided/set on the account

### Add  setAlias to `CryptoCreate`

![auto-create-with-key.png](../assets/hip-0000/auto-create-with-key.png)

Add alias bytes property to the `CryptoCreateTransactionBody` [proto file](https://github.com/hashgraph/hedera-protobufs/blob/main/services/crypto_create.proto)

```proto
message CryptoCreateTransactionBody {
	...
	
	/**
   * The bytes to be used as the account's alias. The bytes will be 1 of 2 options. It will be the serialization
   * of a protobuf Key message for an ED25519/ECDSA primitive key type. If the account is ECDSA based it may also be the public-address, calcluated as the last 20 bytes of the keccak-256 of the ECDSA primitive key.
   * Currently only primitive key bytes are supported as the key for an account with an alias. ThresholdKey, KeyList, ContractID, and delegatable_contract_id are not supported.
   *
   * At most only one account can ever have a given alias on the network.
   *
   * If a transaction creates an account using an alias, any further crypto transfers to that alias will simply be deposited
   * in that account, without creating anything, and with no creation fee being charged.
	 * If an account with an alias is deleted the alias will be freed up for use.
   */
	bytes alias = 18;
}
```

Additionally, if an account is created with an `ECDSA` public key the alias property should be set automatically at creation to ensure smart contract compatibility from creation. 

### Account Creation via alias only (Lazy Create)

![lazy-create-with-address.png](../assets/hip-0000/lazy-create-with-address.png)

The `CryptoCreate` transaction should be expanded to create a new account on the network when only a `public-address` alias is provided with no `public-key`.

If a `public-key` is provided as an alias the `key` property on the account may be set automatically. When a `public-address` (based on an `ECDSA` key) is provided as an alias the `key` on the account will be left empty and only the alias set.  An account created in this manner will be known as a `Hollow Account` and will only be able to receive HBAR and applicable token transfers, but can not take part in transactions submitted by others requiring its signature.

Since Hedera accounts require keys to ensure security, a matching `ECDSA` `public-key` must be provided in a future signed transaction issued by the owner of the `public-address`. Due to the nature of `ECDSA` keys the `public-key` and `public-address` may be extracted from the signature of a transaction signed by the `ECDSA` private key that owns the new account. This process will complete the creation of the account, taking it from a `Hollow Account` to a normal complete account with a valid `public-key`.

As an illustration, a wallet or exchange could create and fund a new Hedera account based on the `public-address` alone. Once the transaction goes through the owner of the `public-address` user may use a wallet of their choice to submit a signed transaction (e.g. `CryptoTransfer`, `ContractCreate`, `ContractCall`, `EthereumTransaction` or `TokenAssociation`) to claim ownership of the account and carry out the desired transaction. The ownership claim and account completion will be seamless and transparent to the user.

`CryptoTransfer` should also support this case. This will support developers and exchanges who prefer to transfer to and create an account in one step.

### Allow CryptoCreate to automatically set alias

When `CryptoCreate.key` is an `ECDSA` key, the network node may calculate the `public-address` and automatically set the accounts alias value. 

## Backwards Compatibility

Existing accounts are unaffected by the expansion and the additional alias field on the transaction protobuf is already supported.

`CryptoTransfer` auto-account creation is un-impacted and will still support the provision of the public key. 

### Mirror Node Impications

The Mirror Node can already ingest account creation transactions with alias values.
This will only increate the applicable parent trnasactions that can cause this flow.
Where it was limited to CryptoTransfer it will now include CryptoCreate

### Wallet/Exchange Implications

With the suggested changes, the alias property of an account will become more applicable and will need greater visibility.

To provide greater web3 user scenario support Wallets & Exchanges should

- Display the account alias property of an account
- Create an ECDSA based account with alias when full smart contract support is desired
- Accept the use of an alias as a account identifier in HBAR and token transfers
- Accept the use of an alias during account creation
- Add support to check if an account exists with a given alias

### Performance Implications

The mass adoption of alias setting on new and existing accounts will have minor but notable memory implications on the Hedera ecosystem

`CryptoCreate` transactions will see extra bytes for every account created with an alias

The size of the bytes in each case depends on the governing account key type. For an `ECDSA` based account the alias will always be a valid Ethereum address and will be 20 bytes long. In the `ED25519` case the alias will be a valid protobuf serialized public key of 35 or 68 bytes depending on encoding.

## Security Implications

The `lazy-create` account flow requires additional checks be added to ensure transactions involving an account with only a `public-address` are not processed without a matching `public-key`. 

## How to Teach This

- Additional documentation on protobufs
- SDK examples should be written to highlight
    - `CryptoCreate` alias setting using a `public-key`
    - `CryptoCreate` alias setting using a `public-address` i.e. lazy account creation flow.
    - `CryptoTransfer` alias setting using a `public-address`
- Doc site tutorials utilizing SDKs should be written to highlight alias setting and the lazy account creation flow.

## Reference Implementation

The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation.

## Rejected Ideas

- A special reserved `ECDSA` based `aliasKey` on all accounts. This would have ensured only a single key was used on contract interactions.
- A special reserved `ECDSA` based `aliasKey` and an additional `evmAlias`. This would have provided complete separation of all EVM interactions with Hedera account keys.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

- Should we expose the `lazy-create` flow via precompile also? This would allow `Ethereum-native wallet` (e.g. Metamask) users with balance to create new accounts from their wallet. How does this affect the relay cost?
- For an account created via the `lazy-create` flow, should query calls to a network node result in the key extraction and mapping via a child `CryptoUpdate` transaction?

## References

- [Auto Account Creation](https://hips.hedera.com/HIP/hip-32.html)
- [ECRECOVER Precompiled Contract](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/vm/precompiled_contracts/ecrecover/index.html)
- [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 – see [LICENSE](https://hips.hedera.com/LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
