// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title PriceOracle
/// @notice On-chain oracle to manage the ETH/THB exchange rate for insurance pricing
/// @dev Used by insurance contracts to dynamically calculate premiums based on real-world currency.
///      Admin (owner) can assign a trusted updater role to manage rate updates securely.
///      All changes are logged through events for traceability.

contract PriceOracle is Ownable {
    uint256 public ethPerThb; // 1 THB = ? ETH (in wei)
    address public updater;   // Address allowed to update the rate

    event RateUpdated(uint256 newRate);
    event UpdaterChanged(address indexed newUpdater);

    modifier onlyUpdater() {
        require(msg.sender == updater, "Not authorized");
        _;
    }

    constructor(address _owner, address _updater) Ownable(_owner) {
        require(_updater != address(0), "Invalid updater");
        updater = _updater;
    }

    /// @notice Update the ETH per THB rate (e.g., 1 THB = X ETH in wei)
    function updateEthPerThb(uint256 _ethPerThb) external onlyUpdater {
        require(_ethPerThb > 0, "Invalid rate");
        ethPerThb = _ethPerThb;
        emit RateUpdated(_ethPerThb);
    }

    /// @notice Admin-only function to assign a new updater
    function setUpdater(address _newUpdater) external onlyOwner {
        require(_newUpdater != address(0), "Invalid address");
        updater = _newUpdater;
        emit UpdaterChanged(_newUpdater);
    }
}
