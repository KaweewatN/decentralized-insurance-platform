// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyBase.sol";
import "./PriceOracle.sol";
import "./InsuranceVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title HealthCareLite
/// @notice Entry-level health insurance contract with annual maximum coverage and basic hospitalization benefits
/// @dev Inherits from PolicyBase. Implements logic for annual health insurance plan (non-lifetime).
///      - Premiums are dynamically calculated based on age, gender, and occupation using ETH/THB oracle
///      - Refunds are prorated based on remaining coverage time
///      - Uses event-driven logging for auditability
///      - Access control enforced via Ownable
contract HealthCareLite is PolicyBase, Ownable {
    uint256 private constant DURATION = 365 days;

    PriceOracle public oracle;
    InsuranceVault public vault;

    event OracleUpdated(address newOracle);
    event PremiumCalculated(address indexed user, uint256 premium);
    event PolicyRenewed(address indexed user, uint256 newExpiry);

    constructor(address _owner, address _oracle, address _vault) Ownable(_owner) {
        require(_oracle != address(0), "Invalid oracle");
        require(_vault != address(0), "Invalid vault");
        oracle = PriceOracle(_oracle);
        vault = InsuranceVault(payable(_vault));
    }

    /// @notice Admin-only function to update the oracle
    /// @dev Follows Access Control pattern using onlyOwner modifier
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = PriceOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

    /// @notice Purchase a new policy
    /// @dev Validates premium payment and creates new policy struct
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

        // ✅ Send to vault
        (bool sent, ) = payable(address(vault)).call{value: msg.value}("");
        require(sent, "Vault transfer failed");

        userProfiles[user] = UserProfile(fullName, age, gender, occupation, contactInfo, user);
        policies[user] = Policy(premium, sumAssured, 0, block.timestamp + DURATION, true);

        emit PremiumCalculated(user, premium);
        emit PolicyPurchased(user, premium, sumAssured);
    }

    /// @notice Renew an expired policy
    /// @dev Part of Guard Check pattern to ensure expired policy can be renewed
    function renewPolicy(address user, uint256 premium) external payable override {
        Policy storage p = policies[user];
        require(block.timestamp >= p.expiry, "Policy not yet expired");
        require(msg.value == premium, "Incorrect premium");

        // ✅ Send to vault
        (bool sent, ) = payable(address(vault)).call{value: msg.value}("");
        require(sent, "Vault transfer failed");

        p.premium = premium;
        p.expiry = block.timestamp + DURATION;
        p.isActive = true;

        emit PolicyRenewed(user, p.expiry);
        emit PolicyPurchased(user, premium, p.sumAssured);
    }

    /// @notice Cancel the policy
    /// @dev Disables active policy but does not process refund (manual fallback)
    function cancelPolicy(address user) external override {
        policies[user].isActive = false;
        emit RefundIssued(user, 0);
    }

    /// @notice File a claim for medical coverage
    /// @dev Implements Guard Checks to ensure claim validity
    function fileClaim(address user, uint256 amount, string memory documentHash) external override {
        Policy storage p = policies[user];
        require(p.isActive && block.timestamp < p.expiry, "Policy inactive or expired");
        require(amount > 0 && amount <= p.sumAssured - p.claimAmount, "Invalid claim");
        require(!claims[user].isPending, "Pending claim exists");

        claims[user] = ClaimRequest(amount, documentHash, true);
        emit ClaimFiled(user, amount, documentHash);
    }

    /// @notice Approve a pending claim and record payout
    /// @dev Access Control via onlyOwner. Event-driven logging for transparency
    function approveClaim(address user) external override onlyOwner returns (uint256) {
        ClaimRequest storage c = claims[user];
        Policy storage p = policies[user];

        require(c.isPending, "No pending claim");
        c.isPending = false;
        p.claimAmount += c.amount;

        // ✅ Payout from vault
        vault.approveClaim(payable(user), c.amount);

        emit ClaimApproved(user, c.amount);
        return c.amount;
    }

    /// @notice Calculate refundable premium
    /// @dev Follows Refund Pattern (prorated logic)
    function calculateRefund(address user) external view override returns (uint256) {
        Policy memory p = policies[user];
        if (!p.isActive || block.timestamp >= p.expiry) return 0;
        return (p.premium * (p.expiry - block.timestamp)) / DURATION;
    }

    /// @notice View policy details
    function getPolicy(address user) external view override returns (Policy memory) {
        return policies[user];
    }

    /// @notice View claim details
    function getClaim(address user) external view override returns (ClaimRequest memory) {
        return claims[user];
    }

    /// @notice View profile details
    function getUserProfile(address user) external view override returns (UserProfile memory) {
        return userProfiles[user];
    }

    /// @notice Calculate premium using profile data
    /// @dev Applies a simple risk-based pricing model using THB base premium and oracle
    function calculatePremium(
        uint8 age,
        string memory gender,
        string memory occupation,
        uint256 sumAssured
    ) public view returns (uint256) {
        uint256 ethPerThb = oracle.ethPerThb();
        require(ethPerThb > 0, "ETH/THB not set");

        uint256 baseThbPremium = 1200;
        if (age < 18) baseThbPremium += 200;
        else if (age > 60) baseThbPremium += 400;

        if (keccak256(bytes(gender)) == keccak256(bytes("female"))) {
            baseThbPremium -= 100;
        }

        if (keccak256(bytes(occupation)) == keccak256(bytes("construction"))) {
            baseThbPremium += 300;
        }

        uint256 totalThb = (baseThbPremium * sumAssured) / 100_000;
        return (totalThb * ethPerThb) / 1e18;
    }

    /// @notice Preview premium without committing to purchase
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
