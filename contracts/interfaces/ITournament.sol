// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {DataTypes} from "../utils/DataTypes.sol";

interface ITournament {
    function hasEnded() external view returns (bool);

    function getTournamentInfo()
        external
        view
        returns (
            string memory _name,
            uint _timeLimit,
            uint _startTime,
            uint _id,
            uint _joiningFees,
            DataTypes.RewardVars memory _rewardVars,
            uint _nPlayers
        );

    function getRewardInfo()
        external
        view
        returns (
            DataTypes.RewardVars memory,
            uint joiningFees,
            uint nPlayers
        );

    function getLeaderBoard()
        external
        view
        returns (DataTypes.LeaderBoardEntry[] memory);

    function joinTournament() external payable;

    function reFill() external payable;

    function recordScore(address _player, uint _score) external;

    function endTournament() external;

    function withdrawPrize() external;
}
