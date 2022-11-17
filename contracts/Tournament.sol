// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { PercentageMath } from "./math/PercentageMath.sol";
import { WadRayMath } from "./math/WadRayMath.sol";

import "./ToTheMooon.sol";


/**
 * @title Tournament contract
 * @author Sumit Mahajan
 * @dev Handles Tournament logic for sponsored and daily tournaments of ToTheMooon
 **/
contract Tournament is ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    using PercentageMath for uint;
    using WadRayMath for uint;

    struct PlayerStats {
        
        uint rank;

        uint highscore;

        uint allocatedPrize;

        uint unclaimedPrize;
    }
    
    struct LeaderBoardEntry {
        
        address wallet;
        
        string username;
        
        uint highscore;
        
        uint prize;
    }

    uint public id;

    string public name;

    uint public startTime;

    uint public timeLimit;

    uint public joiningFees;
    
    address public gameContract;
    
    address public approvedCaller;
    
    RewardVars public rewardVars;

    EnumerableSet.AddressSet playerListSet;

    mapping(address => PlayerStats) public playerStatsMap;

    constructor(
        uint id_, string memory name_, uint startTime_, address gameContract_,  RewardVars memory _rewardVars
    ) {
        id = id_;
        name = name_;
        startTime = startTime_;
        gameContract = gameContract_;
        timeLimit = ToTheMooon(gameContract).timeLimit();
        joiningFees = ToTheMooon(gameContract).joiningFees();
        approvedCaller = ToTheMooon(gameContract).owner();
        rewardVars = _rewardVars;
    }
    
    modifier onlyApprovedCaller() {
        require(msg.sender == approvedCaller, "Not authorized");
        _;
    }
    
    function getLeaderBoard() public view returns(LeaderBoardEntry[] memory) {
        LeaderBoardEntry[] memory leaderboardTemp = new LeaderBoardEntry[](playerListSet.length());
        
        for(uint i=0; i<playerListSet.length(); i++) {
            ( , string memory username) = ToTheMooon(gameContract).isPlayerRegistered(msg.sender);
            
            leaderboardTemp[i] = LeaderBoardEntry(
                playerListSet.at(i),
                username,
                playerStatsMap[playerListSet.at(i)].highscore,
                0
            );
            
        }
        
        leaderboardTemp = quickSort(leaderboardTemp, 0, int256(playerListSet.length()-1));
        
        RewardVars memory currentRewardVars = RewardVars(
            rewardVars.isSponsored,
            rewardVars.isSponsored ? rewardVars.prizePool
            : playerListSet.length() * joiningFees 
            - (playerListSet.length() * joiningFees).percentMul(rewardVars.commissionPercentage),
            min(
                playerListSet.length().percentMul(ToTheMooon(gameContract).winnersPercentage()),
                rewardVars.isSponsored ? rewardVars.nWinners : ToTheMooon(gameContract).winnersPercentage() / 10
            ),
            rewardVars.sponsorMetadata,
            rewardVars.commissionPercentage
        );
        
        uint r = getRValue(playerListSet.length());
        
        uint a = currentRewardVars.prizePool * (r - 1e6) / (pow(r, currentRewardVars.nWinners) - 1e6);
        
        for(uint i=0; i<playerListSet.length(); i++) {
            leaderboardTemp[i].prize = a * pow(r,i);
        }
        
        return leaderboardTemp;
    }

    function joinTournament() external payable {
        require(startTime + timeLimit > block.timestamp, "Tournament has ended");
        
        (bool hasPlayerRegistered, ) = ToTheMooon(gameContract).isPlayerRegistered(msg.sender);
        require(hasPlayerRegistered, "Player not registered");
        
        require(msg.value == joiningFees, "Joining Fees not provided");

        playerListSet.add(msg.sender);
    }

    function recordScore(address _player, uint _score) external onlyApprovedCaller {
        require(startTime + timeLimit > block.timestamp, "Tournament has ended");
        
        playerStatsMap[_player].highscore = _score;
    }

    function endTournament() external onlyApprovedCaller {
        require(startTime + timeLimit < block.timestamp, "Tournament is still live");
        
        LeaderBoardEntry[] memory leaderboardTemp = getLeaderBoard();
        
        for(uint i=0; i<playerListSet.length(); i++) {
            playerStatsMap[leaderboardTemp[i].wallet] = PlayerStats(
                i+1,
                leaderboardTemp[i].highscore,
                leaderboardTemp[i].prize,
                leaderboardTemp[i].prize
            );
        }
    }
    
    function withdrawPrize() external {
        PlayerStats storage player = playerStatsMap[msg.sender];
        
        if(player.unclaimedPrize > 0) {
            player.unclaimedPrize = 0;
            payable(msg.sender).transfer(player.unclaimedPrize);
        }
    }
    
    function getRValue(uint nPlayers) internal view returns(uint) {
        if(nPlayers < 10) {
            return ToTheMooon(gameContract).r_values(10);
        } else if(nPlayers < 20) {
            return ToTheMooon(gameContract).r_values(20);
        } else if(nPlayers < 30) {
            return ToTheMooon(gameContract).r_values(30);
        } else if(nPlayers < 40) {
            return ToTheMooon(gameContract).r_values(40);
        } else if(nPlayers < 50) {
            return ToTheMooon(gameContract).r_values(50);
        } else if(nPlayers < 100) {
            return ToTheMooon(gameContract).r_values(100);
        } else {
            return ToTheMooon(gameContract).r_values(1000);
        }
    }
    
    function quickSort(LeaderBoardEntry[] memory leaderboardTemp, int256 left, int256 right) 
        internal view returns(LeaderBoardEntry[] memory) 
    {
        if (left >= right) return leaderboardTemp;
        uint256 pivot = leaderboardTemp[uint256(left + (right - left) / 2)].highscore;
        (int256 i, int256 j) = (left, right);
        while (i <= j) {
            while (leaderboardTemp[uint256(i)].highscore > pivot) i++;
            while (pivot > leaderboardTemp[uint256(j)].highscore) j--;
            if (i <= j) {
                LeaderBoardEntry memory tmp = leaderboardTemp[uint256(i)];
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
    
    function min(uint a, uint b) internal pure returns(uint) {
        if(a > b) {
            return b;
        }
        return a;
    }
    
    function pow(uint a, uint b) internal pure returns(uint) {
        uint ans = a;
        for(uint i=0; i<b; i++) {
            ans = ans.wadMul(a);
        }
        return ans;
    }

}