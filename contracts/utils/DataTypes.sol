// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

library DataTypes {
    struct PlayerStruct {
        bool hasRegistered;
        string username;
        EnumerableSet.UintSet tournamentIds;
    }

    struct TournamentStruct {
        uint id;
        string name;
        uint startTime;
        address contractAddress;
        RewardVars rewardVars;
    }

    struct PlayerStats {
        uint rank;
        uint highscore;
        uint attemptsLeft;
        uint reFills;
        uint allocatedPrize;
        uint unclaimedPrize;
    }

    struct LeaderBoardEntry {
        address wallet;
        string username;
        uint highscore;
        uint prize;
    }

    struct RewardVars {
        bool isSponsored;
        uint prizePool;
        uint nWinners;
        string sponsorMetadata;
        uint commissionPercentage;
    }
}
