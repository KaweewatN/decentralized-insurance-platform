// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title InsuranceVault
/// @notice Holds and manages ETH funds for insurance premiums, claims, and refunds
/// @dev Acts as the central treasury for all insurance plans.
/// Only the contract owner can approve payouts or issue refunds.
/// Incoming ETH (premiums) are logged via events.
/// Does not implement business logic—only handles secure fund transfers.
contract InsuranceVault is Ownable {
    event PremiumPaid(address indexed user, uint256 amount);
    event ClaimPaid(address indexed to, uint256 amount);
    event RefundIssued(address indexed user, uint256 amount);
    event FundWithdrawn(address indexed to, uint256 amount);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    /// @notice Accept premium payments (ETH)
    receive() external payable {
        require(msg.value > 0, "Premium must be greater than zero");
        emit PremiumPaid(msg.sender, msg.value);
    }
    
    /// @notice Approve and send a claim payout to a policyholder
    /// @param to The address of the policyholder
    /// @param amount The amount to be paid out
    function approveClaim(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        require(amount > 0, "Claim amount must be greater than zero");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Claim transfer failed");
        emit ClaimPaid(to, amount);
    }
    
    /// @notice Issue a refund to a policyholder
    /// @param to The address of the policyholder
    /// @param amount The amount to be refunded
    function sendRefund(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        require(amount > 0, "Refund amount must be greater than zero");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Refund transfer failed");
        emit RefundIssued(to, amount);
    }
    
    /// @notice Withdraw funds from the vault (Admin Only)
    /// @param to The address to withdraw funds to
    /// @param amount The amount to withdraw
    function withdrawFunds(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        require(amount > 0, "Withdraw amount must be greater than zero");
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Withdraw transfer failed");
        emit FundWithdrawn(to, amount);
    }
    
    /// @notice Get the current balance of the vault
    /// @return The current balance of the vault
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}