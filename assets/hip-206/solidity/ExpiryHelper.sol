// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./HederaTokenService.sol";
import "./FeeHelper.sol";

contract ExpiryHelper is FeeHelper {

    function getAutoRenewExpiry(
        address autoRenewAccount,
        uint32 autoRenewPeriod
    ) internal view returns (IHederaTokenService.Expiry memory expiry) {
        expiry.autoRenewAccount = autoRenewAccount;
        expiry.autoRenewPeriod = autoRenewPeriod;
    }

    function getSecondExpiry(uint32 second) internal view returns (IHederaTokenService.Expiry memory expiry) {
        expiry.second = second;
    }
}