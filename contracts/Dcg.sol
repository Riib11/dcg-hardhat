//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

// We import this library to be able to use console.log
import "hardhat/console.sol";

contract Dcg {
    event CreatedGame(uint gameIx, Game game);
    event UpdatedGame(uint gameIx, Game game);

    // Card

    struct Card {
        string name;
        uint strength;
        uint health;
        Ability ability;
    }

    enum Ability {
        // TODO
        Attack,
        Defend
    }

    // Game

    struct Game {
        Player player1;
        Player player2;
        uint turn;
    }

    struct Player {
        address addr;
        Card[] cards;
    }

    Game[] games;

    function getGames() public view returns (Game[] memory) {
        return games;
    }

    // Action

    struct Action {
        uint source;
        uint target;
        ActionType actionType;
    }

    enum ActionType {
        Attack
    }

    constructor() {}

    /*
     * Create a new game.
     */
    function createGame(Game calldata game) public returns (uint gameIx) {
        require(game.player1.addr == msg.sender);
        require(game.turn == 0);

        games.push(game);
        gameIx = games.length;

        emit CreatedGame(gameIx, game);
    }

    /*
     * Play your turn in an existing game.
     */
    function playTurn(uint gameIx, Action calldata action) public {
        require(gameIx < games.length);
        Game storage game = games[gameIx];
        if (game.turn % 2 == 0) {
            require(game.player1.addr == msg.sender);
        } else {
            require(game.player2.addr == msg.sender);
        }

        // TODO: do something based on `action`

        game.turn += 1;

        emit UpdatedGame(gameIx, game);
    }
}
