---
hip: <HIP number (assigned by the HIP editor)>
title: Enable KeyList Support in HTS `updateTokenKeys` Precompile
author: Michael Garber <@michael.garber>
working-group: Giuseppe Bertone <@giuseppebertone>, Nikolaos Kamarinakis <@nikolaoskamarinakis>
requested-by: Axelar
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: YYYY-MM-DD
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/xxx
updated: YYYY-MM-DD
requires: <HIP numbers, if applicable>
replaces: <HIP numbers, if applicable>
superseded-by: <HIP numbers, if applicable>
---

## Abstract
This HIP proposes an enhancement to the Hedera Token Service (HTS) precompile function `updateTokenKeys` to support **KeyLists**. Although KeyLists are supported within the SDK, they cannot currently be set through the HTS precompiles, which limits their usability in smart contracts for token management. Enabling KeyList support within the HTS precompile would allow token keys managed by KeyLists to be updated on-chain, adding significant flexibility for contract-based token operations.

## Motivation
The Hedera SDK allows setting KeyLists for token keys, which is a useful feature for multi-signature setups and threshold-based authorizations. However, the HTS precompile function `updateTokenKeys` does not currently support KeyLists, making it impossible to update token keys with multiple signatories directly on-chain. This limitation creates a gap in functionality, especially for projects that rely heavily on multi-signature control within contract environments, such as Axelar's cross-chain integrations.

## Rationale
Supporting KeyLists directly within the `updateTokenKeys` precompile aligns with Hedera’s goal of providing flexible, decentralized token management. By allowing contract-based applications to set KeyLists, developers can enhance security and improve token access controls within contract-managed tokens, without needing to rely on external SDK calls or workarounds.

## User Stories
1. **As a developer** managing a cross-chain bridge, I want to use KeyLists to control token keys, allowing multiple signatories to authorize key updates through HTS precompiles.
2. **As a DApp creator**, I want to assign a KeyList as the supply key for my token, using a threshold mechanism to ensure decentralized control over supply adjustments.
3. **As a DAO member**, I want to update token keys on-chain using a KeyList to allow multi-signature voting for key management.

## Specification
The following update is proposed to the HTS `updateTokenKeys` precompile function:

### Updated `updateTokenKeys` Precompile Function
Add support for `KeyList` types within `IHederaTokenService.TokenKey[]` in the `updateTokenKeys` function. The following example demonstrates how a KeyList parameter should be accepted by the precompile:

```solidity
/// Operation to update token keys with KeyList support
/// @param token The token address
/// @param keys The token keys, including KeyLists for multi-key support
/// @return responseCode The response code for the status of the request. SUCCESS is 22.
function updateTokenKeys(
    address token,
    IHederaTokenService.TokenKey[] memory keys
) internal returns (int64 responseCode) {
    (bool success, bytes memory result) = precompileAddress.call(
        abi.encodeWithSelector(
            IHederaTokenService.updateTokenKeys.selector,
            token,
            keys
        )
    );
    (responseCode) = success
        ? abi.decode(result, (int32))
        : HederaResponseCodes.UNKNOWN;
}

Example Usage: 

IHederaTokenService.TokenKey memory key = IHederaTokenService.TokenKey({
    keyType: KeyType.SUPPLY,
    key: KeyList({
        keys: [
            Key(KeyType.ECDSA_SECP256K1, ecdsaPublicKey1),
            Key(KeyType.CONTRACT_ID, contractId2)
        ],
        threshold: 2
    })
});

IHederaTokenService.updateTokenKeys(token, [key]);
```


## Backwards Compatibility
No forseen issues

## Security Implications
Supporting KeyLists in the HTS precompiles introduces new security considerations. It will be necessary to ensure that all keys within a KeyList are validated correctly and that threshold requirements are rigorously enforced to prevent unauthorized transactions.

## How to Teach This
This enhancement should be documented in the Hedera developer documentation, with examples on how to set KeyLists for token keys using the HTS precompiles.

## Reference Implementation
A reference implementation will be provided within the Hedera SDK to allow developers to use KeyLists within HTS precompiles, ensuring compatibility with both contract-based and SDK token operations.

## Rejected Ideas
External SDK Workarounds: Using SDK calls outside of the smart contract was considered but found impractical for fully on-chain applications.

## Open Issues
1. 
2. 
