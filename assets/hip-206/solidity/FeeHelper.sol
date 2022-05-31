// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./KeyHelper.sol";

contract FeeHelper is KeyHelper {

    function createFixedHbarFee(
        uint32 amount,
        address feeCollector
    ) internal pure returns (IHederaTokenService.FixedFee memory fixedFee) {
        fixedFee.amount = amount;
        fixedFee.useHbarsForPayment = true;
        fixedFee.feeCollector = feeCollector;
    }

    function createFixedTokenFee(
        uint32 amount,
        address tokenId,
        address feeCollector
    ) internal pure returns (IHederaTokenService.FixedFee memory fixedFee) {
        fixedFee.amount = amount;
        fixedFee.tokenId = tokenId;
        fixedFee.feeCollector = feeCollector;
    }

    function createFixedSelfDenominatedFee(
        uint32 amount,
        address feeCollector
    ) internal pure returns (IHederaTokenService.FixedFee memory fixedFee) {
        fixedFee.amount = amount;
        fixedFee.useCurrentTokenForPayment = true;
        fixedFee.feeCollector = feeCollector;
    }

    function createFractionalFee(
        uint32 numerator,
        uint32 denominator,
        bool netOfTransfers,
        address feeCollector
    ) internal pure returns (IHederaTokenService.FractionalFee memory fractionalFee) {
        fractionalFee.numerator = numerator;
        fractionalFee.denominator = denominator;
        fractionalFee.netOfTransfers = netOfTransfers;
        fractionalFee.feeCollector = feeCollector;
    }

    function createFractionalFeeWithMinAndMax(
        uint32 numerator,
        uint32 denominator,
        uint32 minimumAmount,
        uint32 maximumAmount,
        bool netOfTransfers,
        address feeCollector
    ) internal pure returns (IHederaTokenService.FractionalFee memory fractionalFee) {
        fractionalFee.numerator = numerator;
        fractionalFee.denominator = denominator;
        fractionalFee.minimumAmount = minimumAmount;
        fractionalFee.maximumAmount = maximumAmount;
        fractionalFee.netOfTransfers = netOfTransfers;
        fractionalFee.feeCollector = feeCollector;
    }

    function createRoyaltyFeeWithoutFallback(
        uint32 numerator,
        uint32 denominator,
        address feeCollector
    ) internal pure returns (IHederaTokenService.RoyaltyFee memory royaltyFee) {
        royaltyFee.numerator = numerator;
        royaltyFee.denominator = denominator;
        royaltyFee.feeCollector = feeCollector;
    }

    function createRoyaltyFeeWithHbarFallbackFee(
        uint32 numerator,
        uint32 denominator,
        uint32 amount,
        address feeCollector
    ) internal pure returns (IHederaTokenService.RoyaltyFee memory royaltyFee) {
        royaltyFee.numerator = numerator;
        royaltyFee.denominator = denominator;
        royaltyFee.amount = amount;
        royaltyFee.useHbarsForPayment = true;
        royaltyFee.feeCollector = feeCollector;
    }

    function createRoyaltyFeeWithTokenDenominatedFallbackFee(
        uint32 numerator,
        uint32 denominator,
        uint32 amount,
        address tokenId,
        address feeCollector
    ) internal pure returns (IHederaTokenService.RoyaltyFee memory royaltyFee) {
        royaltyFee.numerator = numerator;
        royaltyFee.denominator = denominator;
        royaltyFee.amount = amount;
        royaltyFee.tokenId = tokenId;
        royaltyFee.feeCollector = feeCollector;
    }
}