// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyBase.sol";
import "./PriceOracle.sol";
import "./InsuranceVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title HealthCarePlus
/// @notice Comprehensive health insurance plan with broader IPD coverage and extended limits for critical care
/// @dev Implements plan logic including:
///      - Dynamic premium calculation based on user risk profile using ETH/THB oracle
///      - Access control (Ownable) for admin-level claim approvals and oracle updates
///      - Event-driven tracking of policy lifecycle
///      - Guard checks to enforce claim rules and policy states
///      - Refund pattern with prorated premium returns
contract HealthCarePlus is PolicyBase, Ownable {
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

    /// @notice Admin-only function to set a new ETH/THB oracle
    /// @dev Enforces Access Control pattern via onlyOwner
    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = PriceOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

    /// @notice Purchase a new insurance policy
    /// @dev Validates input, calculates premium, and stores policy
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

        userProfiles[user] = UserProfile(fullName, age, gender, occupation, contactInfo, user);
        policies[user] = Policy(premium, sumAssured, 0, block.timestamp + DURATION, true);

        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "Vault deposit failed");

        emit PremiumCalculated(user, premium);
        emit PolicyPurchased(user, premium, sumAssured);
    }

    /// @notice Renew an expired policy
    /// @dev Guard check ensures renewal is after expiry and amount matches
    function renewPolicy(address user, uint256 premium) external payable override {
        Policy storage p = policies[user];
        require(block.timestamp >= p.expiry, "Policy not yet expired");
        require(msg.value == premium, "Incorrect premium");

        p.premium = premium;
        p.expiry = block.timestamp + DURATION;
        p.isActive = true;

        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "Vault deposit failed");

        emit PolicyRenewed(user, p.expiry);
        emit PolicyPurchased(user, premium, p.sumAssured);
    }

    /// @notice Cancel the policy manually
    /// @dev Marks the policy inactive and emits a refund event (amount = 0)
    function cancelPolicy(address user) external override {
        policies[user].isActive = false;
        emit RefundIssued(user, 0);
    }

    /// @notice File a health claim for reimbursement
    /// @dev Implements Guard Check and Event-driven Pattern
    function fileClaim(address user, uint256 amount, string memory documentHash) external override {
        Policy storage p = policies[user];
        require(p.isActive && block.timestamp < p.expiry, "Policy inactive or expired");
        require(amount > 0 && amount <= p.sumAssured - p.claimAmount, "Invalid claim");
        require(!claims[user].isPending, "Pending claim exists");

        claims[user] = ClaimRequest(amount, documentHash, true);
        emit ClaimFiled(user, amount, documentHash);
    }

    /// @notice Approve a pending claim and trigger payout logic
    /// @dev Access Control enforced, logs approval and updates state
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

    /// @notice Calculate the remaining refund (if canceled before expiry)
    /// @dev Refund pattern using prorated logic based on unused days
    function calculateRefund(address user) external view override returns (uint256) {
        Policy memory p = policies[user];
        if (!p.isActive || block.timestamp >= p.expiry) return 0;
        return (p.premium * (p.expiry - block.timestamp)) / DURATION;
    }

    /// @notice Retrieve current policy details for a user
    function getPolicy(address user) external view override returns (Policy memory) {
        return policies[user];
    }

    /// @notice Retrieve current claim status for a user
    function getClaim(address user) external view override returns (ClaimRequest memory) {
        return claims[user];
    }

    /// @notice Retrieve profile information of a user
    function getUserProfile(address user) external view override returns (UserProfile memory) {
        return userProfiles[user];
    }

    /// @notice Calculate premium based on user profile
    /// @dev Oracle Pattern used to get ETH/THB rate; Risk model adjusts based on demographic factors
    function calculatePremium(
        uint8 age,
        string memory gender,
        string memory occupation,
        uint256 sumAssured
    ) public view returns (uint256) {
        require(age >= 1 && age <= 70, "Age not eligible");
        require(sumAssured >= 100_000 && sumAssured <= 300_000, "Sum assured out of range");
        uint256 ethPerThb = oracle.ethPerThb();
        require(ethPerThb > 0, "ETH/THB not set");
        require(sumAssured >= 500_000 && sumAssured <= 1_000_000, "Sum assured out of range");

        uint256 baseThbPremium = 2000;
        if (age < 18) baseThbPremium += 300;
        else if (age > 60) baseThbPremium += 500;

        if (keccak256(bytes(gender)) == keccak256(bytes("female"))) {
            baseThbPremium -= 150;
        }

        if (keccak256(bytes(occupation)) == keccak256(bytes("high-risk"))) {
            baseThbPremium += 600;
        }

        uint256 totalThb = (baseThbPremium * sumAssured) / 100_000;
        return (totalThb * ethPerThb) / 1e18;
    }

    /// @notice View premium estimate before purchase
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
