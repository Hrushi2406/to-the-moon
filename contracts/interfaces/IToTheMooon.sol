// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {DataTypes} from "../utils/DataTypes.sol";

interface IToTheMooon {
    function getOwner() external view returns (address);

    function timeLimit() external view returns (uint);

    function joiningFees() external view returns (uint);

    function winnersPercentage() external view returns (uint);

    function r_values(uint) external view returns (uint);

    function getJoinedTournamentsByPlayer(address player_)
        external
        view
        returns (DataTypes.TournamentStruct[] memory);

    function hasJoinedTournament(address _wallet, uint tournamentId)
        external
        view
        returns (bool);

    function getUserName(address wallet_) external view returns (string memory);

    function setUserName(string memory _name, uint _strlen) external;

    function addPlayerToTournament(address player_) external;

    function createTournament(
        string memory name_,
        DataTypes.RewardVars memory rewardVars_
    ) external payable;

    function setTimeLimit(uint timeLimit_) external;

    function setJoiningFees(uint joiningFees_) external;
}
