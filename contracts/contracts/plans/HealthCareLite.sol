// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/PolicyBase.sol";

contract HealthCareLite is PolicyBase {
    uint256 private constant DURATION = 365 days;
    
    mapping(bytes32 => uint256) private claimAmounts;
    
    event PremiumCalculated(bytes32 indexed policyId, address indexed user, uint256 premium);
    event PolicyRenewed(bytes32 indexed policyId, address indexed owner, uint256 premium, uint256 newExpiry);
  
    constructor(address payable _vaultAddress) 
        PolicyBase(_vaultAddress) {}
    
    function _processPolicyData(bytes32 policyId) internal override {
        claimAmounts[policyId] = 0;
    }
    
    // 🔧 FIX: ONE PURCHASE FUNCTION ONLY - duration always fixed to 365 days
    function purchasePolicy(
        address owner,
        uint256 premium,
        uint256 sumAssured,
        uint256 /* duration ignored - always 365 days */
    ) public payable override returns (bytes32) {
        bytes32 policyId = super.purchasePolicy(owner, premium, sumAssured, DURATION);
        emit PremiumCalculated(policyId, owner, premium);
        return policyId;
    }
    
    // 🗑️ DELETE purchaseHealthPolicy - ไม่ต้องการแล้ว
    
    function fileAndApproveClaim(bytes32 policyId, uint256 amount) 
        public override returns (uint256) {
        
        require(hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        require(policies[policyId].policyId != 0, "Policy does not exist");
        
        uint256 totalClaimed = claimAmounts[policyId] + amount;
        require(totalClaimed <= policies[policyId].sumAssured, "Exceeds coverage");
        
        uint256 result = super.fileAndApproveClaim(policyId, amount);
        
        claimAmounts[policyId] += amount;
        
        // Health-specific: Don't terminate if still has coverage
        if (claimAmounts[policyId] < policies[policyId].sumAssured) {
            policies[policyId].isActive = true;
            policies[policyId].isClaimed = false;
        }
        
        return result;
    }
    
    function cancelPolicy(
        bytes32 policyId, 
        uint256 refundAmount
    ) public override onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        
        policy.isActive = false;
        vault.sendRefund(payable(policy.owner), refundAmount);

        emit PolicyCancelled(policyId, policy.owner, refundAmount);
    }

    function renewPolicy(
        bytes32 policyId,
        uint256 premium
    ) external payable {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        require(msg.value == premium, "Wrong premium");
        
        (bool sent,) = address(vault).call{value: msg.value}("");
        require(sent, "Vault transfer failed");
        
        policy.premium = premium;
        claimAmounts[policyId] = 0;
        policy.expiry = block.timestamp + DURATION;
        policy.isClaimed = false;
        
        emit PolicyRenewed(policyId, policy.owner, premium, policy.expiry);
    }
    
    // Helper functions
    function getRemainingCoverage(bytes32 policyId) public view returns (uint256) {
        Policy memory policy = policies[policyId];
        if (!policy.isActive) return 0;
        
        uint256 claimed = claimAmounts[policyId];
        return claimed >= policy.sumAssured ? 0 : policy.sumAssured - claimed;
    }
    
    function getTotalClaimed(bytes32 policyId) external view returns (uint256) {
        return claimAmounts[policyId];
    }
    
    function calculateRefund(bytes32 policyId) public view returns (uint256) {
        Policy memory p = policies[policyId];
        if (!p.isActive || block.timestamp >= p.expiry) return 0;
        
        uint256 unusedDuration = p.expiry - block.timestamp;
        uint256 totalDuration = p.expiry - p.createdAt;
        if (totalDuration == 0) return 0;
        
        return (p.premium * unusedDuration) / totalDuration;
    }
}