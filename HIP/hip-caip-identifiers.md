- hip: &lt;HIP number (this is determined by the HIP editor)>
- title: CAIP Identifiers for the Hedera Network
- author: Danno Ferrin (danno.ferrin@hedera.com)
- type: Standards Track
- category: Application
- status: Draft
- created: 11 Oct 2021
- discussions-to: &lt;a URL pointing to the official discussion thread>
- updated: 
- requires: 
- replaces: 
- superseded-by: 

## Abstract

Describes the Chain Agnostic Improvement Proposal (CAIP) identifiers for
blockchain identification, account identification, and asset identification.

## Motivation

CAIP is a set of specifications describing how software applications can
interact with multiple other chains in an agnostic manner. Examples are hardware
wallets, native web3 applications, and web browser based applications. Providing
a standardized set of CAIP identifiers will allow such applications to support
Hedera.

This specification will exist in both the HIP repository as a single HIP and in
the CAIP repository as multiple CAIPs.

## Rationale

There are two key palaces multiple variations of the identifier could be made.
The first is the style of the blockchain identifier. Because Hedera is intended
to only serve a small set of purpose built networks the style that Steller
adopted in
[CAIP-28](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-28.md)
seemed more appropriate.

For separators of the shard, realm and identifiers replacing the dotted notation
with the dashed notation was deemed more readable than the alternatives.
<!--
For asset and account identifiers the relevant CAIPs ([CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md) and [CAIP-19](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-19.md)) only permit alphanumeric values for the account id, prohibiting dashes and periods. To address this letters with semantic meanings were selected.

## User stories

Provide a list of "user stories" to express how this feature, functionality, improvement, or tool will be used by the end user. Template for user story: “As (user persona), I want (to perform this action) so that (I can accomplish this goal).”

-->  

## Specification

### Blockchain Identifier

The `hedera` namespace will be used for CAIP blockchain identifiers. There will
be 4 distinct references: `mainnet`, `testnet`, `previewnet`, and `devnet`.
There are no other supported references in this namespace at this time.

`hedera:mainnet` and `hedera:testnet` are the two persistent networks. `mainnet`
holds the production tokens and `testnet` operates as a testing sandbox with
state that is rarely if ever reset.

`hedera:previewnet` refers to the transient shared testnet that is erased once a
week.

`hedera:devnet` refers to any non-shared developer local network.

### Account Identifier

<!--
For account identifiers each of realm, shard, and account ID will be preceded with a lower case `r`, `s`, and `a` respectively. The realm, shard, and account ID will be expressed in decimal, and the results concatenated in realm, shard, account id order.

Examples:

```
# Treasury account
hedera:mainnet:r0s0a2

# Funding account
hedera:mainnet:r0s0a98

# Address Book Account
hedera:mainnet:r0s0a55

# Account '9.8.765432'
hedera:mainnet:r9s8a765432
```
-->

The account address is each of realm, shard, and account ID separated with a
dash (`-`). The format of the realm, shard, and account ID are unsigned integer
in decimal representation.

Examples:

```
# Treasury account
hedera:mainnet:0-0-2

# Funding account
hedera:mainnet:0-0-98

# Address Book Account
hedera:mainnet:0-0-55

# Account '9.8.765432'
hedera:mainnet:9-8-765432
```

### Asset Identifier

There are two types of native assets defined for the `hedera` namespace, `token`
and `nft`. Both are provided by the Hedera Token Service. Because Hedera also
supports EVM execution in some of its services the ethereum token
types `erc20` ([CAIP-21](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-21.md)
and `erc721` ([CAIP-22](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-21.md))
are also possible in the `hedera` namespace, although their use is expected to
be less than the use of the Hedera Token Service.

#### `token`

The asset reference of the token type is each of realm, shard, and token ID of
the token separated with a dash (`-`). The format of the realm, shard, and token
ID are unsigned integer in decimal representation.

Examples:

```
# Fictitious token in realm 0, shard 0, and token ID 720
hedera:mainnet/token:0-0-720
```

#### `nft`

The asset reference of the non-fungible token type is each of realm, shard, and
token ID of the token separated with a dash (`-`). The format of the realm,
shard, and token ID are unsigned integer in decimal representation.

The Token ID is the serial number. The format of the serial number is an
unsigned integer in decimal representation.

Examples:

```
# Fictitious token in realm 0, shard 0, token ID 721 serial number 3
hedera:mainnet/nft:0-0-720/3
```

## Backwards Compatibility

The dotted rendition of the Hedera accounts will remain as the canonical
representation within Hedera. CAIP identifiers are only to be used when required
by interoperability.

<!--
## Security Implications

If there are security concerns in relation to the HIP, those concerns should be explicitly addressed to make sure reviewers of the HIP are aware of them.

## How to Teach This

For a HIP that adds new functionality or changes interface behaviors, it is helpful to include a section on how to teach users, new and experienced, how to apply the HIP to their work.
-->

## Reference Implementation

The various SDKs may provide convenience methods to translate between Hedera
notations and CAIP notations.

## Rejected Ideas

### Using the ethereum blockchain namespace

One possibility for blockchain identifier is to use the `eip155` namespace and
have the networks be represented as `eip155:295`, `eip155:296`, `eip:297`
and `eip:298` for Mainnet, Testnet, Previewnet, and devnet. The EIP155 number
would be derived by the EVM `CHAINID` operation.

Using this identifier, however, would misrepresent the level of compatability
between Hedera and Ethereum chains. While Hedera does provide an EVM execution
environment that is where the compatability ends. First, Hedera uses the Edwards
25519 curve, and does not use the chain identifier as part of the signature (
which is the expressed purpose of EIP-155). Neither does it expose Ethereum
standard JSON-RPC apis at this time.

### Using letters instead of dashes in account identifier

As currently specified
[CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md)
prohibits dashes in account identifiers. The option of using letters to separate
decimals did not read as well (`hedera:mainnet:r0s0a720`
/ `hedera:mainnet:0-0-720`). Updating the CAIP to support dashes was viewed as a
more user-friendly option

## Open Issues

None at this time

## References

* Chain Agnostic Improvement Proposals - https://github.com/ChainAgnostic/CAIPs
* CAIP-2: Blockchain ID Specification
    - https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
* CAIP-10: Account ID Specification
    - https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md
* CAIP-19: Asset Type and Asset ID
  Specification https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-19.md

## Copyright/license

This document is licensed under the Apache License, Version 2.0 --
see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
