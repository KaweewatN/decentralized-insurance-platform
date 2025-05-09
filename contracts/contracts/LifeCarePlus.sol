// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyBase.sol";
import "./PriceOracle.sol";
import "./InsuranceVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title LifeCarePlus
/// @notice Advanced life insurance policy with dynamic premium logic and 99-year term
/// @dev Based on LifeGuard99 with refined event handling and clearer logic for policy management
contract LifeCarePlus is PolicyBase, Ownable {
    uint256 private constant DURATION = 99 * 365 days;

    PriceOracle public oracle;
    InsuranceVault public vault;

    event OracleUpdated(address newOracle);
    event PremiumCalculated(address indexed user, uint256 premium);
    event PolicyRenewed(address indexed user, uint256 newExpiry);

    constructor(address _owner, address _oracle, address _vault) Ownable(_owner) {
        require(_oracle != address(0), "Invalid oracle address");
        require(_vault != address(0), "Invalid vault address");
        oracle = PriceOracle(_oracle);
        vault = InsuranceVault(payable(_vault));
    }

    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "Invalid oracle");
        oracle = PriceOracle(_oracle);
        emit OracleUpdated(_oracle);
    }

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
        require(msg.value == premium, "Incorrect premium amount");

        // 🔐 Transfer to Vault
        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "Vault transfer failed");

        userProfiles[user] = UserProfile(fullName, age, gender, occupation, contactInfo, user);
        policies[user] = Policy(premium, sumAssured, 0, block.timestamp + DURATION, true);

        emit PremiumCalculated(user, premium);
        emit PolicyPurchased(user, premium, sumAssured);
    }

    function previewPremium(
        uint8 age,
        string memory gender,
        string memory occupation,
        uint256 sumAssured,
        address
    ) external view override returns (uint256) {
        return calculatePremium(age, gender, occupation, sumAssured);
    }

    function calculatePremium(
        uint8 age,
        string memory gender,
        string memory occupation,
        uint256 sumAssured
    ) public view returns (uint256) {
        uint256 ethPerThb = oracle.ethPerThb();
        require(ethPerThb > 0, "ETH/THB rate not set");

        uint256 baseThbPremium = 1000;
        if (age < 25) baseThbPremium += 200;
        else if (age > 60) baseThbPremium += 300;

        if (keccak256(bytes(gender)) == keccak256(bytes("female"))) {
            baseThbPremium -= 100;
        }

        if (keccak256(bytes(occupation)) == keccak256(bytes("pilot"))) {
            baseThbPremium += 500;
        }

        uint256 totalThb = (baseThbPremium * sumAssured) / 100_000;
        return (totalThb * ethPerThb) / 1e18;
    }

    function renewPolicy(address user, uint256 premium) external payable override {
        Policy storage p = policies[user];
        require(block.timestamp >= p.expiry, "Policy not yet expired");
        require(msg.value == premium, "Incorrect premium");

        // 🔐 Transfer to Vault
        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "Vault transfer failed");

        p.premium = premium;
        p.expiry = block.timestamp + DURATION;
        p.isActive = true;

        emit PolicyRenewed(user, p.expiry);
        emit PolicyPurchased(user, premium, p.sumAssured);
    }

    function cancelPolicy(address user) external override {
        policies[user].isActive = false;
        emit RefundIssued(user, 0);
    }

    function fileClaim(address user, uint256 amount, string memory documentHash) external override {
        Policy storage p = policies[user];
        require(p.isActive && block.timestamp < p.expiry, "Policy inactive or expired");
        require(amount > 0 && amount <= p.sumAssured - p.claimAmount, "Invalid claim");
        require(!claims[user].isPending, "Pending claim exists");

        claims[user] = ClaimRequest(amount, documentHash, true);
        emit ClaimFiled(user, amount, documentHash);
    }

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
}
