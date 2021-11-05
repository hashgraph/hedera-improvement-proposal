- hip: <HIP number (this is determined by the HIP editor)>
- title: Hyperledger Token Service Precompiled Contract for Hyperledger Smart
  Contract Service
- author: Danno Ferrin <danno.ferrin@gmail.com
- type: Standards Track
- category: Core
- status: Draft
- created: 2021-11-04
- discussions-to: <a URL pointing to the official discussion thread>
- updated:
- requires:
- replaces:
- superseded-by:

## Abstract

Describe the integration of Hedera Token Service (HTS) with the Hedera Smart
Contract Service (HSCS), allowing contracts to transfer, mint, burn, associate,
and dissociate tokens programmatically.

## Motivation

The fusion of the high performance token system in Hedera with programatic
contracts is a frequently requested feature. Specifically, the ability to manage
tokens outside of the smart contract service as well as via smart contrats.

## Rationale

To bridge the EVM and Hedera services it will be necessary to use the EVM's
precompiled contract facility. Because of the integration with Solidity it is
also valuable to be able to treat the precompile as a system contract. Hence a
precompile whose input data follows the solidity calling conventions addresses
both needs.

There are also 3 perspectives on the HTS System. The first perspective is with
the same level of specificity the gRPC calls provide to the mapped service
message. A second perspective is of Smart Contract authors trying to make
gas-efficient calls. The third perspective is Smart Contract Engineers who want
to treat HTS tokens as much like ERC-20 tokens as possible.

There are 5 main calls: transfer, mint, burn, associate, and dissociate. A layer
of convience calls with explicit mapping to those main 5 calls will be provided
for the second perspective. To support the third perspective a more involved
solution across the HSCS will be used.

## User stories

As a smart contract developer, I want to be able to transfer, mint, burn,
associate, and dissociate smart contract tokens through solidity contract calls.

As a smart contract developer, I want my smart contract to be able to transfer,
mint, burn, associate, and dissociate tokens where autorization is granted
because my smart contract initiated the call and without any ohter signatures.

As a hedera users, I want to be able to access my HTS tokens like an Ethereum
ERC-20 token:

## Specification

### EVM Precompile

The precompile address will be `0x???`  (0x127 for unicode h-bar? unicode t-bar?
Whatever it is it needs to be between 256 and 1000). The precompile input data
will follow the calling conventions of Solidity ABI version 1.

The gas cost of the precompile will be variable based on the specific function
called, but will not be less than 1 gas per byte of data in the input data. Gas
will be priced so that it will be cheaper to do calls directly to HTS rather
than through HSCS where such calls are possible.

#### Solidity Function Signatures

The [Solidity file for development](../assets/hip-hts/solidity/IHederaTokenService.sol)
contains the function signatures that the precompile will respond to. It is
included in this HIP by reference.

> TBD:

- Support NFT calls? (transfer, mint, burn)
- Support tokenGetInfo?  (total supply, symbol, etc)
  - Maybe only support via ERC-20 redirect calls?
- Support tokenUpdate?
- Support token pause/unpause?

### Contract Key

To support contracts controlling features like minting and burning the defined
but up until now unused field `contractID` in the `Key` protobuf message. When a
token has a contract key as the admin key or one of the admin keys then that key
is considered validated if the `caller` of the relevant method is the contract
identified in the call.

### Signature Verification

For operations that require signature verification the signatures of the top
level contract call are considered, in addition to the immediate caller of the
operation. This may result in a contract call that may need to be signed by more
than the initial caller of the smart contract.

### ERC-20 calls directly to Token Accounts

To enable HTS tokens to be more bradly used in DeFi applications the
interactions with HSCS and Token accounts will be ehnance to allow HTS accounts
to receive smart contract calls that will be immediatly delegated to the HTS
precompile for evaluation.

#### Redirect contract

Each HTS account will expose a standard redirection EVM bytestream. This
bytestream will be available to `EXTCODEHASH`, `EXTCODESIZE` and `EXTCODECOPY`
operations as though the smart contract were deployed itself. The EVM will
execute the bytecode, which will wrap the call data with the address of the HTS
Token, to a call to teh HTS precompile. The HTS precompile will then either
execute or reject the call based on IERC20 mappings described in the next
section.

(The following pseudocode will be replaced with real EVM opcodes prior to
review)
> ```
>
>// Put CALLER in memory
>// Put the remaining CALLDATA into memory
>// DELEGATECALL 0x127 with all remaining gas
>// if the DELEGATECALL failed REVERT()
>// RETURN the exact same results as the DELEGATECALL
>
>```

#### Supported ERC-20 operations

The following ERC-20 operations will be supported:

- `function totalSupply() external view returns (uint256);`
- `function balanceOf(address account) external view returns (uint256);`
- `function transfer(address recipient, uint256 amount) external returns (bool);`

The following ERC-20 operations will not be directly supported

- `function allowance(address owner, address spender) external view returns (uint256);`
- `function approve(address spender, uint256 amount) external returns (bool);`
- `function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);`

> TBD

- Support ERC-721 methods for NFTs?
- Support ERC-777 methods?

## Backwards Compatibility

There is no previous implementation of HTS in the HSCS. There is also no
conflict with existing ERC-20s that are EVM only. Migration of existing
contracts is out of scope for this HIP.

## Security Implications

### Admin Key Call Depth

Controllers of admin keys will need to be careful signing smart contract calls.
As their authorization extends to the entire call stack the signers need to make
sure that any HTS calls made as a consequence of the initial function call are
intended. These calls could be multiple levels deep and crafty contracts can
manipulate the calls based on stored state.

Mitigations include relying on contract keys exclusively, using a threshold
signature that includes a contract key, only signing contract calls for known
and audited sources, and only signing direct HTS calls while relying on a
threshold scheme to allow contracts to also perform actions per smart contract
rules.

## How to Teach This

//TBD

## Reference Implementation

// TBD

## Rejected Ideas

// TBD

## Open Issues

## References

//TBD 

- ERC-20

## Copyright/license

This document is licensed under the Apache License, Version 2.0 --
see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
