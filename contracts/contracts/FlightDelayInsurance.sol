// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract FlightInsurance is
    Ownable,
    ReentrancyGuard
{
    using ECDSA for bytes32;
    enum PolicyStatus {
        Active,
        Claimed,
        Expired
    }

    struct FlightPolicy {
        address user;
        string flightNumber;
        uint256 flightTime;
        uint256 coverageAmountPerPerson;
        uint256 premiumPaid;
        uint256 numInsuredPersons;
        PolicyStatus status;
        bool eligibleForPayout;
    }

    uint256 public policyCounter;
    mapping(uint256 => FlightPolicy) public policies;
    mapping(address => uint256[]) public userPolicies;

    event PolicyCreated(
        address indexed user,
        uint256 policyId,
        string flightNumber,
        uint256 flightTime,
        uint256 premium
    );
    event PayoutIssued(address indexed user, uint256 policyId, uint256 amount);
    event PayoutDeclined(address indexed user, uint256 policyId, string reason);

    address public trustedSigner;
    address public trustedOracle;

    function setTrustedSigner(address _signer) external onlyOwner {
        trustedSigner = _signer;
    }

    function setTrustedOracle(address _oracle) external onlyOwner {
        trustedOracle = _oracle;
    }

    modifier onlyTrustedOracle() {
        require(msg.sender == trustedOracle, "Only oracle can call this");
        _;
    }

    function createPolicy(
        string memory _flightNumber,
        uint256 _flightTime,
        uint256 _coveragePerPerson,
        uint256 _numPersons,
        uint256 _premium,
        bytes memory signature
    ) external payable {
        require(_flightTime > block.timestamp, "Flight must be in the future");
        require(_coveragePerPerson > 0, "Coverage must be > 0");
        require(_numPersons > 0, "At least one person must be insured");
        require(msg.value == _premium, "Incorrect premium sent");

        // Step 1: Reconstruct message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                _flightNumber,
                _coveragePerPerson,
                _numPersons,
                _premium
            )
        );

        // Step 2: Convert to Ethereum signed message hash
        bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(
            messageHash
        );

        // Step 3: Recover signer
        address recoveredSigner = ECDSA.recover(
            ethSignedMessageHash,
            signature
        );

        // Step 4: Check that it matches the trusted backend signer
        require(recoveredSigner == trustedSigner, "Invalid premium signature");

        // Step 5: Store policy
        policies[policyCounter] = FlightPolicy({
            user: msg.sender,
            flightNumber: _flightNumber,
            flightTime: _flightTime,
            coverageAmountPerPerson: _coveragePerPerson,
            premiumPaid: msg.value,
            numInsuredPersons: _numPersons,
            status: PolicyStatus.Active,
            eligibleForPayout: false
        });

        userPolicies[msg.sender].push(policyCounter);

        emit PolicyCreated(
            msg.sender,
            policyCounter,
            _flightNumber,
            _flightTime,
            msg.value
        );

        policyCounter++;
    }

    function processFlightStatus(
        uint256 _policyId,
        uint256 delayInMinutes
    ) external onlyTrustedOracle nonReentrant {
        FlightPolicy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.Active, "Policy not active");
        require(
            policy.flightTime < block.timestamp,
            "Flight hasn't happened yet"
        );

        uint256 payout = calculatePayout(
            policy.coverageAmountPerPerson,
            delayInMinutes,
            policy.numInsuredPersons
        );
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

    function calculatePayout(
        uint256 coveragePerPerson,
        uint256 delayMinutes,
        uint256 numPersons
    ) public pure returns (uint256) {
        if (delayMinutes < 120) return 0;
        if (delayMinutes < 240)
            return (coveragePerPerson * numPersons * 50) / 100;
        return coveragePerPerson * numPersons;
    }

    function getUserPolicies(
        address user
    ) external view returns (uint256[] memory) {
        return userPolicies[user];
    }

    receive() external payable {}

    function expirePolicy(uint256 _policyId) external onlyTrustedOracle {
        FlightPolicy storage policy = policies[_policyId];

        require(policy.status == PolicyStatus.Active, "Policy already handled");

        // Policy expires after 2 days (in seconds)
        require(
            block.timestamp > policy.flightTime + 2 days,
            "Grace period not over"
        );

        policy.status = PolicyStatus.Expired;

        emit PayoutDeclined(policy.user, _policyId, "Grace period expired");
    }
}
