// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../base/PolicyBase.sol";
import "../utils/InsuranceVault.sol";

/// @title LifeCareLite
/// @notice Life insurance plan with fixed maturity and admin-verified premium structure
/// @dev Extends PolicyBase for core functionality with signature verification and vault integration
contract LifeCareLite is PolicyBase {
    // Maximum policy duration (80 years)
    uint256 private constant MAX_DURATION = 80 * 365 days;
    
    // Events
    event PremiumCalculated(bytes32 indexed policyId, address indexed user, uint256 premium);
    event ClaimTransferred(bytes32 indexed policyId, address indexed beneficiary, uint256 amount);
    event PolicyRefunded(bytes32 indexed policyId, address indexed owner, uint256 refundAmount);
    event RenewalAttemptRejected(bytes32 indexed policyId, address indexed owner);
    
    constructor(address _trustedSigner, address payable _vaultAddress) 
        PolicyBase(_trustedSigner, _vaultAddress) 
    {
        // No additional initialization needed - vault is now managed by PolicyBase
    }

    /// @notice Process policy-specific data (minimal implementation)
    /// @param policyId The ID of the policy
    function _processPolicyData(bytes32 policyId) internal override {
        // Minimal implementation - data is processed off-chain
        // Placeholder for potential future off-chain data integrations
    }
    
    /// @notice Purchase policy with ETH payment and backend signature verification
    /// @param owner Address of the policy owner
    /// @param premium Premium amount calculated by backend
    /// @param sumAssured Sum assured amount
    /// @param duration Policy duration in seconds
    /// @param signature Signature from the backend verifying the parameters
    function purchasePolicy(
        address owner,
        uint256 premium,
        uint256 sumAssured,
        uint256 duration,
        bytes memory signature
    ) public payable override returns (bytes32) {
        require(duration <= MAX_DURATION, "Exceeds maximum duration");
        
        // Call parent implementation to verify signature, create policy, and transfer premium to vault
        bytes32 policyId = super.purchasePolicy(
            owner,
            premium,
            sumAssured,
            duration,
            signature
        );
        
        // No need to transfer premium to vault again - it's handled in the parent method
        
        // Use the actual policy ID returned from the parent contract
        emit PremiumCalculated(
            policyId, 
            owner, 
            premium
        );
        
        return policyId;  // Return the policy ID
    }
    
    /// @notice Admin approves claim and transfers funds from vault
    /// @param policyId The ID of the policy
    function approveClaim(bytes32 policyId) 
        public 
        override
        onlyRole(ADMIN_ROLE) 
        validPolicy(policyId)
        returns (uint256) 
    {
        // Get claim information
        ClaimRequest storage claim = claims[policyId];
        Policy storage policy = policies[policyId];
        
        require(claim.isPending, "No pending claim");
        require(block.timestamp <= claim.expiryTimestamp, "Claim request expired");
        
        // Mark claim as processed
        claim.isPending = false;
        policy.isClaimed = true;
        policy.isActive = false;
        
        // Use vault from PolicyBase
        vault.approveClaim(payable(policy.owner), claim.amount);
        
        emit ClaimApproved(policyId, policy.owner, claim.amount);
        emit ClaimTransferred(policyId, policy.owner, claim.amount);
        
        return claim.amount;
    }
    
    /// @notice Calculate refund based on unused duration (pure calculation)
    /// @param policyId ID of the policy
    /// @return Refund amount
    function calculateRefund(bytes32 policyId) public view returns (uint256) {
        Policy memory p = policies[policyId];
        if (!p.isActive || block.timestamp >= p.expiry) return 0;
        
        // Calculate unused duration as a fraction
        uint256 unusedDuration = p.expiry - block.timestamp;
        uint256 totalDuration = p.expiry - p.createdAt;
        
        if (totalDuration == 0) return 0; // Avoid division by zero if policy created and expires in same block

        // Calculate refund proportional to unused duration
        return (p.premium * unusedDuration) / totalDuration;
    }
    
    /// @notice This plan does not support renewal (parameters intentionally unused)
    function renewPolicy(
        bytes32 /*policyId*/,
        uint256 /*premium*/,
        uint256 /*duration*/,
        bytes memory /*signature*/
    ) external payable override {
        emit RenewalAttemptRejected(keccak256(abi.encodePacked(msg.sender, block.timestamp)), msg.sender);
        revert("LifeCareLite does not support renewals");
    }
    
    /// @notice Override cancelPolicy to use the vault for refunds 
    /// @param policyId ID of the policy 
    /// @param refundAmount Amount to refund 
    /// @param signature Signature from trusted signer approving the refund
    function cancelPolicy(
        bytes32 policyId,
        uint256 refundAmount,
        bytes memory signature
    ) public override onlyRole(ADMIN_ROLE) validPolicy(policyId) {
        // Get the policy from storage first
        Policy storage policy = policies[policyId];
        
        require(policy.isActive, "Policy not active");
        require(!policy.isClaimed, "Policy already claimed");
        
        // Consistent parameter ordering for messageHash with explicit type conversion
        bytes32 messageHash = keccak256(
            abi.encodePacked(policyId, policy.owner, refundAmount, uint256(0), block.chainid)
        );
        
        // Use the verifySignature method from the parent contract
        require(verifySignature(messageHash, signature), "Invalid signature");
        
        // Mark policy as inactive
        policy.isActive = false;
        
        // Use the vault from PolicyBase
        vault.sendRefund(payable(policy.owner), refundAmount);
        
        emit PolicyCancelled(policyId, policy.owner, refundAmount);
        emit PolicyRefunded(policyId, policy.owner, refundAmount);
    }
}