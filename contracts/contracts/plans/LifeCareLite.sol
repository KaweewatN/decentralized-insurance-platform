// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/PolicyBase.sol";

/// @title LifeCareLite - ULTRA SIMPLE VERSION
/// @notice Life insurance: single claim terminates policy
contract LifeCareLite is PolicyBase {
    uint256 private constant MAX_DURATION = 80 * 365 days;
    
    event PremiumCalculated(bytes32 indexed policyId, address indexed user, uint256 premium);

    constructor(address payable _vaultAddress) 
        PolicyBase(_vaultAddress) {}

    function _processPolicyData(bytes32) internal override {}
    
    /// @notice Admin purchases life policy
    function purchasePolicy(
        address owner,
        uint256 premium,
        uint256 sumAssured,
        uint256 duration
    ) public payable override returns (bytes32) {
        require(duration <= MAX_DURATION, "Duration too long");
        
        bytes32 policyId = super.purchasePolicy(owner, premium, sumAssured, duration);
        emit PremiumCalculated(policyId, owner, premium);
        
        return policyId;
    }
    
    /// @notice Calculate refund for life policy
    function calculateRefund(bytes32 policyId) public view returns (uint256) {
        Policy memory p = policies[policyId];
        if (!p.isActive || block.timestamp >= p.expiry) return 0;
        
        uint256 unusedDuration = p.expiry - block.timestamp;
        uint256 totalDuration = p.expiry - p.createdAt;
        
        if (totalDuration == 0) return 0;
        return (p.premium * unusedDuration) / totalDuration;
    }

        /// @notice Cancel life policy with refund
    function cancelPolicy(
        bytes32 policyId, 
        uint256 refundAmount
    ) public override onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        require(!policy.isClaimed, "Policy already claimed");
        
        policy.isActive = false;
        vault.sendRefund(payable(policy.owner), refundAmount);
        
        emit PolicyCancelled(policyId, policy.owner, refundAmount);
    }
    
    /// @notice 
    function renewPolicy(bytes32, uint256) external payable {
        revert("No renewals");
    }
}