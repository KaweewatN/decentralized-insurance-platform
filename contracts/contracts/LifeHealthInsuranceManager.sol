// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyBase.sol";
import "./LifeCarePlus.sol";
import "./LifeCareLite.sol";
import "./HealthCarePlus.sol";
import "./HealthCareLite.sol";
import "./InsuranceVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title LifeHealthInsuranceManager
/// @notice Central manager for both Life and Health insurance policies with fund control via InsuranceVault
/// @dev Supports multiple plans via unified logic and enum switching; vault handles ETH custody and payouts

contract LifeHealthInsuranceManager is Ownable {
    enum PlanType {
        None,
        LifeCarePlus,
        LifeCareLite,
        HealthCarePlus,
        HealthCareLite
    }

    mapping(address => PlanType) public userPlan;

    PolicyBase public lifeCarePlus;
    PolicyBase public lifeCareLite;
    PolicyBase public healthCarePlus;
    PolicyBase public healthCareLite;
    InsuranceVault public vault;

    event PolicyPurchased(address indexed user, PlanType plan, uint256 sumAssured);
    event PolicyRenewed(address indexed user);
    event PolicyCanceled(address indexed user, uint256 refund);
    event ClaimSubmitted(address indexed user, uint256 amount, string documentHash);
    event ClaimApproved(address indexed user, uint256 payout);

    constructor(
        address _owner,
        address _lifeCarePlus,
        address _lifeCareLite,
        address _healthCarePlus,
        address _healthCareLite,
        address _vault
    ) Ownable(_owner) {
        lifeCarePlus = PolicyBase(_lifeCarePlus);
        lifeCareLite = PolicyBase(_lifeCareLite);
        healthCarePlus = PolicyBase(_healthCarePlus);
        healthCareLite = PolicyBase(_healthCareLite);
        vault = InsuranceVault(payable(_vault));
    }

    function previewPremiumForPlan(
        PlanType plan,
        uint8 age,
        string memory gender,
        string memory occupation,
        uint256 sumAssured,
        address user
    ) external view returns (uint256) {
        return _getPlanInstance(plan).previewPremium(age, gender, occupation, sumAssured, user);
    }

    function purchase(
        PlanType plan,
        string memory fullName,
        uint8 age,
        string memory gender,
        string memory occupation,
        string memory contactInfo,
        uint256 sumAssured
    ) external payable {
        require(plan != PlanType.None, "Invalid plan");
        PolicyBase instance = _getPlanInstance(plan);
        instance.purchasePolicy{value: msg.value}(
            msg.sender, fullName, age, gender, occupation, contactInfo, sumAssured
        );
        userPlan[msg.sender] = plan;

        // Send ETH to vault
        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "Failed to forward to vault");

        emit PolicyPurchased(msg.sender, plan, sumAssured);
    }

    function renew() external payable {
        PlanType plan = userPlan[msg.sender];
        require(
            plan == PlanType.LifeCarePlus || plan == PlanType.HealthCarePlus,
            "Plan not renewable"
        );

        _getPlanInstance(plan).renewPolicy{value: msg.value}(msg.sender, msg.value);

        // Send ETH to vault
        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "Failed to forward to vault");

        emit PolicyRenewed(msg.sender);
    }

    function cancelAndRefund() external {
        PlanType plan = userPlan[msg.sender];
        require(plan != PlanType.None, "No active plan");

        PolicyBase instance = _getPlanInstance(plan);
        uint256 refund = instance.calculateRefund(msg.sender);
        instance.cancelPolicy(msg.sender);
        require(refund > 0, "No refund available");

        vault.issueRefund(payable(msg.sender), refund);
        emit PolicyCanceled(msg.sender, refund);
    }

    function fileClaim(uint256 amount, string memory documentHash) external {
        PlanType plan = userPlan[msg.sender];
        require(plan != PlanType.None, "No active plan");

        _getPlanInstance(plan).fileClaim(msg.sender, amount, documentHash);
        emit ClaimSubmitted(msg.sender, amount, documentHash);
    }

    function approveClaim(address user) external onlyOwner {
        PlanType plan = userPlan[user];
        require(plan != PlanType.None, "No active plan");

        uint256 payout = _getPlanInstance(plan).approveClaim(user);
        require(payout > 0, "Nothing to pay");

        vault.approveClaim(payable(user), payout);
        emit ClaimApproved(user, payout);
    }

    function getPolicy(address user) external view returns (PolicyBase.Policy memory) {
        return _getPlanInstance(userPlan[user]).getPolicy(user);
    }

    function getClaim(address user) external view returns (PolicyBase.ClaimRequest memory) {
        return _getPlanInstance(userPlan[user]).getClaim(user);
    }

    function getUserProfile(address user) external view returns (PolicyBase.UserProfile memory) {
        return _getPlanInstance(userPlan[user]).getUserProfile(user);
    }

    function _getPlanInstance(PlanType plan) internal view returns (PolicyBase) {
        if (plan == PlanType.LifeCarePlus) return lifeCarePlus;
        if (plan == PlanType.LifeCareLite) return lifeCareLite;
        if (plan == PlanType.HealthCarePlus) return healthCarePlus;
        if (plan == PlanType.HealthCareLite) return healthCareLite;
        revert("Unknown plan");
    }
}
