// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title InsuranceVault - FIXED VERSION
/// @notice Holds and manages ETH funds for insurance premiums, claims, and refunds
/// @dev Added approval system for insurance contracts to call approveClaim
contract InsuranceVault is Ownable {
    // ✅ NEW: Track approved insurance contracts
    mapping(address => bool) public approvedContracts;
    
    event PremiumPaid(address indexed user, uint256 amount);
    event ClaimPaid(address indexed to, uint256 amount);
    event RefundIssued(address indexed user, uint256 amount);
    event FundWithdrawn(address indexed to, uint256 amount);
    event ContractApproved(address indexed contractAddress);
    event ContractRevoked(address indexed contractAddress);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    // ✅ NEW: Modifier to allow owner OR approved contracts
    modifier onlyOwnerOrApprovedContract() {
        require(msg.sender == owner() || approvedContracts[msg.sender], "Not authorized");
        _;
    }
    
    // ✅ NEW: Approve insurance contract to make claims
    function approveContract(address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        approvedContracts[contractAddress] = true;
        emit ContractApproved(contractAddress);
    }
    
    // ✅ NEW: Revoke insurance contract access
    function revokeContract(address contractAddress) external onlyOwner {
        approvedContracts[contractAddress] = false;
        emit ContractRevoked(contractAddress);
    }
    
    // ✅ NEW: Check if contract is approved
    function isApprovedContract(address contractAddress) external view returns (bool) {
        return approvedContracts[contractAddress];
    }
    
    /// @notice Accept premium payments (ETH)
    receive() external payable {
        require(msg.value > 0, "Premium must be greater than zero");
        emit PremiumPaid(msg.sender, msg.value);
    }
    
    /// @notice ✅ UPDATED: Allow approved contracts to call this
    function approveClaim(address payable to, uint256 amount) external onlyOwnerOrApprovedContract {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        require(amount > 0, "Claim amount must be greater than zero");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Claim transfer failed");
        emit ClaimPaid(to, amount);
    }
    
    /// @notice ✅ UPDATED: Allow approved contracts to call this
    function sendRefund(address payable to, uint256 amount) external onlyOwnerOrApprovedContract {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        require(amount > 0, "Refund amount must be greater than zero");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Refund transfer failed");
        emit RefundIssued(to, amount);
    }
    
    /// @notice Withdraw funds from the vault (Owner Only)
    function withdrawFunds(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        require(amount > 0, "Withdraw amount must be greater than zero");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Withdraw transfer failed");
        emit FundWithdrawn(to, amount);
    }
    
    /// @notice Get the current balance of the vault
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }

}