// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IToTheMooon} from "./interfaces/IToTheMooon.sol";
import {ITournament} from "./interfaces/ITournament.sol";
import {Tournament} from "./Tournament.sol";
import {Errors} from "./utils/Errors.sol";
import {DataTypes} from "./utils/DataTypes.sol";

/**
 * @title ToTheMooon contract
 * @author Sumit Mahajan
 * @dev Primary contract for the ToTheMoon game
 **/
contract ToTheMooon is IToTheMooon, Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    using Strings for string;

    mapping(address => DataTypes.PlayerStruct) players;

    EnumerableSet.Bytes32Set usernames;

    mapping(uint256 => DataTypes.TournamentStruct) public tournaments;

    mapping(uint256 => uint256) public override r_values;

    uint256 public currentTournamentId;

    uint256 public override timeLimit = 86400;

    uint256 public override joiningFees = 0.0001 ether;

    uint256 public override winnersPercentage = 6900;

    constructor() {
        r_values[10] = 1.15e18;
        r_values[20] = 1.075e18;
        r_values[30] = 1.05e18;
        r_values[40] = 1.025e18;
        r_values[50] = 1.02e18;
        r_values[100] = 1.01e18;
        r_values[1000] = 1.005e18;
    }

    function getOwner() public view override returns (address) {
        return owner();
    }

    function getJoinedTournamentsByPlayer(address _player)
        external
        view
        override
        returns (DataTypes.TournamentStruct[] memory)
    {
        DataTypes.TournamentStruct[]
            memory pTournaments = new DataTypes.TournamentStruct[](
                currentTournamentId
            );

        for (uint256 i = 0; i < players[_player].tournamentIds.length(); i++) {
            pTournaments[i] = tournaments[players[_player].tournamentIds.at(i)];
        }

        return pTournaments;
    }

    function hasJoinedTournament(address _wallet, uint256 tournamentId)
        external
        view
        override
        returns (bool)
    {
        return players[_wallet].tournamentIds.contains(tournamentId);
    }

    function getUserName(address wallet_)
        external
        view
        override
        returns (string memory)
    {
        DataTypes.PlayerStruct storage player = players[wallet_];
        return player.username;
    }

    function setUserName(string memory _name, uint256 _strlen)
        external
        override
    {
        require(
            !usernames.contains(keccak256(abi.encodePacked(_name))),
            Errors.USERNAME_TAKEN
        );

        DataTypes.PlayerStruct storage player = players[msg.sender];

        usernames.remove(keccak256(abi.encodePacked(player.username)));
        usernames.add(keccak256(abi.encodePacked(_name)));

        player.username = _strlen > 20 ? substring(_name, 0, 20) : _name;
    }

    function addPlayerToTournament(address _playerAddress) external override {
        require(
            msg.sender == tournaments[currentTournamentId].contractAddress,
            Errors.CALLER_NOT_AUTHORIZED
        );

        DataTypes.PlayerStruct storage player = players[_playerAddress];

        player.tournamentIds.add(currentTournamentId);

        if (!player.hasRegistered) {
            player.hasRegistered = true;
        }
    }

    function createTournament(
        string memory _name,
        DataTypes.RewardVars memory _rewardVars
    ) external payable override onlyOwner {
        require(
            currentTournamentId == 0 ||
                (tournaments[currentTournamentId].startTime + timeLimit <
                    block.timestamp &&
                    ITournament(
                        tournaments[currentTournamentId].contractAddress
                    ).hasEnded()),
            Errors.TOURNAMENT_IS_LIVE
        );
        require(
            _rewardVars.isSponsored ? msg.value == _rewardVars.prizePool : true,
            Errors.NOT_ENOUGH_FUNDS_PROVIDED
        );

        ITournament tournament = new Tournament(
            ++currentTournamentId,
            _name,
            block.timestamp,
            address(this),
            _rewardVars
        );
        tournaments[currentTournamentId] = DataTypes.TournamentStruct(
            currentTournamentId,
            _name,
            block.timestamp,
            address(tournament),
            _rewardVars
        );
    }

    function setTimeLimit(uint256 timeLimit_) external override onlyOwner {
        timeLimit = timeLimit_;
    }

    function setJoiningFees(uint256 joiningFees_) external override onlyOwner {
        joiningFees = joiningFees_;
    }

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
