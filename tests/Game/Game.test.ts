import {Game} from "BitChess/Game/Game.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {Move} from "../../src/Game/Move.ts";
import {BitMove} from "../../src/MoveGen/BitMove.ts";
import {Square} from "../../src/Board/Square.ts";
import { Piece } from "BitChess/Board/Piece.ts";
import {assertThrows} from "https://deno.land/std@0.219.0/assert/assert_throws.ts";

Deno.test('it starts a new game', () => {

    const game = new Game()

    assertEquals(game.getFenNotation(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    assertEquals('white', game.getSideToMove())
})

Deno.test('it makes moves and un-does them', () => {
    const game = new Game()
    game.makeMove('e4')
    game.undoMove()

    assertEquals(game.getFenNotation(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    assertEquals('white', game.getSideToMove())

    game.makeMove('e4')
    assertEquals(game.getFenNotation(), 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
    assertEquals('black', game.getSideToMove())
})

Deno.test('it goes to previous move and makes a variation', () => {
    const game = new Game()

    const dubiousMoves = [
        game.makeMove('e4'),
        game.makeMove('e5'),
        game.makeMove('Ke2'),
        game.makeMove('Ke7'),
    ]
    // let's go back and see what would have happened if we prioritized king safety
    game.gotoMove(dubiousMoves[1].getId())
    game.makeMove('Nf3') // much better
    game.makeMove('d5')

    assertEquals(
        game.getMoveNavigator().serialize(),
        '1. e4 e5 2. Ke2 (2. Nf3 d5) 2... Ke7'
    )

    // what if we tried d4 instead?
    game.gotoMove(-1)
    game.makeMove('d4')
    assertEquals(game.getMoveNavigator().serialize(), '1. e4 (1. d4) 1... e5 2. Ke2 (2. Nf3 d5) 2... Ke7')


    // test a couple throws
    assertThrows(() => {game.gotoMove(99)},'throws on invalid move id')


})


Deno.test('it plays the opera game', () => {

    const game = new Game()

    game.makeMove('e4')
    game.makeMove('e5')
    game.makeMove('Nf3')
    game.makeMove('d6')

    game.makeMove('d4')
    game.makeMove('Bg4')

    game.makeMove('dxe5')
    game.makeMove('Bxf3')

    game.makeMove('Qxf3')
    game.makeMove('dxe5')

    game.makeMove('Bc4')
    game.makeMove('Nf6')

    game.makeMove('Qb3')
    game.makeMove('Qe7')

    game.makeMove('Nc3')
    game.makeMove('c6')

    game.makeMove('Bg5')
    game.makeMove('b5')

    game.makeMove('Nxb5')
    game.makeMove('cxb5')

    game.makeMove('Bxb5')
    game.makeMove('Nbd7')

    game.makeMove('O-O-O')
    game.makeMove('Rd8')

    game.makeMove('Rxd7')
    game.makeMove('Rxd7')

    game.makeMove('Rd1')
    game.makeMove('Qe6')

    game.makeMove('Bxd7')
    game.makeMove('Nxd7')

    game.makeMove('Qb8')
    game.makeMove('Nxb8')

    game.makeMove('Rd8')

    game.render()

    assertEquals(
        game.getMoveNavigator().serialize(),
        '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#'
    )


    console.log(game.getMoveNavigator().serialize())

})


Deno.test('it plays the opera game in coordinate notation', () => {

    const game = new Game()

    game.setNotation('coordinate')

    game.makeMove('e2e4')
    game.makeMove('e7e5')
    game.makeMove('g1f3')
    game.makeMove('d7d6')

    game.makeMove('d2d4')
    game.makeMove('c8g4')

    // well some of the opera game

    game.render()

    assertEquals(
        game.getMoveNavigator().serialize(),
        '1. e2e4 e7e5 2. g1f3 d7d6 3. d2d4 c8g4'
    )


    console.log(game.getMoveNavigator().serialize())

})



Deno.test('it gets candidate moves', () => {

    const game = new Game('8/8/4p3/pb1p4/8/2P1k3/2K5/7q b - - 0 51')

    game.render()
    let moves

    // throws on invalid square
    assertThrows(() => {game.getCandidateMoves('z1')})
    // throws on empty square
    assertThrows(() => {game.getCandidateMoves('d8')})


    // just the moves from a square
    moves = game.getCandidateMoves('a5')
    assertEquals(moves, [new Move(new BitMove(Square.a5, Square.a4, Piece.BlackPawn, 0))])

    // all moves for black
    moves = game.getCandidateMoves('black')
    const pawnMoves = moves.filter((move) => move.piece == 'p')
    const bishopMoves = moves.filter((move) => move.piece == 'b')
    const queenMoves = moves.filter((move) => move.piece == 'q')
    const kingMoves = moves.filter((move) => move.piece == 'k')
    assertEquals(pawnMoves.length, 3)
    assertEquals(bishopMoves.length, 9)
    assertEquals(queenMoves.length, 17)
    assertEquals(kingMoves.length, 5)
    // all moves for white
    moves = game.getCandidateMoves('white')
    assertEquals(moves.length, 3)

})

Deno.test('it handles undo moves', () => {
    const game = new Game()

    // throws when game have no moves
    assertThrows(() => {game.undoMove()})

    game.makeMove('e4')

    game.makeMove('e5')
    game.undoMove()
    game.makeMove('e6') // meant to play French
    game.undoMove()
    game.makeMove('c5') // wait no, sicilian

    game.render()

    assertEquals(
        game.getFenNotation(),
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2'
    )

})