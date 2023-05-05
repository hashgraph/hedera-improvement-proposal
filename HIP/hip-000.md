---
hip: <HIP number (this is determined by the HIP editor)>
title: Contract Accounts Nonces Externalization
author: Miroslav Gatsanoga <miroslav.gatsanoga@limechain.tech>
working-group: Stoyan Panayotov <stoyan.panayotov@limechain.tech>, Ivan Kavaldzhiev <ivan.kavaldzhiev@limechain.tech>, Richard Bair <@rbair23>, Nana Essilfie-Conduah <@Nana-EC>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2023-05-04
---

## Abstract

The Hedera Smart Contract Service (HSCS) supports the deployment of contracts. A deployed contract should have a nonce value that depends on the number of other contracts that were created during its own creation.
Currently this is not the observed behavior in Hedera and this HIP aims to fix that.

## Motivation

In Ethereum, contract accounts have nonces, as specified by the [yellow paper](http://gavwood.com/paper.pdf) and [EIP-161](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-161.md).

The EVM uses the nonce value internally, for several different operations, for example:
    1. to check whether an account exists at an address, it checks whether the nonce property stored for this address is different than 0 (it also checks the balance and code properties for the address as well, but this is out of scope for this discussion).
    2. when deploying new contracts via a `CREATE` operation, the address for an Ethereum contract is **deterministically** computed from the address of its creator (`sender`) and how many transactions the creator has sent (`nonce`). The `sender` and `nonce` are RLP encoded and then hashed with Keccak-256.

Ethereum nodes expose a JSON-RPC endpoint that can be queried for each account’s nonce value: [eth_getTransactionCount](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)

In Hedera there is `JSON-RPC Relay` (as described in [HIP-482](https://hips.hedera.com/hip/hip-482)) that provides the same `eth_getTransactionCount` JSON-RPC endpoint, but currently it always returns a value of 1 for contract accounts. The desired behavior would be to have a nonce value of `1 + n` where `n` is the number of times the contract created other contracts through `CREATE` or `CREATE2` operations.

## Rationale

As described in [HIP-482](https://hips.hedera.com/hip/hip-482), the `JSON-RPC Relay` works with `EthereumTransactions` that it forwards to the consensus nodes. Apart from the `EthereumTransaction` type the consensus nodes can also handle other types of transactions (e.g. `ContractCall` or `ContractCreate`) that are not coming from the `JSON-RPC Relay` but can be used by developers by other means.
In general, when we talk about account nonces we will need to consider all of those transaction types for both types of accounts (i.e. EOAs and contracts):

- Contract nonce updates for both cases of `EthereumTransactions` and `non-EthereumTransactions` (i.e. `ContractCall` or `ContractCreate`) will need to be tracked and externalized to Mirror Node
- Tracking nonces for EOAs for `EthereumTransactions` is not changed (currently we don't have a specific protobuf to externalize the nonce but the nonce value is passed as part of the `EthereumTransaction` body, so Mirror Node can read the value from there)
- Tracking nonces for EOAs for `non-EthereumTransactions` is not supported because there is no use case for it in Hedera

## User stories

1. As a user, when I make a request to `eth_getTransactionCount` endpoint I want to be able to get correct nonce values for contracts.
  
## Specification

No changes to Services state will be needed because currently the nonces are currently being computed correctly there. We need to externalize these changes to Mirror Node so that it can keep a correct state representation for contract accounts.

### HAPI Changes

Define new message type:

```protobuf
message ContractNonceInfo {

    /**
     * Id of the contract
     */
    ContractID contract_id = 1;

    /**
     * The current value of the contract account's nonce property
     */
    int64 nonce = 2;
}
```

Update `ContractFunctionResult`:

```protobuf
message ContractFunctionResult {
    ...

    /**
     * A list of updated contract account nonces containing the new nonce value for each contract account
     */
    repeated ContractNonceInfo contract_nonces = 14;
}
```

### Mirror Node Changes

Mirror Node should start using the new `contract_nonces` field and update the state of the contract accounts with it.

## Backwards Compatibility

The HIP does not introduce any changes that are backwards incompatible.

## Security Implications

None.

## How to Teach This

- Additional documentation on protobufs

## Reference Implementation

None.

## Rejected Ideas

None.

## Open Issues

None.

## References

- [Ethereum yellow paper](http://gavwood.com/paper.pdf)
- [EIP-161](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-161.md)
- [HIP-482](https://hips.hedera.com/hip/hip-482)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
