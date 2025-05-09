// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";


/// @title InsuranceVault
/// @notice Holds and manages ETH funds for insurance premiums, claims, and refunds
/// @dev Acts as the central treasury for all insurance plans.
///      Only the contract owner can approve payouts or issue refunds. 
///      Incoming ETH (premiums) are logged via events.
///      Does not implement business logic—only handles secure fund transfers.

contract InsuranceVault is Ownable {
    event PremiumPaid(address indexed user, uint256 amount);
    event ClaimApproved(address indexed to, uint256 amount);
    event RefundIssued(address indexed user, uint256 amount);

    constructor(address _owner) Ownable(_owner) {}

    receive() external payable {
        require(msg.value > 0, "Premium must be greater than zero");
        emit PremiumPaid(msg.sender, msg.value);
    }

    function approveClaim(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        to.transfer(amount);
        emit ClaimApproved(to, amount);
    }

    function issueRefund(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        to.transfer(amount);
        emit RefundIssued(to, amount);
    }

    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
