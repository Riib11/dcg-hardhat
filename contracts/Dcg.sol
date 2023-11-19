//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

// We import this library to be able to use console.log
import "hardhat/console.sol";

contract Dcg {
    // Game

    struct Game {
        address player1_addr;
        uint player1_cardPower;
        address player2_addr;
        uint player2_cardPower;
        uint turn;
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
    function createGame(
        address player1_addr,
        uint player1_cardPower,
        address player2_addr,
        uint player2_cardPower
    ) public returns (uint gameIx) {
        games.push(
            Game(
                player1_addr,
                player1_cardPower,
                player2_addr,
                player2_cardPower,
                0
            )
        );
        gameIx = games.length;
    }

    // function createExampleGame() public returns (uint gameIx) {
    //     Card[] memory cards1 = new Card[](1);
    //     cards1[0] = Card("monster", 2, 2, Ability.Attack);

    //     Card[] memory cards2 = new Card[](1);
    //     cards2[0] = Card("angel", 1, 3, Ability.Defend);

    //     Game memory game = Game(
    //         Player(msg.sender, cards1),
    //         Player(msg.sender, cards2),
    //         0
    //     );

    //     games.push(game);
    //     gameIx = games.length;

    //     emit CreatedGame(gameIx, game);
    // }

    /*
     * Play your turn in an existing game.
     */
    function playTurn(uint gameIx, Action calldata action) public {
        require(gameIx < games.length);
        Game storage game = games[gameIx];
        if (game.turn % 2 == 0) {
            require(game.player1_addr == msg.sender);
        } else {
            require(game.player2_addr == msg.sender);
        }

        // TODO: do something based on `action`

        game.turn += 1;
    }
}
