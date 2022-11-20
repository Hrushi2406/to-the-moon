// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

library Errors {
    string public constant CALLER_NOT_AUTHORIZED = "CALLER_NOT_AUTHORIZED";
    string public constant USERNAME_TAKEN = "USERNAME_TAKEN";
    string public constant TOURNAMENT_IS_LIVE = "TOURNAMENT_IS_LIVE";
    string public constant TOURNAMENT_HAS_ENDED = "TOURNAMENT_HAS_ENDED";
    string public constant PLAYER_NOT_JOINED = "PLAYER_NOT_JOINED";
    string public constant NOT_ENOUGH_FUNDS_PROVIDED =
        "NOT_ENOUGH_FUNDS_PROVIDED";
    string public constant NOT_ENOUGH_FUNDS = "NOT_ENOUGH_FUNDS";
    string public constant NO_ATTEMPTS_LEFT = "NO_ATTEMPTS_LEFT";
    string public constant ATTEMPTS_LEFT = "ATTEMPTS_LEFT";

    string public constant MATH_ADDITION_OVERFLOW = "MATH_ADDITION_OVERFLOW";
    string public constant MATH_MULTIPLICATION_OVERFLOW =
        "MATH_MULTIPLICATION_OVERFLOW";
    string public constant MATH_DIVISION_BY_ZERO = "MATH_DIVISION_BY_ZERO";
}
