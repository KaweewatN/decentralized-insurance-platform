// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../utils/InsuranceVault.sol";

/// @title PolicyBase
/// @notice Minimal, reliable, backend handles all security
abstract contract PolicyBase is AccessControl {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    InsuranceVault public vault;

    struct Policy {
        bytes32 policyId;
        address owner;
        uint256 premium;
        uint256 sumAssured;
        uint256 expiry;
        bool isActive;
        bool isClaimed;
        uint256 createdAt;
    }

    struct ClaimRequest {
        uint256 amount;
        bool isPending;
    }

    mapping(bytes32 => Policy) internal policies;
    mapping(bytes32 => ClaimRequest) internal claims;
    
    event PolicyPurchased(bytes32 indexed policyId, address indexed owner, uint256 premium, uint256 sumAssured, uint256 expiry);
    event ClaimFiled(bytes32 indexed policyId, address indexed owner, uint256 amount);
    event ClaimApproved(bytes32 indexed policyId, address indexed owner, uint256 amount);
    event PolicyCancelled(bytes32 indexed policyId, address indexed owner, uint256 refundAmount);
    event DebugSender(address sender, bool hasRole);

    constructor(address payable _vaultAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        vault = InsuranceVault(_vaultAddress);
    }

    modifier validPolicy(bytes32 policyId) {
        require(policies[policyId].policyId != 0, "Policy does not exist");
        _;
    }

    /// @notice ADMIN PURCHASES POLICY 
function purchasePolicy(
    address owner,
    uint256 premium,
    uint256 sumAssured,
    uint256 duration
) public payable virtual onlyRole(ADMIN_ROLE) returns (bytes32) {  
    require(owner != address(0), "Invalid owner");
    require(premium > 0 && sumAssured > 0 && duration > 0, "Invalid parameters");
    require(msg.value == premium, "Incorrect premium");
    
    bytes32 policyId = keccak256(abi.encodePacked(
        owner, 
        block.timestamp, 
        block.number,
        address(this)
    ));

    policies[policyId] = Policy({
        policyId: policyId,
        owner: owner,
        premium: premium,
        sumAssured: sumAssured,
        expiry: block.timestamp + duration,
        isActive: true,
        isClaimed: false,
        createdAt: block.timestamp
    });

    _processPolicyData(policyId);

    (bool sent, ) = address(vault).call{value: premium}("");
    require(sent, "Vault transfer failed");

    emit PolicyPurchased(policyId, owner, premium, sumAssured, block.timestamp + duration);
    return policyId;
}

/// @notice FILE AND APPROVE CLAIM
function fileAndApproveClaim(
    bytes32 policyId, 
    uint256 amount
) public virtual onlyRole(ADMIN_ROLE) validPolicy(policyId) returns (uint256) {

    emit DebugSender(msg.sender, hasRole(ADMIN_ROLE, msg.sender));
    
    Policy storage policy = policies[policyId];
    
    require(policy.isActive, "Policy not active");
    require(amount > 0, "Invalid amount");
    require(amount <= policy.sumAssured, "Amount exceeds sum assured");
    require(!policy.isClaimed, "Policy already claimed");

    claims[policyId] = ClaimRequest({
        amount: amount,
        isPending: false
    });

    policy.isClaimed = true;
    policy.isActive = false;

    vault.approveClaim(payable(policy.owner), amount);

    emit ClaimFiled(policyId, policy.owner, amount);
    emit ClaimApproved(policyId, policy.owner, amount);
    
    return amount;
}

/// @notice CANCEL POLICY 
function cancelPolicy(
    bytes32 policyId, 
    uint256 refundAmount
) public virtual onlyRole(ADMIN_ROLE) validPolicy(policyId) {
    
    Policy storage policy = policies[policyId];
    require(policy.isActive, "Policy not active");
    
    policy.isActive = false;
    vault.sendRefund(payable(policy.owner), refundAmount);

    emit PolicyCancelled(policyId, policy.owner, refundAmount);
}

    /// @notice Check if contract is approved in vault
    function isApprovedInVault() external view returns (bool) {
        try vault.isApprovedContract(address(this)) returns (bool isApproved) {
            return isApproved;
        } catch {
            return false;
        }
    }

    /// @notice Get vault information
    function getVaultInfo() external view returns (
        address vaultAddress,
        uint256 vaultBalance,
        bool isApproved
    ) {
        vaultAddress = address(vault);
        vaultBalance = address(vault).balance;
        
        try vault.isApprovedContract(address(this)) returns (bool approved) {
            isApproved = approved;
        } catch {
            isApproved = false; 
        }
    }

    // Abstract and view functions
    function _processPolicyData(bytes32 policyId) internal virtual;
    
    function getPolicy(bytes32 policyId) external view returns (Policy memory) { 
        return policies[policyId]; 
    }
    
    function getClaim(bytes32 policyId) external view returns (ClaimRequest memory) { 
        return claims[policyId]; 
    }
    
    function getClaimStatus(bytes32 policyId) external view returns (
        bool hasClaim,
        uint256 amount,
        bool isPending,
        bool isApproved
    ) {
        ClaimRequest memory claim = claims[policyId];
        Policy memory policy = policies[policyId];
        
        return (
            claim.amount > 0,
            claim.amount,
            claim.isPending,
            policy.isClaimed
        );
    }
}