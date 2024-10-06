import {assertEquals} from "@std/assert";
import {assertThrows} from "@std/assert";
import {Game} from "../../../src/Game/Game.ts";
import {Move} from "../../../src/Game/Move.ts";
import {BitMove} from "../../../src/MoveGen/BitMove.ts";
import {Square} from "../../../src/Board/Square.ts";
import {Piece} from "../../../src/Board/Piece.ts";
import {PgnParser} from "../../../src/Notation/PgnParser.ts";
import {Renderer} from "../../../src/Board/Renderer.ts";

const renderer = new Renderer()
const assertSerializesMovesAs = (game: Game, expected: string): void =>  {
    assertEquals((new PgnParser()).serializeMoves(game.getMoveNavigator().getMove(0)), expected)
}

Deno.test('it starts a new game', () => {

    const game = new Game()

    assertEquals(game.getFenNotation().serialize(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    assertEquals('white', game.getSideToMove())
})

Deno.test('it makes moves and un-does them', () => {
    const game = new Game()
    game.makeMove('e4')
    game.undoMove()

    assertEquals(game.getFenNotation().serialize(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    assertEquals('white', game.getSideToMove())

    game.makeMove('e4')
    assertEquals(game.getFenNotation().serialize(), 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
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

    assertSerializesMovesAs(game, '1. e4 e5 2. Ke2 (2. Nf3 d5) 2... Ke7')

    // what if we tried d4 instead?
    game.gotoMove(-1)
    game.makeMove('d4')
    assertSerializesMovesAs(game, '1. e4 (1. d4) 1... e5 2. Ke2 (2. Nf3 d5) 2... Ke7')

    // test invalid move
    assertThrows(() => {game.gotoMove(99)},Error, 'Could not find','throws on invalid move id')

})


Deno.test('it plays the opera game', () => {

    const game = new Game()

    game.setTag('Site', 'Opera House')
    game.setTag('White', 'Morphy, Paul')
    game.setTag('Black', 'Dukes, Pair')
    game.setTag('Date', '1900.??.??')

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

    renderer.render(game)

    assertSerializesMovesAs(game, '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#')

    // sets game termination?
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, 'white')
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), true)
    assertEquals(game.isMate(), true)
    assertEquals(game.isDraw(), false)


    const serialized = (new PgnParser).serialize(game)
    assertEquals(serialized, `[Event "Casual Game"]
[Site "Opera House"]
[Round "1"]
[White "Morphy, Paul"]
[Black "Dukes, Pair"]
[Date "1900.??.??"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0
`)

    console.log(serialized)

})


Deno.test('it plays the opera game in coordinate notation', () => {

    const game = new Game()

    game.makeMove('e2e4', 'coordinate')
    game.makeMove('e7e5', 'coordinate')
    game.makeMove('g1f3', 'coordinate')
    game.makeMove('d7d6', 'coordinate')

    game.makeMove('d2d4', 'coordinate')
    game.makeMove('c8g4', 'coordinate')

    // well some of the opera game

    renderer.render(game)

    assertSerializesMovesAs(game, '1. e4 e5 2. Nf3 d6 3. d4 Bg4') // still serializes as algebraic

    assertEquals(game.getStatus().terminationType, 'unterminated')
    assertEquals(game.getStatus().winner, null)
    assertEquals(game.isGameOver(), false)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), false)
})

Deno.test('it gets candidate moves', () => {

    const game = new Game('8/8/4p3/pb1p4/8/2P1k3/2K5/7q b - - 0 51')

    renderer.render(game)
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

    renderer.render(game)

    assertEquals(
        game.getFenNotation().serialize(),
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2'
    )
})

Deno.test('it handles resignation', () => {

    let game

    game = new Game()
    game.setResigns('white')
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, 'black')
    assertEquals(game.getStatus().drawType, null)
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), false)

    game = new Game()
    game.setResigns('black')
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, 'white')
    assertEquals(game.getStatus().drawType, null)
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), false)

    // cannot make a move after game is over
    assertThrows(() => {game.makeMove('e4')})
})

Deno.test('it handles draw by agreement', () => {
    const game = new Game()
    game.setDrawByAgreement()
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, null)
    assertEquals(game.getStatus().drawType, 'agreement')
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), true)

    // cannot make a move after game is over
    assertThrows(() => {game.makeMove('e4')})
})

Deno.test('it handles stalemate with no legal moves', () => {
    const game = new Game('8/8/8/8/8/7k/4q2P/7K b - - 0 1')
    game.makeMove('Qf2')
    game.getStatus()
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, null)
    assertEquals(game.getStatus().drawType, 'stalemate')
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), true)
})

Deno.test('it handles draw by insufficient material', () => {
    const game = new Game('8/8/8/8/8/7k/6N1/7K w - - 0 1')
    game.makeMove('Ne1')
    game.getStatus()
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, null)
    assertEquals(game.getStatus().drawType, 'insufficient-material')
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), true)
})

Deno.test('it handles draw by fifty move rule', () => {
    const game = new Game('8/3q4/8/8/3Q4/7k/6N1/7K b - - 49 1')
    game.makeMove('Qa7')
    game.getStatus()
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, null)
    assertEquals(game.getStatus().drawType, 'fifty-move-rule')
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), true)
})

Deno.test('it handles draw by three fold repetition', () => {
    const game = new Game('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2')
    game.makeMove('Ke2')
    game.makeMove('Ke7') // first - repetition starts here because castle rights have finished changing
    game.makeMove('Ke1')
    game.makeMove('Ke8')
    game.makeMove('Ke2')
    game.makeMove('Ke7') // second
    game.makeMove('Ke1')
    game.makeMove('Ke8')
    game.makeMove('Ke2')
    game.makeMove('Ke7')  // third
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, null)
    assertEquals(game.getStatus().drawType, 'three-fold-repetition')
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), true)
})

Deno.test('it handles draw by three fold repetition after switching to new line', () => {
    const game = new Game('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2')
    game.makeMove('Ke2')
    game.makeMove('Ke7') // first - repetition starts here because castle rights have finished changing
    game.makeMove('Ke1')
    game.makeMove('Ke8')
    const prev = game.makeMove('Ke2')

    // start variation
    game.makeMove('Nc6')
    game.makeMove('Nc3')

    // back into our main line
    game.gotoMove(prev.getId())
    game.makeMove('Ke7') // second

    game.makeMove('Ke1')
    game.makeMove('Ke8')
    game.makeMove('Ke2')
    game.makeMove('Ke7')  // third
    assertEquals(game.getStatus().terminationType, 'normal')
    assertEquals(game.getStatus().winner, null)
    assertEquals(game.getStatus().drawType, 'three-fold-repetition')
    assertEquals(game.isGameOver(), true)
    assertEquals(game.isCheck(), false)
    assertEquals(game.isMate(), false)
    assertEquals(game.isDraw(), true)
})

Deno.test('it loads new game from Pgn File Content', () => {
    const game = Game.load(`[Event "Monte Carlo"]
[Site "Monte Carlo MNC"]
[Date "1968.04.10"]
[EventDate "1968.04.03"]
[Round "7"]
[Result "1-0"]
[White "Mikhail Botvinnik"]
[Black "Lajos Portisch"]
[ECO "A22"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "51"]

1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Be6 6.Nf3 Nc6
7.O-O Nb6 8.d3 Be7 9.a3 a5 10.Be3 O-O 11.Na4 Nxa4 12.Qxa4 Bd5
13.Rfc1 Re8 14.Rc2 Bf8 15.Rac1 Nb8 16.Rxc7 Bc6 17.R1xc6 bxc6
18.Rxf7 h6 19.Rb7 Qc8 20.Qc4+ Kh8 21.Nh4 Qxb7 22.Ng6+ Kh7
23.Be4 Bd6 24.Nxe5 g6 25.Bxg6+ Kg7 26.Bxh6+ 1-0`)

    game.gotoMove(50)
    renderer.render(game)

})