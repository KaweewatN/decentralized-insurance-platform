// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyBase.sol";
import "./PriceOracle.sol";
import "./InsuranceVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title LifeCareLite
/// @notice Life insurance plan with fixed maturity (80 years) and simplified premium structure
/// @dev Follows PolicyBase. Implements:
///      - Non-renewable behavior (fixed 80-year term)
///      - Oracle-based premium conversion (THB to ETH)
///      - Event-driven transparency & access control via Ownable
contract LifeCareLite is PolicyBase, Ownable {
    uint256 private constant DURATION = 80 * 365 days;

    PriceOracle public oracle;
    InsuranceVault public vault;

    event OracleUpdated(address newOracle);
    event PolicyRenewedRejected(address indexed user);
    event PremiumCalculated(address indexed user, uint256 premium);

    constructor(address _owner, address _oracle, address _vault) Ownable(_owner) {
        require(_oracle != address(0), "Invalid oracle address");
        require(_vault != address(0), "Invalid vault address");
        oracle = PriceOracle(_oracle);
        vault = InsuranceVault(payable(_vault));
    }

    /// @notice Admin-only oracle updater
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle");
        oracle = PriceOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

    /// @notice Purchase policy for a user
    function purchasePolicy(
        address user,
        string memory fullName,
        uint8 age,
        string memory gender,
        string memory occupation,
        string memory contactInfo,
        uint256 sumAssured
    ) external payable override {
        uint256 premium = calculatePremium(age, gender, occupation, sumAssured);
        require(msg.value == premium, "Incorrect premium");

        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "Vault transfer failed");

        userProfiles[user] = UserProfile(fullName, age, gender, occupation, contactInfo, user);
        policies[user] = Policy(premium, sumAssured, 0, block.timestamp + DURATION, true);

        emit PremiumCalculated(user, premium);
        emit PolicyPurchased(user, premium, sumAssured);
    }

    /// @notice This plan is not renewable
    function renewPolicy(address, uint256) external payable override {
        revert("LifeCareLite is not renewable");
    }

    /// @notice Cancel policy
    function cancelPolicy(address user) external override {
        policies[user].isActive = false;
        emit RefundIssued(user, 0);
    }

    /// @notice File claim
    function fileClaim(address user, uint256 amount, string memory documentHash) external override {
        Policy storage p = policies[user];
        require(p.isActive && block.timestamp < p.expiry, "Policy invalid");
        require(amount > 0 && amount <= p.sumAssured - p.claimAmount, "Invalid claim");
        require(!claims[user].isPending, "Pending claim exists");

        claims[user] = ClaimRequest(amount, documentHash, true);
        emit ClaimFiled(user, amount, documentHash);
    }

    /// @notice Admin-only claim approval
    function approveClaim(address user) external override onlyOwner returns (uint256) {
        ClaimRequest storage c = claims[user];
        Policy storage p = policies[user];

        require(c.isPending, "No pending claim");
        c.isPending = false;
        p.claimAmount += c.amount;

        vault.approveClaim(payable(user), c.amount);

        emit ClaimApproved(user, c.amount);
        return c.amount;
    }

    /// @notice Refund based on unused duration
    function calculateRefund(address user) external view override returns (uint256) {
        Policy memory p = policies[user];
        if (!p.isActive || block.timestamp >= p.expiry) return 0;
        return (p.premium * (p.expiry - block.timestamp)) / DURATION;
    }

    function getPolicy(address user) external view override returns (Policy memory) {
        return policies[user];
    }

    function getClaim(address user) external view override returns (ClaimRequest memory) {
        return claims[user];
    }

    function getUserProfile(address user) external view override returns (UserProfile memory) {
        return userProfiles[user];
    }

    /// @notice Risk-based THB premium converted to ETH
    function calculatePremium(
        uint8 age,
        string memory gender,
        string memory occupation,
        uint256 sumAssured
    ) public view returns (uint256) {
        uint256 ethPerThb = oracle.ethPerThb();
        require(ethPerThb > 0, "ETH/THB not set");

        uint256 baseThbPremium = 800;
        if (age < 30) baseThbPremium += 100;
        else if (age > 60) baseThbPremium += 200;

        if (keccak256(bytes(gender)) == keccak256(bytes("female"))) {
            baseThbPremium -= 100;
        }

        if (keccak256(bytes(occupation)) == keccak256(bytes("soldier"))) {
            baseThbPremium += 400;
        }

        uint256 totalThb = (baseThbPremium * sumAssured) / 100_000;
        return (totalThb * ethPerThb) / 1e18;
    }

    function previewPremium(
        uint8 age,
        string memory gender,
        string memory occupation,
        uint256 sumAssured,
        address /* user */
    ) external view override returns (uint256) {
        return calculatePremium(age, gender, occupation, sumAssured);
    }
}
