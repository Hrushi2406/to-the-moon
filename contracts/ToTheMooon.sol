// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./Tournament.sol";

/**
 * @title ToTheMooon contract
 * @author Sumit Mahajan
 * @dev Primary contract for the ToTheMoon game
 **/
contract ToTheMooon is Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    
    using Strings for string;

    struct PlayerStruct {
        bool hasRegistered;
        string username;
        EnumerableSet.AddressSet tournaments;
    }

    struct TournamentStruct {
        string name;
        uint startTime;
        address contractAddress;
        RewardVars rewardVars;
    }
    
    mapping (address => PlayerStruct) players;
    
    EnumerableSet.Bytes32Set usernames;

    mapping (uint => TournamentStruct) public tournaments;

    mapping (uint => uint) public r_values;

    uint public currentTournamentId;

    uint public timeLimit = 86400;
    
    uint public joiningFees = 10 trx;
    
    uint public winnersPercentage = 6900;
    
    constructor() {
        r_values[10] = 1.15e6;
        r_values[20] = 1.075e6;
        r_values[30] = 1.05e6;
        r_values[40] = 1.025e6;
        r_values[50] = 1.02e6;
        r_values[100] = 1.01e6;
        r_values[1000] = 1.005e6;
    }
    
    function isPlayerRegistered(address wallet_) external view returns(bool, string memory) {
        PlayerStruct storage player = players[wallet_];
        return (player.hasRegistered, player.username);
    }

    function register(string memory _name, uint _strlen) external {
        require(!usernames.contains(keccak256(abi.encodePacked(_name))), "Username already taken");
        
        PlayerStruct storage player = players[msg.sender];
        if (!player.hasRegistered) {
            usernames.add(keccak256(abi.encodePacked(_name)));
            player.username = _strlen > 20 ? substring(_name, 0, 20) : _name;
            player.hasRegistered = true;
        }
    }

    function createTournament(string memory _name, RewardVars memory _rewardVars) external payable onlyOwner {
        require(
            tournaments[currentTournamentId].startTime + timeLimit < block.timestamp, 
            "Tournament is still live"
        );
        
        Tournament tournament = new Tournament(
            ++currentTournamentId,
            _name,
            block.timestamp,
            address(this),
            _rewardVars
        );
        tournaments[currentTournamentId] = TournamentStruct(
            _name,
            block.timestamp,
            address(tournament),
            _rewardVars
        );
    }
    
    function setTimeLimit(uint timeLimit_) external onlyOwner {
        timeLimit = timeLimit_;
    }
    
    function setJoiningFees(uint joiningFees_) external onlyOwner {
        joiningFees = joiningFees_;
    }
    
    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }
}

struct RewardVars {
    bool isSponsored;
    uint prizePool;
    uint nWinners;
    string sponsorMetadata;
    uint commissionPercentage;
}