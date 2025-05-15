// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/PolicyBase.sol";
import "../utils/InsuranceVault.sol";

/// @title HealthCareLite
/// @notice Entry-level health insurance contract with annual maximum coverage and basic hospitalization benefits
/// @dev Extends PolicyBase for core functionality with signature verification and vault integration
contract HealthCareLite is PolicyBase {
    // Standard policy duration (1 year)
    uint256 private constant DURATION = 365 days;
    
    // Additional storage for health policy specific data
    mapping(bytes32 => uint256) private claimAmounts; // Track claim amounts separately
    
    // Events
    event PremiumCalculated(bytes32 indexed policyId, address indexed user, uint256 premium);
    event ClaimTransferred(bytes32 indexed policyId, address indexed beneficiary, uint256 amount);
    event PolicyRefunded(bytes32 indexed policyId, address indexed owner, uint256 refundAmount);
  
    
    /// @dev Constructor passes parameters to PolicyBase
    constructor(address _trustedSigner, address payable _vaultAddress) 
        PolicyBase(_trustedSigner, _vaultAddress) 
    {
        // No additional initialization needed
    }
    
    /// @notice Process policy-specific data (minimal implementation)
    function _processPolicyData(bytes32 policyId) internal override {
        claimAmounts[policyId] = 0;
    }
    
    /// @notice Purchase policy with ETH payment and backend signature verification
    function purchaseHealthPolicy(
        address owner,
        uint256 premium,
        uint256 sumAssured,
        uint256 /* duration */,  
        bytes memory signature
    ) public payable {
        uint256 actualDuration = DURATION;
        bytes32 policyId = super.purchasePolicy(owner, premium, sumAssured, actualDuration, signature);
        // ไม่ต้องโอนเงินซ้ำ เพราะ PolicyBase.purchasePolicy จะโอนให้แล้ว
        emit PremiumCalculated(policyId, owner, premium);
    }
    
    /// @notice Admin approves claim and transfers funds from vault
    function approveClaim(bytes32 policyId) 
        public 
        override
        onlyRole(ADMIN_ROLE) 
        validPolicy(policyId)
        returns (uint256) 
    {
        ClaimRequest storage claim = claims[policyId];
        Policy storage policy = policies[policyId];
        require(claim.isPending, "No pending claim");
        require(block.timestamp <= claim.expiryTimestamp, "Claim request expired");
        
        claim.isPending = false;
        claimAmounts[policyId] += claim.amount;
        
        if (claimAmounts[policyId] >= policy.sumAssured) {
            policy.isActive = false;
            policy.isClaimed = true;
        }
        
        // เรียกใช้ vault ที่ได้รับมาจาก PolicyBase
        vault.approveClaim(payable(policy.owner), claim.amount);
        
        emit ClaimApproved(policyId, policy.owner, claim.amount);
        emit ClaimTransferred(policyId, policy.owner, claim.amount);
        return claim.amount;
    }
    
    /// @notice Get remaining coverage for a policy
    function getRemainingCoverage(bytes32 policyId) public view returns (uint256) {
        Policy memory policy = policies[policyId];
        if (!policy.isActive) return 0;
        uint256 claimed = claimAmounts[policyId];
        if (claimed >= policy.sumAssured) return 0;
        return policy.sumAssured - claimed;
    }
    
    /// @notice Calculate refund based on unused duration
    function calculateRefund(bytes32 policyId) public view returns (uint256) {
        Policy memory p = policies[policyId];
        if (!p.isActive || block.timestamp >= p.expiry) return 0;
        uint256 unusedDuration = p.expiry - block.timestamp;
        uint256 totalDuration = p.expiry - p.createdAt;
        if (totalDuration == 0) return 0;
        return (p.premium * unusedDuration) / totalDuration;
    }
    
    /// @notice HealthCareLite supports yearly renewals
    function renewPolicy(
        bytes32 policyId,
        uint256 premium,
        uint256 /* duration */,
        bytes memory signature
    ) external payable override {
        Policy storage policy = policies[policyId];
        require(policy.owner == msg.sender, "Not the policy owner");
        require(policy.isActive, "Policy not active");
        require(!policy.isClaimed, "Policy fully claimed");
        require(msg.value == premium, "Incorrect premium amount");
        require(
            block.timestamp >= policy.expiry || policy.expiry - block.timestamp <= 30 days,
            "Too early to renew"
        );
        
        uint256 actualDuration = DURATION;
        
        // Consistent parameter ordering for messageHash
        bytes32 messageHash = keccak256(
            abi.encodePacked(policyId, policy.owner, premium, actualDuration, block.chainid)
        );
        
        require(verifySignature(messageHash, signature), "Invalid signature");
        usedSignatures[keccak256(signature)] = true;
        
        // เรียกใช้ vault ที่ได้รับมาจาก PolicyBase
        (bool sent,) = address(vault).call{value: msg.value}("");
        require(sent, "Vault transfer failed");
        
        policy.premium = premium;
        claimAmounts[policyId] = 0;
        policy.expiry = block.timestamp + actualDuration;
        
        emit PolicyRenewed(policyId, policy.owner, policy.premium, policy.expiry);
    }
    
    /// @notice Cancel policy with refund
    function cancelPolicy(
        bytes32 policyId,
        uint256 refundAmount,
        bytes memory signature
    ) public override onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        require(!policy.isClaimed, "Policy already claimed");
        
        // Consistent parameter ordering for messageHash
        bytes32 messageHash = keccak256(
            abi.encodePacked(policyId, policy.owner, refundAmount, uint256(0), block.chainid)
        );
        
        require(verifySignature(messageHash, signature), "Invalid signature");
        usedSignatures[keccak256(signature)] = true;
        
        policy.isActive = false;
        
        // เรียกใช้ vault ที่ได้รับมาจาก PolicyBase
        vault.sendRefund(payable(policy.owner), refundAmount);
        
        emit PolicyCancelled(policyId, policy.owner, refundAmount);
        emit PolicyRefunded(policyId, policy.owner, refundAmount);
    }
}