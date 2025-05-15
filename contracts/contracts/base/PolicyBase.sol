
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "../utils/InsuranceVault.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title PolicyBase
/// @notice Abstract base contract for insurance plans with signature verification
abstract contract PolicyBase is AccessControl {
    using MessageHashUtils for bytes32;
    
    // ReentrancyGuard implementation
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    // Define roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Backend signer address
    address public trustedSigner;
    
    // Vault address for managing funds
    InsuranceVault public vault;
    
    // Claim request expiry period (7 days by default)
    uint256 public claimExpiryPeriod = 7 days;

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
        bytes32 policyId;
        uint256 amount;
        string documentHash;
        bool isPending;
        uint256 createdAt;
        uint256 expiryTimestamp;
    }

    mapping(bytes32 => Policy) internal policies;
    mapping(bytes32 => ClaimRequest) internal claims;
    mapping(bytes32 => bool) internal usedSignatures;
    
    // Events
    event PolicyPurchased(bytes32 indexed policyId, address indexed owner, uint256 premium, uint256 sumAssured, uint256 expiry);
    event ClaimFiled(bytes32 indexed policyId, address indexed owner, uint256 amount, string documentHash);
    event ClaimApproved(bytes32 indexed policyId, address indexed owner, uint256 amount);
    event PolicyCancelled(bytes32 indexed policyId, address indexed owner, uint256 refundAmount);
    event RefundIssued(bytes32 indexed policyId, address indexed owner, uint256 amount);
    event AdminGranted(address indexed admin);
    event TrustedSignerUpdated(address indexed oldSigner, address indexed newSigner);
    event PolicyRenewed(bytes32 indexed policyId, address indexed owner, uint256 premium, uint256 newExpiry);
    event PolicyExpired(bytes32 indexed policyId, address indexed owner);
    event ClaimExpiryPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event VaultUpdated(address indexed oldVault, address indexed newVault);

    constructor(address _trustedSigner, address payable _vaultAddress) {
        require(_trustedSigner != address(0), "Invalid signer address");
        require(_vaultAddress != address(0), "Invalid vault address");
        
        // Grant the contract deployer the default admin role and admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Set trusted signer address
        trustedSigner = _trustedSigner;
        
        // Set vault address
        vault = InsuranceVault(_vaultAddress);
        
        // Initialize reentrancy guard
        _status = _NOT_ENTERED;
    }

    /// @notice Modifier to prevent reentrancy attacks
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    /// @notice Set the trusted signer address
    /// @param newSigner Address of the backend that will sign premium and claim amounts
    function setTrustedSigner(address newSigner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newSigner != address(0), "Invalid signer address");
        address oldSigner = trustedSigner;
        trustedSigner = newSigner;
        emit TrustedSignerUpdated(oldSigner, newSigner);
    }
    
    /// @notice Set the vault address
    /// @param newVault Address of the new vault
    function setVault(address payable newVault) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVault != address(0), "Invalid vault address");
        address oldVault = address(vault);
        vault = InsuranceVault(newVault);
        emit VaultUpdated(oldVault, newVault);
    }

    /// @notice Set the claim expiry period
    /// @param periodInDays Number of days a claim remains valid
    function setClaimExpiryPeriod(uint256 periodInDays) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(periodInDays > 0, "Period must be positive");
        uint256 oldPeriod = claimExpiryPeriod;
        claimExpiryPeriod = periodInDays * 1 days;
        emit ClaimExpiryPeriodUpdated(oldPeriod, claimExpiryPeriod);
    }

    /// @notice Grant admin role (only default admin can do this)
    function grantAdminRole(address newAdmin) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid admin address");
        _grantRole(ADMIN_ROLE, newAdmin);
        emit AdminGranted(newAdmin);
    }

    /// @notice Revoke admin role (only default admin can do this)
    function revokeAdminRole(address admin) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        require(admin != address(0), "Invalid admin address");
        require(admin != msg.sender, "Cannot revoke self");
        _revokeRole(ADMIN_ROLE, admin);
    }

    /// @notice Modifier to check if policy is valid
    modifier validPolicy(bytes32 policyId) {
        require(policies[policyId].isActive, "Policy not active");
        _;
    }

    /// @notice Generate a unique hashed policy ID
    function generatePolicyId(address user, uint256 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, timestamp));
    }

    /// @notice Verify a signature from the backend using ECDSA library (like FlightInsurance)
    /// @param messageHash The message hash that was signed
    /// @param signature The signature to verify
    function verifySignature(bytes32 messageHash, bytes memory signature) internal view returns (bool) {
        require(!usedSignatures[keccak256(signature)], "Signature already used");
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);
        return recoveredSigner == trustedSigner;
    }

    /// @notice Purchase a new policy with backend-verified premium
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
    ) public payable virtual nonReentrant returns (bytes32) {  
        require(owner != address(0), "Invalid owner address");
        require(premium > 0, "Premium must be positive");
        require(sumAssured > 0, "Sum assured must be positive");
        require(duration > 0, "Duration must be positive");
        require(msg.value == premium, "Incorrect premium amount");
        
        // Create hash of the policy parameters for signature verification
        // Including blockchainId for extra security
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                owner,
                premium,
                sumAssured,
                duration,
                block.chainid
            )
        );
        
        // Verify signature
        require(verifySignature(messageHash, signature), "Invalid signature");
        
        // Mark signature as used
        usedSignatures[keccak256(signature)] = true;
        
        // Generate a unique policy ID
        bytes32 policyId = generatePolicyId(owner, block.timestamp);
        require(!policies[policyId].isActive, "Policy already exists");

        // Create the policy record first
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

        // Handle policy-specific data processing
        _processPolicyData(policyId);

        // Forward the premium to the vault
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Premium transfer to vault failed");

        emit PolicyPurchased(policyId, owner, premium, sumAssured, block.timestamp + duration);
        
        return policyId;  // Return the policy ID
    }

    /// @notice Process policy-specific data (to be implemented by derived contracts)
    /// @param policyId The ID of the policy
    function _processPolicyData(bytes32 policyId) internal virtual;

    /// @notice File a claim for the insurance with signature verification
    /// @param policyId The ID of the policy
    /// @param amount Claim amount
    /// @param documentHash Hash of supporting documents
    /// @param signature Signature from the backend verifying the claim
    function fileClaim(
        bytes32 policyId,
        uint256 amount,
        string memory documentHash,
        bytes memory signature
    ) public virtual nonReentrant validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.owner == msg.sender, "Not the policy owner");
        require(amount <= policy.sumAssured, "Claim exceeds sum assured");
        require(!policy.isClaimed, "Policy already claimed");
        require(block.timestamp < policy.expiry, "Policy expired");
        
        // Create hash of the claim parameters for signature verification
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                policyId,
                amount,
                documentHash,
                block.chainid
            )
        );
        
        // Verify signature
        require(verifySignature(messageHash, signature), "Invalid signature");
        
        // Mark signature as used
        usedSignatures[keccak256(signature)] = true;

        claims[policyId] = ClaimRequest({
            policyId: policyId,
            amount: amount,
            documentHash: documentHash,
            isPending: true,
            createdAt: block.timestamp,
            expiryTimestamp: block.timestamp + claimExpiryPeriod
        });

        emit ClaimFiled(policyId, policy.owner, amount, documentHash);
    }

    /// @notice Approve a claim after admin review
    /// @param policyId The ID of the policy
    function approveClaim(bytes32 policyId) 
        public 
        virtual 
        onlyRole(ADMIN_ROLE) 
        validPolicy(policyId) 
        nonReentrant 
        returns (uint256) 
    {
        ClaimRequest storage claim = claims[policyId];
        Policy storage policy = policies[policyId];

        require(claim.isPending, "No pending claim");
        require(block.timestamp <= claim.expiryTimestamp, "Claim request expired");

        // Update status first to prevent reentrancy attacks
        claim.isPending = false;
        policy.isClaimed = true;
        policy.isActive = false;

        // Send payment to the policy owner through vault
        vault.approveClaim(payable(policy.owner), claim.amount);

        emit ClaimApproved(policyId, policy.owner, claim.amount);
        return claim.amount;
    }
    
    /// @notice Cancel the policy with backend verification
    /// @param policyId The ID of the policy
    /// @param refundAmount Refund amount
    /// @param signature Signature from the backend verifying the refund amount
    function cancelPolicy(
        bytes32 policyId,
        uint256 refundAmount,
        bytes memory signature
    ) public virtual onlyRole(ADMIN_ROLE) validPolicy(policyId) nonReentrant {
        Policy storage policy = policies[policyId];
        require(!policy.isClaimed, "Policy already claimed");
        require(block.timestamp < policy.expiry, "Policy expired");
        
        // Create hash of the refund parameters for signature verification
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                policyId,
                refundAmount,
                block.chainid
            )
        );
        
        // Verify signature
        require(verifySignature(messageHash, signature), "Invalid signature");
        
        // Mark signature as used
        usedSignatures[keccak256(signature)] = true;
        
        // Change state before transfer to prevent reentrancy
        policy.isActive = false;

        // Transfer the refund through vault
        vault.sendRefund(payable(policy.owner), refundAmount);

        emit PolicyCancelled(policyId, policy.owner, refundAmount);
        emit RefundIssued(policyId, policy.owner, refundAmount);
    }

    /// @notice Get policy details
    /// @param policyId The ID of the policy
    function getPolicy(bytes32 policyId) external view virtual returns (Policy memory) {
        return policies[policyId];
    }

    /// @notice Get claim details
    /// @param policyId The ID of the policy
    function getClaim(bytes32 policyId) external view virtual returns (ClaimRequest memory) {
        return claims[policyId];
    }

    /// @notice Mark a policy as expired
    /// @param policyId The ID of the policy
    function markExpiredPolicy(bytes32 policyId) external {
        Policy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        require(block.timestamp >= policy.expiry, "Policy not expired yet");
        
        policy.isActive = false;
        
        emit PolicyExpired(policyId, policy.owner);
    }

    /// @notice Renew an existing policy with backend-verified premium
    /// @param policyId The ID of the policy
    /// @param premium New premium amount
    /// @param duration Additional duration in seconds
    /// @param signature Signature from the backend verifying the renewal parameters
    function renewPolicy(
        bytes32 policyId,
        uint256 premium,
        uint256 duration,
        bytes memory signature
    ) external payable virtual nonReentrant validPolicy(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.owner == msg.sender, "Not the policy owner");
        require(msg.value == premium, "Incorrect premium amount");
        require(!policy.isClaimed, "Policy already claimed");
        
        // Create hash of the renewal parameters for signature verification
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                policyId,
                premium,
                duration,
                block.chainid
            )
        );
        
        // Verify signature
        require(verifySignature(messageHash, signature), "Invalid signature");
        
        // Mark signature as used
        usedSignatures[keccak256(signature)] = true;
        
        // Update policy
        policy.premium = premium;
        policy.expiry = policy.expiry + duration;
        
        // Forward the premium to the vault
        (bool sent, ) = address(vault).call{value: premium}("");
        require(sent, "Premium transfer to vault failed");
        
        emit PolicyRenewed(policyId, policy.owner, premium, policy.expiry);
    }
    
    /// @notice Emergency withdraw function (only for admin)
    /// @param amount Amount to withdraw
    function emergencyWithdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        // This now calls the vault's withdrawFunds function instead of direct transfer
        vault.withdrawFunds(payable(msg.sender), amount);
    }
    
    // Function to receive Ether - but now we forward it to vault
    receive() external payable {
        // Forward any received ETH to the vault
        (bool sent, ) = address(vault).call{value: msg.value}("");
        require(sent, "ETH forwarding to vault failed");
    }
}