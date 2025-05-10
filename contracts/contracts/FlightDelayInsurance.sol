// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FlightInsurance is Ownable, ReentrancyGuard {
    enum PolicyStatus { Active, Claimed, Expired }

    struct FlightPolicy {
        address user;
        string flightNumber;
        uint256 flightTime;
        uint256 coverageAmount;
        uint256 premiumPaid;
        PolicyStatus status;
        bool eligibleForPayout;
    }

    uint256 public policyCounter;
    address public trustedOracle;

    mapping(uint256 => FlightPolicy) public policies;
    mapping(address => uint256[]) public userPolicies;

    event PolicyCreated(address indexed user, uint256 policyId, string flightNumber, uint256 flightTime, uint256 premium);
    event PayoutIssued(address indexed user, uint256 policyId, uint256 amount);
    event PayoutDeclined(address indexed user, uint256 policyId, string reason);

    modifier onlyTrustedOracle() {
        require(msg.sender == trustedOracle, "Only oracle can call this");
        _;
    }

    function setTrustedOracle(address _oracle) external onlyOwner {
        trustedOracle = _oracle;
    }

    function createPolicy(
        string memory _flightNumber,
        uint256 _flightTime,
        uint256 _coverageAmount,
        uint256 _expectedPremium
    ) external payable {
        require(_flightTime > block.timestamp, "Flight must be in the future");
        require(_coverageAmount > 0, "Coverage must be > 0");
        require(msg.value >= _expectedPremium, "Insufficient premium sent");

        if (msg.value > _expectedPremium) {
            uint256 refund = msg.value - _expectedPremium;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }

        policies[policyCounter] = FlightPolicy({
            user: msg.sender,
            flightNumber: _flightNumber,
            flightTime: _flightTime,
            coverageAmount: _coverageAmount,
            premiumPaid: _expectedPremium,
            status: PolicyStatus.Active,
            eligibleForPayout: false
        });

        userPolicies[msg.sender].push(policyCounter);
        emit PolicyCreated(msg.sender, policyCounter, _flightNumber, _flightTime, _expectedPremium);
        policyCounter++;
    }

    function processFlightStatus(uint256 _policyId, uint256 delayInMinutes) external onlyTrustedOracle nonReentrant {
        FlightPolicy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(policy.flightTime < block.timestamp, "Flight hasn't happened yet");

        uint256 payout = calculatePayout(policy.coverageAmount, delayInMinutes);
        if (payout > 0) {
            policy.status = PolicyStatus.Claimed;
            policy.eligibleForPayout = true;
            (bool sent, ) = payable(policy.user).call{value: payout}("");
            require(sent, "Payout failed");
            emit PayoutIssued(policy.user, _policyId, payout);
        } else {
            policy.status = PolicyStatus.Expired;
            emit PayoutDeclined(policy.user, _policyId, "Delay too short");
        }
    }

    function calculatePayout(uint256 coverageAmount, uint256 delayMinutes) public pure returns (uint256) {
        if (delayMinutes < 120) return 0;
        if (delayMinutes < 240) return (coverageAmount * 50) / 100;
        return coverageAmount;
    }

    function getUserPolicies(address user) external view returns (uint256[] memory) {
        return userPolicies[user];
    }

    receive() external payable {}
}
