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
 * @author ToTheMooon
 * @dev Handles Tournament logic for sponsored and daily tournaments of ToTheMooon
 * @notice Contract for any Tournament in ToTheMooon game
 **/
contract Tournament is ITournament, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;

    using PercentageMath for uint256;
    using WadRayMath for uint256;

    /// @dev Tournament id
    uint256 public id;

    /// @dev Name of the tournament
    string public name;

    /// @dev Starting timestamp for tournament
    uint256 public startTime;

    /// @dev Time limit for which tournament will be live after startTime
    uint256 public timeLimit;

    /// @dev Joining fees a player needs to pay to join the tournament
    uint256 public joiningFees;

    /// @dev Contract address for ToTheMooon contract from where this tournament was initialized
    address public gameContractAddress;

    /// @dev Admin caller that can perform certain restricted actions
    address public approvedCaller;

    /// @dev Tracks if the tournament is live or not
    bool public override hasEnded;

    /// @dev Reward information for this tournament
    DataTypes.RewardVars public rewardVars;

    /// @dev Set of participants addresses
    EnumerableSet.AddressSet playerListSet;

    /// @dev Stores player's score and reward information
    mapping(address => DataTypes.PlayerStats) public playerStatsMap;

    /**
     * @dev To track whenever score was recorded for any player
     * @param player player's address
     * @param timestamp timestamp
     * @param score score
     **/
    event ScoreRecorded(
        address indexed player,
        uint256 indexed timestamp,
        uint256 score
    );

    /**
     * @dev To track funds added by players
     * @param payer payer
     * @param timestamp timestamp
     * @param funds amount
     **/
    event FundsAdded(
        address indexed payer,
        uint256 indexed timestamp,
        uint256 funds
    );

    /**
     * @dev To track funds withdrawals from contract by approved caller
     * @param timestamp timestamp
     * @param funds amount
     **/
    event FundsWithdrawn(uint256 indexed timestamp, uint256 funds);

    /**
     * @dev Initialize the Tournament contract
     * @notice Initialize the Tournament
     * @param id_ tournament id
     * @param name_ tournament name
     * @param startTime_ starting timestamp
     * @param gameContractAddress_ contract address for tournament
     * @param _rewardVars reward information
     **/
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

    /**
     * @dev Allows only approved caller to perform certain functionality
     * @notice Allows only approved caller to perform certain functionality
     **/
    modifier onlyApprovedCaller() {
        require(msg.sender == approvedCaller, Errors.CALLER_NOT_AUTHORIZED);
        _;
    }

    /**
     * @dev Fallback function to recieve funds
     * @notice Fallback function to recieve funds
     **/
    receive() external payable {
        emit FundsAdded(msg.sender, block.timestamp, msg.value);
    }

    /**
     * @dev Allows approved caller to withdraw funds from contract's balance
     * @notice Allows approved caller to withdraw funds from contract's balance
     * @param funds amount of wei that needs to be withdrawn
     **/
    function withdrawContractFunds(
        uint256 funds
    ) external onlyApprovedCaller nonReentrant {
        require(funds <= address(this).balance, Errors.NOT_ENOUGH_FUNDS);
        (bool success, ) = msg.sender.call{value: funds}("");
        require(success, "Transfer failed.");
        // payable(msg.sender).transfer(funds);

        emit FundsWithdrawn(block.timestamp, funds);
    }

    /**
     * @dev Returns the general information about current touranment
     * @notice Returns the general information about current touranment
     * @return _name name
     * @return _timeLimit time limit for which tournament will be live since start time
     * @return _startTime starting timestamp
     * @return _id tournament id
     * @return _joiningFees joining fees in wei to join the tournament
     * @return _rewardVars reward information
     * @return _nPlayers no of players participating in the current tournament
     **/
    function getTournamentInfo()
        public
        view
        override
        returns (
            string memory _name,
            uint256 _timeLimit,
            uint256 _startTime,
            uint256 _id,
            uint256 _joiningFees,
            DataTypes.RewardVars memory _rewardVars,
            uint256 _nPlayers
        )
    {
        (_rewardVars, , _nPlayers) = getRewardInfo();

        _name = name;
        _timeLimit = timeLimit;
        _startTime = startTime;
        _id = id;
        _joiningFees = joiningFees;
    }

    /**
     * @dev Get reward information for current tournament
     * @notice Get reward information for current tournament
     * @return _rewardVars Reward information
     * @return _joiningFees Joining Fees for tournament
     * @return _nPlayers No of players participating in the current tournament
     **/
    function getRewardInfo()
        public
        view
        override
        returns (DataTypes.RewardVars memory, uint256, uint256)
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

    /**
     * @dev Returns leaderboard with estimated prizes based on current rankings of all the participants
     * @notice Returns leaderboard with estimated prizes based on current rankings of all the participants
     * @return leaderboard skd
     **/
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

    /**
     * @dev Called by player to join the tournament
     * @notice Called by player to join the tournament
     **/
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

    /**
     * @dev Allows player to refill their attempts to record score
     * @notice Allows player to refill their attempts to record score
     **/
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

    /**
     * @dev Allows approvedCaller to update a player's highscore after player submits it
     * @notice Allows approvedCaller to update a player's highscore after player submits it
     * @param _player player's address
     * @param _score player's score
     **/
    function recordScore(
        address _player,
        uint256 _score
    ) external override onlyApprovedCaller {
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

    /**
     * @dev Allows the approvedCaller to end the tournament after it's time limit is finished
     * Calculates final prizes and stores in playerStatsMap storage mapping
     * @notice Allows the approvedCaller to end the tournament after it's time limit is finished
     **/
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

    /**
     * @dev Allows caller/player to withdraw their allocated prize after tournament has ended
     * @notice Allows caller/player to withdraw their allocated prize after tournament has ended
     **/
    function withdrawPrize() external override nonReentrant {
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
            (bool success, ) = msg.sender.call{value: temp}("");
            require(success, "Transfer failed.");
            // payable(msg.sender).transfer(temp);
        }
    }

    /**
     * @dev Returns "r" value for the Geometric progression series based rewards calculation
     * Currently hardcoded based on number of players participating to distribute rewards fairly
     * @param nPlayers Number of players participating in the tournament
     * @return r "r" value
     **/
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

    /**
     * @dev Quicksort implementation to sort the leaderboard based on plater highscores
     * @param leaderboardTemp Current unsorted leaderboard
     * @param left left index
     * @param right right index
     * @return sortedLeaderboard Sorted leaderboard array
     **/
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

    /**
     * @dev Returns the smaller of 2 numbers
     * @param a number 1
     * @param b number 2
     * @return min minimum of a and b
     **/
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a > b) {
            return b;
        }
        return a;
    }

    /**
     * @dev Calculates a raised to b
     * @param a base
     * @param b exponent
     * @return a_raisedTo_b a ^ b
     **/
    function pow(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 ans = a;

        if (b == 0) return 1e18;

        for (uint256 i = 1; i < b; i++) {
            ans = ans.wadMul(a);
        }
        return ans;
    }
}
