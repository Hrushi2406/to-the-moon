// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {DataTypes} from "../utils/DataTypes.sol";

interface ITournament {
    function hasEnded() external view returns (bool);

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
