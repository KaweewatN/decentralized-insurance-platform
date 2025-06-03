// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RainfallInsurance is Ownable, ReentrancyGuard, AccessControl {
    using ECDSA for bytes32;

    enum PolicyStatus {
        Pending,
        Active,
        Claimed,
        Rejected
    }
    enum ConditionType {
        Below,
        Above
    }

    struct Policy {
        address user;
        uint256 coverageAmount;
        uint256 premium;
        uint256 threshold;
        string startDate;
        string endDate;
        ConditionType conditionType;
        PolicyStatus status;
        uint256 createdAt;
        int256 latitude;
        int256 longitude;
    }

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    address public backendSigner;
    uint256 public policyCounter;
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public userPolicies;
    mapping(bytes32 => uint256) public requestToPolicyId;

    event PolicyPurchased(uint256 indexed policyId, address indexed user);
    event ReadyForPayout(uint256 indexed policyId);
    event PolicyEvaluated(uint256 indexed policyId, bool payoutTriggered);
    event FundsDeposited(address indexed sender, uint256 amount);

    constructor(address _backendSigner) {
        backendSigner = _backendSigner;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Let deployer grant roles
    }

    function purchasePolicy(
        uint256 policyId,
        uint256 coverageAmount,
        uint256 premium,
        uint256 threshold,
        string memory startDate,
        string memory endDate,
        ConditionType conditionType,
        int256 latitude,
        int256 longitude,
        bytes memory signature
    ) external payable nonReentrant {
        require(msg.value == premium, "Incorrect premium amount sent");
        require(policies[policyId].user == address(0), "Policy already exists");

        bytes32 messageHash = keccak256(
            abi.encodePacked(
                policyId,
                msg.sender,
                coverageAmount,
                premium,
                threshold,
                startDate,
                endDate,
                conditionType,
                latitude,
                longitude
            )
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        require(
            ethSignedMessageHash.recover(signature) == backendSigner,
            "Invalid signature"
        );

        policies[policyId] = Policy({
            user: msg.sender,
            coverageAmount: coverageAmount,
            premium: premium,
            threshold: threshold,
            startDate: startDate,
            endDate: endDate,
            conditionType: conditionType,
            status: PolicyStatus.Active,
            createdAt: block.timestamp,
            latitude: latitude,
            longitude: longitude
        });

        userPolicies[msg.sender].push(policyId);
        emit PolicyPurchased(policyId, msg.sender);
        policyCounter++;
    }
    function fundContract() external payable {
        require(msg.value > 0, "No ETH sent");
        emit FundsDeposited(msg.sender, msg.value);
    }
    function setBackendSigner(address _newSigner) external onlyOwner {
        backendSigner = _newSigner;
    }

    function getUserPolicies(
        address user
    ) external view returns (uint256[] memory) {
        return userPolicies[user];
    }

    function getPolicy(
        uint256 policyId
    )
        external
        view
        returns (
            address user,
            uint256 coverageAmount,
            uint256 premium,
            uint256 threshold,
            string memory startDate,
            string memory endDate,
            ConditionType conditionType,
            PolicyStatus status,
            uint256 createdAt,
            int256 latitude,
            int256 longitude
        )
    {
        Policy memory p = policies[policyId];
        return (
            p.user,
            p.coverageAmount,
            p.premium,
            p.threshold,
            p.startDate,
            p.endDate,
            p.conditionType,
            p.status,
            p.createdAt,
            p.latitude,
            p.longitude
        );
    }

    function isReadyForPayout(uint256 policyId) public view returns (bool) {
        Policy memory policy = policies[policyId];
        require(policy.user != address(0), "Policy not found");
        return
            policy.status == PolicyStatus.Active &&
            block.timestamp > parseDate(policy.endDate) + 3 days;
    }

    function checkUpkeep(
        bytes calldata
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        for (uint256 i = 0; i < policyCounter; i++) {
            if (isReadyForPayout(i)) {
                return (true, abi.encode(i));
            }
        }
        return (false, bytes(""));
    }

    function performUpkeep(bytes calldata performData) external {
        uint256 policyId = abi.decode(performData, (uint256));
        require(isReadyForPayout(policyId), "Not ready");
        emit ReadyForPayout(policyId);
    }

    function triggerPayout(
        uint256 policyId,
        bool shouldPay
    ) public onlyRole(ORACLE_ROLE) nonReentrant {
        Policy storage policy = policies[policyId];
        require(policy.user != address(0), "Policy does not exist");
        require(policy.status == PolicyStatus.Active, "Policy not active");

        if (shouldPay) {
            require(
                address(this).balance >= policy.coverageAmount,
                "Insufficient contract balance"
            );
            policy.status = PolicyStatus.Claimed;
            payable(policy.user).transfer(policy.coverageAmount);
        } else {
            policy.status = PolicyStatus.Rejected;
        }

        emit PolicyEvaluated(policyId, shouldPay);
    }

    function handleOracleFulfillment(
        bytes32 requestId,
        bytes memory response,
        bytes memory /* err */
    ) external onlyRole(ORACLE_ROLE) {
        require(
            requestToPolicyId[requestId] != 0 || policies[0].user != address(0),
            "Invalid request"
        );

        uint256 policyId = requestToPolicyId[requestId];
        bool shouldPay = abi.decode(response, (bool));
        triggerPayout(policyId, shouldPay);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Not enough balance");
        payable(msg.sender).transfer(amount);
    }

    function parseDate(string memory date) internal pure returns (uint256) {
        bytes memory b = bytes(date);
        require(b.length == 10, "Invalid date format");

        uint256 year = toUint(b, 0, 4);
        uint256 month = toUint(b, 5, 2);
        uint256 day = toUint(b, 8, 2);

        return
            (year - 1970) *
            365 days +
            (month - 1) *
            30 days +
            (day - 1) *
            1 days;
    }

    function toUint(
        bytes memory b,
        uint offset,
        uint length
    ) internal pure returns (uint256 result) {
        for (uint i = offset; i < offset + length; i++) {
            require(b[i] >= 0x30 && b[i] <= 0x39, "Invalid number");
            result = result * 10 + (uint8(b[i]) - 48);
        }
    }
    function manualFulfill(
        uint256 policyId,
        bool shouldPay
    ) external onlyRole(ORACLE_ROLE) {
        triggerPayout(policyId, shouldPay);
    }

    receive() external payable {}
}