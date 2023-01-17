// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.0;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IToTheMooon} from "./interfaces/IToTheMooon.sol";
import {ITournament} from "./interfaces/ITournament.sol";
import {PercentageMath} from "./math/PercentageMath.sol";
import {WadRayMath} from "./math/WadRayMath.sol";
import {Errors} from "./utils/Errors.sol";
import {DataTypes} from "./utils/DataTypes.sol";

/**
 * @title Tournament contract
 * @author Sumit Mahajan
 * @dev Handles Tournament logic for sponsored and daily tournaments of ToTheMooon
 **/
contract Tournament is ITournament, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;

    using PercentageMath for uint256;
    using WadRayMath for uint256;

    uint256 public id;

    string public name;

    uint256 public startTime;

    uint256 public timeLimit;

    uint256 public joiningFees;

    address public gameContractAddress;

    address public approvedCaller;

    bool public override hasEnded;

    DataTypes.RewardVars public rewardVars;

    EnumerableSet.AddressSet playerListSet;

    mapping(address => DataTypes.PlayerStats) public playerStatsMap;

    event ScoreRecorded(
        address indexed player,
        uint256 indexed timestamp,
        uint256 score
    );

    event FundsAdded(address indexed payer, uint indexed timestamp, uint funds);

    event FundsWithdrawn(uint indexed timestamp, uint funds);

    constructor(
        uint256 id_,
        string memory name_,
        uint256 startTime_,
        address gameContractAddress_,
        DataTypes.RewardVars memory _rewardVars
    ) {
        id = id_;
        name = name_;
        startTime = startTime_;
        gameContractAddress = gameContractAddress_;
        timeLimit = IToTheMooon(gameContractAddress).timeLimit();
        joiningFees = IToTheMooon(gameContractAddress).joiningFees();
        approvedCaller = IToTheMooon(gameContractAddress).getOwner();
        rewardVars = _rewardVars;
    }

    modifier onlyApprovedCaller() {
        require(msg.sender == approvedCaller, Errors.CALLER_NOT_AUTHORIZED);
        _;
    }

    receive() external payable {
        emit FundsAdded(msg.sender, block.timestamp, msg.value);
    }

    function withdrawContractFunds(uint funds) external onlyApprovedCaller {
        require(funds <= address(this).balance, Errors.NOT_ENOUGH_FUNDS);
        payable(msg.sender).transfer(funds);

        emit FundsWithdrawn(block.timestamp, funds);
    }

    function getTournamentInfo()
        public
        view
        override
        returns (
            string memory _name,
            uint _timeLimit,
            uint _startTime,
            uint _id,
            uint _joiningFees,
            DataTypes.RewardVars memory _rewardVars,
            uint _nPlayers
        )
    {
        (_rewardVars, , _nPlayers) = getRewardInfo();

        _name = name;
        _timeLimit = timeLimit;
        _startTime = startTime;
        _id = id;
        _joiningFees = joiningFees;
    }

    function getRewardInfo()
        public
        view
        override
        returns (
            DataTypes.RewardVars memory,
            uint256,
            uint256
        )
    {
        return (
            DataTypes.RewardVars(
                rewardVars.isSponsored,
                rewardVars.isSponsored
                    ? rewardVars.prizePool
                    : playerListSet.length() *
                        joiningFees -
                        (playerListSet.length() * joiningFees).percentMul(
                            rewardVars.commissionPercentage
                        ),
                min(
                    playerListSet.length().percentMul(
                        IToTheMooon(gameContractAddress).winnersPercentage()
                    ),
                    rewardVars.isSponsored
                        ? rewardVars.nWinners
                        : IToTheMooon(gameContractAddress).winnersPercentage() /
                            10
                ),
                rewardVars.sponsorMetadata,
                rewardVars.commissionPercentage
            ),
            joiningFees,
            playerListSet.length()
        );
    }

    function getLeaderBoard()
        public
        view
        override
        returns (DataTypes.LeaderBoardEntry[] memory)
    {
        DataTypes.LeaderBoardEntry[]
            memory leaderboardTemp = new DataTypes.LeaderBoardEntry[](
                playerListSet.length()
            );

        if (playerListSet.length() == 0) {
            return leaderboardTemp;
        }

        for (uint256 i = 0; i < playerListSet.length(); i++) {
            leaderboardTemp[i] = DataTypes.LeaderBoardEntry(
                playerListSet.at(i),
                IToTheMooon(gameContractAddress).getUserName(
                    playerListSet.at(i)
                ),
                playerStatsMap[playerListSet.at(i)].highscore,
                0
            );
        }

        leaderboardTemp = quickSort(
            leaderboardTemp,
            0,
            int256(playerListSet.length() - 1)
        );

        (DataTypes.RewardVars memory currentRewardVars, , ) = getRewardInfo();

        uint256 r = getRValue(playerListSet.length());

        uint256 a = (currentRewardVars.prizePool.wadMul(r - 1e18)).wadDiv(
            pow(r, currentRewardVars.nWinners) - 1e18
        );

        for (uint256 i = 0; i < currentRewardVars.nWinners; i++) {
            leaderboardTemp[i].prize = a.wadMul(
                pow(r, (currentRewardVars.nWinners - i - 1))
            );
        }

        return leaderboardTemp;
    }

    function joinTournament() external payable override {
        require(
            startTime + timeLimit > block.timestamp,
            Errors.TOURNAMENT_HAS_ENDED
        );

        require(msg.value == joiningFees, Errors.NOT_ENOUGH_FUNDS_PROVIDED);

        playerListSet.add(msg.sender);
        playerStatsMap[msg.sender].attemptsLeft = 3;
        IToTheMooon(gameContractAddress).addPlayerToTournament(msg.sender);
    }

    function reFill() external payable override {
        require(
            startTime + timeLimit > block.timestamp,
            Errors.TOURNAMENT_HAS_ENDED
        );

        bool hasPlayerJoined = IToTheMooon(gameContractAddress)
            .hasJoinedTournament(msg.sender, id);
        require(hasPlayerJoined, Errors.PLAYER_NOT_JOINED);

        require(msg.value == joiningFees, Errors.NOT_ENOUGH_FUNDS_PROVIDED);

        require(
            playerStatsMap[msg.sender].attemptsLeft == 0,
            Errors.ATTEMPTS_LEFT
        );

        playerStatsMap[msg.sender].attemptsLeft = 3;
    }

    function recordScore(address _player, uint256 _score)
        external
        override
        onlyApprovedCaller
    {
        require(
            startTime + timeLimit > block.timestamp,
            Errors.TOURNAMENT_HAS_ENDED
        );

        bool hasPlayerJoined = IToTheMooon(gameContractAddress)
            .hasJoinedTournament(_player, id);
        require(hasPlayerJoined, Errors.PLAYER_NOT_JOINED);

        require(
            playerStatsMap[_player].attemptsLeft > 0,
            Errors.NO_ATTEMPTS_LEFT
        );

        playerStatsMap[_player].highscore = _score;
        playerStatsMap[_player].attemptsLeft--;

        emit ScoreRecorded(_player, block.timestamp, _score);
    }

    function endTournament() external override onlyApprovedCaller {
        require(
            startTime + timeLimit < block.timestamp,
            Errors.TOURNAMENT_IS_LIVE
        );

        require(!hasEnded, Errors.TOURNAMENT_HAS_ENDED);

        hasEnded = true;

        DataTypes.LeaderBoardEntry[] memory leaderboardTemp = getLeaderBoard();

        for (uint256 i = 0; i < playerListSet.length(); i++) {
            playerStatsMap[leaderboardTemp[i].wallet] = DataTypes.PlayerStats(
                i + 1,
                leaderboardTemp[i].highscore,
                playerStatsMap[leaderboardTemp[i].wallet].attemptsLeft,
                playerStatsMap[leaderboardTemp[i].wallet].reFills,
                leaderboardTemp[i].prize,
                leaderboardTemp[i].prize
            );
        }
    }

    function withdrawPrize() external override {
        require(
            startTime + timeLimit < block.timestamp,
            Errors.TOURNAMENT_IS_LIVE
        );

        bool hasPlayerJoined = IToTheMooon(gameContractAddress)
            .hasJoinedTournament(msg.sender, id);

        require(hasPlayerJoined, Errors.PLAYER_NOT_JOINED);

        DataTypes.PlayerStats storage player = playerStatsMap[msg.sender];

        if (player.unclaimedPrize > 0) {
            uint256 temp = player.unclaimedPrize;
            player.unclaimedPrize = 0;
            payable(msg.sender).transfer(temp);
        }
    }

    function getRValue(uint256 nPlayers) internal view returns (uint256) {
        if (nPlayers < 10) {
            return IToTheMooon(gameContractAddress).r_values(10);
        } else if (nPlayers < 20) {
            return IToTheMooon(gameContractAddress).r_values(20);
        } else if (nPlayers < 30) {
            return IToTheMooon(gameContractAddress).r_values(30);
        } else if (nPlayers < 40) {
            return IToTheMooon(gameContractAddress).r_values(40);
        } else if (nPlayers < 50) {
            return IToTheMooon(gameContractAddress).r_values(50);
        } else if (nPlayers < 100) {
            return IToTheMooon(gameContractAddress).r_values(100);
        } else {
            return IToTheMooon(gameContractAddress).r_values(1000);
        }
    }

    function quickSort(
        DataTypes.LeaderBoardEntry[] memory leaderboardTemp,
        int256 left,
        int256 right
    ) internal view returns (DataTypes.LeaderBoardEntry[] memory) {
        if (left >= right) return leaderboardTemp;
        uint256 pivot = leaderboardTemp[uint256(left + (right - left) / 2)]
            .highscore;
        (int256 i, int256 j) = (left, right);
        while (i <= j) {
            while (leaderboardTemp[uint256(i)].highscore > pivot) i++;
            while (pivot > leaderboardTemp[uint256(j)].highscore) j--;
            if (i <= j) {
                DataTypes.LeaderBoardEntry memory tmp = leaderboardTemp[
                    uint256(i)
                ];
                leaderboardTemp[uint256(i)] = leaderboardTemp[uint256(j)];
                leaderboardTemp[uint256(j)] = tmp;
                i++;
                j--;
            }
        }
        if (left < j) quickSort(leaderboardTemp, left, j);
        if (i < right) quickSort(leaderboardTemp, i, right);

        return leaderboardTemp;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a > b) {
            return b;
        }
        return a;
    }

    function pow(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 ans = a;

        if (b == 0) return 1e18;

        for (uint256 i = 1; i < b; i++) {
            ans = ans.wadMul(a);
        }
        return ans;
    }
}
