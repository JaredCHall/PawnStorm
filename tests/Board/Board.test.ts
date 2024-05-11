import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {Board} from "../../src/Board/Board.ts";
import {Square} from "../../src/Board/Square.ts";
import {binToString} from "../../src/Utils.ts";
import {Piece, Color} from "../../src/Board/Piece.ts";
import {assertThrows} from "https://deno.land/std@0.219.0/assert/assert_throws.ts";

const board = new Board()

const assertSquareEquals = (square: Square, pieceCode: number) => {
    assertEquals(board.squareList[square], pieceCode, `Expected ${binToString(pieceCode,8)} on square ${square}`)
}

Deno.test('it initializes square indexes correctly' , () => {
    for(let i=0; i<64; i++){
        assertEquals(board.square64Indexes[board.square120Indexes[i]], i)
    }
})


Deno.test('it initializes square list correctly', () => {

    const oob = Square.Invalid
    const expectedSquareList = [
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob,   0,   0,   0,   0,   0,   0,   0,   0, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
    ]
    assertEquals(Array.from(board.squareList), expectedSquareList, 'squareList is set correctly')
})

Deno.test('it initializes square ranks correctly', () => {
    const expectedList = [
        7, 7, 7, 7, 7, 7, 7, 7,
        6, 6, 6, 6, 6, 6, 6, 6,
        5, 5, 5, 5, 5, 5, 5, 5,
        4, 4, 4, 4, 4, 4, 4, 4,
        3, 3, 3, 3, 3, 3, 3, 3,
        2, 2, 2, 2, 2, 2, 2, 2,
        1, 1, 1, 1, 1, 1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0,
    ]
    assertEquals(Array.from(board.squareRanks), expectedList, 'squaresRanks is set correctly')
})

Deno.test('it initializes square files correctly', () => {
    const expectedList = [
        0, 1, 2, 3, 4, 5, 6, 7,
        0, 1, 2, 3, 4, 5, 6, 7,
        0, 1, 2, 3, 4, 5, 6, 7,
        0, 1, 2, 3, 4, 5, 6, 7,
        0, 1, 2, 3, 4, 5, 6, 7,
        0, 1, 2, 3, 4, 5, 6, 7,
        0, 1, 2, 3, 4, 5, 6, 7,
        0, 1, 2, 3, 4, 5, 6, 7,
    ]
    assertEquals(Array.from(board.squareFiles), expectedList, 'squareFiles is set correctly')
})

Deno.test('it initializes square distances correctly', () => {

    assertEquals(board.squareDistances.length, 64, 'Distances generated for every square')
    for(let i = 0;i<64;i++){
        assertEquals(board.squareDistances[i].length, 64, `There are 64 expected distances for square with index: ${i}`)
    }

    // there's 4096 of these, so we will spot check some distances
    assertEquals(board.getDistanceBetweenSquares(Square.e4, Square.h1), 3, 'calculates 3 king moves from e4 to h1')
    assertEquals(board.getDistanceBetweenSquares(Square.e4, Square.a1), 4, 'calculates 3 king moves from e4 to a1')
    assertEquals(board.getDistanceBetweenSquares(Square.a8, Square.h1), 7, 'calculates 7 king moves from a8 to h1')
    assertEquals(board.getDistanceBetweenSquares(Square.d5, Square.e5), 1, 'calculates 1 king moves from d5 to e5')
    assertEquals(board.getDistanceBetweenSquares(Square.d5, Square.d5), 0, 'calculates 0 king moves from d5 to d5')
    assertEquals(board.getDistanceBetweenSquares(Square.a2, Square.a6), 4, 'calculates 4 king moves from a2 to a6')
})

Deno.test('it sets board representation', () => {

    board.setPieces('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')

    assertSquareEquals(Square.a8, Piece.BlackRook)
    assertSquareEquals(Square.b8, Piece.BlackKnight)
    assertSquareEquals(Square.c8, Piece.BlackBishop)
    assertSquareEquals(Square.d8, Piece.BlackQueen)
    assertSquareEquals(Square.e8, Piece.BlackKing)
    assertSquareEquals(Square.f8, Piece.BlackBishop)
    assertSquareEquals(Square.g8, Piece.BlackKnight)
    assertSquareEquals(Square.h8, Piece.BlackRook)

    assertSquareEquals(Square.a7, Piece.BlackPawn)
    assertSquareEquals(Square.b7, Piece.BlackPawn)
    assertSquareEquals(Square.c7, Piece.BlackPawn)
    assertSquareEquals(Square.d7, Piece.BlackPawn)
    assertSquareEquals(Square.e7, Piece.BlackPawn)
    assertSquareEquals(Square.f7, Piece.BlackPawn)
    assertSquareEquals(Square.g7, Piece.BlackPawn)
    assertSquareEquals(Square.h7, Piece.BlackPawn)

    assertSquareEquals(Square.a1, Piece.WhiteRook)
    assertSquareEquals(Square.b1, Piece.WhiteKnight)
    assertSquareEquals(Square.c1, Piece.WhiteBishop)
    assertSquareEquals(Square.d1, Piece.WhiteQueen)
    assertSquareEquals(Square.e1, Piece.WhiteKing)
    assertSquareEquals(Square.f1, Piece.WhiteBishop)
    assertSquareEquals(Square.g1, Piece.WhiteKnight)
    assertSquareEquals(Square.h1, Piece.WhiteRook)

    assertSquareEquals(Square.a2, Piece.WhitePawn)
    assertSquareEquals(Square.b2, Piece.WhitePawn)
    assertSquareEquals(Square.c2, Piece.WhitePawn)
    assertSquareEquals(Square.d2, Piece.WhitePawn)
    assertSquareEquals(Square.e2, Piece.WhitePawn)
    assertSquareEquals(Square.f2, Piece.WhitePawn)
    assertSquareEquals(Square.g2, Piece.WhitePawn)
    assertSquareEquals(Square.h2, Piece.WhitePawn)

    const emptySquares: number[] = [
        Square.a6, Square.b6, Square.c6, Square.d6, Square.e6, Square.f6, Square.g6, Square.h6,
        Square.a5, Square.b5, Square.c5, Square.d5, Square.e5, Square.f5, Square.g5, Square.h5,
        Square.a4, Square.b4, Square.c4, Square.d4, Square.e4, Square.f4, Square.g4, Square.h4,
        Square.a3, Square.b3, Square.c3, Square.d3, Square.e3, Square.f3, Square.g3, Square.h3,
    ]
    emptySquares.forEach((square) => {
        assertSquareEquals(square, 0)
    })

    assertEquals(board.kingSquares[Color.White], Square.e1, 'White king is on expected square')
    assertEquals(board.kingSquares[Color.Black], Square.e8, 'Black king is on expected square')

})

Deno.test('it errors on invalid piece places', () => {
    // gibberish
    assertThrows(
        () => {board.setPieces('The lazy dog saw a cat or something')},
        Error,'Invalid piece placement'
    )
    // too few ranks
    assertThrows(
        () => {board.setPieces('rnbqkbnr/pppppppp/8/8/8/8')},
        Error,'Invalid piece placement'
    )
    // too many ranks
    assertThrows(
        () => {board.setPieces('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/8/8')},
        Error,'Invalid piece placement'
    )
    // invalid characters
    assertThrows(
        () => {board.setPieces('rnbqkbnr/ppppp$pp/8/8/8/8/PPPPPPPP/RNBQKBNR/8/8')},
        Error,'Invalid piece placement'
    )
})

Deno.test('it renders board with highlights', () => {
    board.render([Square.e1, Square.e8])
})

Deno.test('it serializes as FEN piece placements', () => {
    board.render()
    assertEquals(board.serialize(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
})