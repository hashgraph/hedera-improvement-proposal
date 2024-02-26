---
hip: <HIP number (this is determined by the HIP editor)>
title: Proxy Redirect Contract for Hbar Allowance and Approval
author: Luke Lee <@lukelee-sl>
working-group: Nana Essilfie-Conduah <@nana-ec>
type: Standards Track 
category: Service
needs-council-approval: Yes
status: <Draft | Review | Last Call | Active | Inactive | Deferred | Rejected | Withdrawn | Accepted | Final | Replaced>
created: 2024-02-23
discussions-to: <a URL pointing to the official discussion thread>
updated: 
requires: 632
---

## Abstract

The Smart Contract service provides for functionality to grant allowance and approve for tokens from the owner account to a spender account.
However, currently there is no functionality to grant allowance and approve for hbars from an owner account via the Smart Contract service.
This HIP proposes to remedy this omission.

## Motivation

Smart Contracts developers have obstructions on implementing certain potential use cases for transferring hbar between accounts because there is no way to grant allowance and approve for them from an owner account without using HAPI.
Providing this functionality will remove these obstructions for developers and provide for a better developer experience.

## Rationale

This HIP proposes to add the needed functionality via a new interface `IHRC632` which will act on an account address.  The account will be the actor in view with respect to the allowance to the `spender` account for the specified amount.  
An alternative approach would be to introduce a new interface which a contract can implement.  This would necessitate that a contract be deployed which may always be desired.  In addition, taking this approach would potentially require violating the
smart contracts security model as the sender of the frame when executing the system contract would be the deployed contract and not the EOA which would not be desire in most cases.

## User stories

1. As a smart contract developer, I want to be able to grant approve an allowance for hbars from an EOA to a spender account or contract.
2. As a smart contract developer, I want to be able to grant approve an allowance for hbars from a contract to a spender account or contract.
3. As a smart contract developer, I want to be able to get the allowance of hbars from an owner account to a spender account or contract.

## Specification

HIP-632 proposes an introduction of a new system contract for accessing Hedera account functionality (Hedera Account Service - HAS).
This HIP extends the new system contract to another related interface `IHRC632` to support the `hbarAllowance` and `hbarApprove` functions.
The `hbarAllowance` function will be used to retrieve information about allowance granted to a spender and the `hbarApprove` function will allow the sender to grant to the `spender` an allowance of hbars.


Similar to the way redirection to a proxy contract during EVM execution for tokens works [see HIP-719](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-719.md),
this HIP proposes to introduce a new proxy contract for accounts.  During EVM execution, if the target of the current frame is an account, a call to a proxy contract will be created and the current calldata will be injected into 
the proxy contract for processing by the Hedera Account Service system contract.

The bytecode for the proxy contract can be created by compiling the following contract:

```solidity
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;
contract Assembly {
	fallback() external {
		address precompileAddress = address(0x167);
		assembly {
			mstore(0, 0xFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFEFE)
			calldatacopy(32, 0, calldatasize())
			let result := delegatecall(gas(), precompileAddress, 8, add(24, calldatasize()), 0, 0)
			let size := returndatasize()
			returndatacopy(0, 0, size)
			switch result
				case 0 { revert(0, size) }
				default { return(0, size) }
		}
	}
}
```

The following table describes the function selector for the new `hbarAllownace` and `hbarApprove` functions and the associated function signature and response.

| Function Selector Hash | Function Signature                          | Response                                                                  | 
|------------------------|---------------------------------------------|---------------------------------------------------------------------------|
| 0xbbee989e             | hbarAllowance(address spender)              | (ResponseCode, int256 - amount of hbar allowances granted to the spender) | 
| 0x86aff07c             | hbarApprove(spender address, amount int256) | ResponseCode                                                              |

The solidity interface for IHRC632 will be the following

```
interface IHRC632 {
    function hbarAllowance(address spender) external returns (responseCode, int256);
    function hbarApprove(spender address, amount int256) external returns (responseCode);
}
```

Once the above functionality has been implemented in services, an EOA will be able to call the `hbarAllownace` and `hbarApprove` functions as follows:

```
IHRC(accountAddress).hbarAllowance(address spender)
IHRC(accountAddress).hbarApprove(spender address, amount int256)
```


## Backwards Compatibility

As this is new functionality there is no concern for backwards compatibility.

## Security Implications

Granting an allowance to a spender account or contract opens up the owner to possible unwanted loss of hbars and thus security considerations must be paramount 
when implementing this functionality.  Thorough testing will be required to ensure that only the intended spender account or contract can spend the owners hbars.

## How to Teach This

The `hbarAllowance` and `hbarApprove` functions can be accessed by an EOA or a contract by calling the `IHRC` interface as described above.  This enhances the functionality and use cases
available to the smart contract developer.

## Rejected Ideas

The idea of introducing this functionality to the IHederaAccountService interface directly was discarded as this would require that a contract be deployed which may not always be desired.  Due to security considerations, doing so would make the functionality less than useful.

## Open Issues

## References

[HIP-632](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-632.md)
[HIP-719](https://github.com/hashgraph/hedera-improvement-proposal/blob/main/HIP/hip-719.md)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
