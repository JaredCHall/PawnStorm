import {Board} from "../src/Board.ts";
import {Piece, Square} from "../src/Enums.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {binToString} from "../src/Utils.ts";
import {assertArrayIncludes} from "https://deno.land/std@0.219.0/assert/assert_array_includes.ts";
const board = new Board()


const assertSquareEquals = (square: Square, pieceCode: number) => {
    assertEquals(board.squareList[square], pieceCode, `Expected ${binToString(pieceCode,8)} on square ${square}`)
}

const assertSquareListsMatch = (actual: Square[], expected: Square[]) => {
    assertArrayIncludes(actual, expected)
    const extras = actual.filter((square) => !expected.includes(square))
    assertEquals(extras.length, 0, `Unexpected squares in list: ${extras.join(', ')}`)
}

Deno.test('it initializes square list correct', () => {
    
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
})


Deno.test('it generates quiet moves for queen', () => {
    board.setPieces('8/8/8/4Q3/8/8/8/8')

    const moves = board.getMovesForSquare(Square.e5, Piece.WhiteQueen).map((move) => move.to)
    board.render(moves)
    assertSquareListsMatch(moves, [
        Square.e6, Square.e7, Square.e8, // N
        Square.f5, Square.g5, Square.h5, // E
        Square.e4, Square.e3, Square.e2, Square.e1, // S
        Square.d5, Square.c5, Square.b5, Square.a5, // W
        Square.f6, Square.g7, Square.h8, // NE
        Square.f4, Square.g3, Square.h2, // SE
        Square.d4, Square.c3, Square.b2, Square.a1, // SW
        Square.d6, Square.c7, Square.b8 // NW
    ])
});

Deno.test('it generates quiet moves for rook', () => {
    board.setPieces('8/8/8/4R3/8/8/8/8')

    const moves = board.getMovesForSquare(Square.e5, Piece.WhiteRook).map((move) => move.to)
    board.render(moves)
    assertSquareListsMatch(moves, [
        Square.e6, Square.e7, Square.e8, // N
        Square.f5, Square.g5, Square.h5, // E
        Square.e4, Square.e3, Square.e2, Square.e1, // S
        Square.d5, Square.c5, Square.b5, Square.a5, // W
    ])
});

Deno.test('it generates quiet moves for bishop', () => {
    board.setPieces('8/8/8/4B3/8/8/8/8')

    const moves = board.getMovesForSquare(Square.e5, Piece.WhiteBishop).map((move) => move.to)
    board.render(moves)
    assertSquareListsMatch(moves,[
        Square.f6, Square.g7, Square.h8, // NE
        Square.f4, Square.g3, Square.h2, // SE
        Square.d4, Square.c3, Square.b2, Square.a1, // SW
        Square.d6, Square.c7, Square.b8 // NW
    ])
});


Deno.test('it generates quiet moves for knight', () => {
    board.setPieces('8/8/8/4N3/8/8/8/8')

    const moves = board.getMovesForSquare(Square.e5, Piece.WhiteKnight).map((move) => move.to)
    board.render(moves)
    assertSquareListsMatch(moves,[
        Square.c6, Square.d7, Square.f7, Square.g6,
        Square.c4, Square.d3, Square.f3, Square.g4
    ])
});

Deno.test('it generates quiet moves for king', () => {
    board.setPieces('8/8/8/4K3/8/8/8/8')

    const moves = board.getMovesForSquare(Square.e5, Piece.WhiteKing).map((move) => move.to)
    board.render(moves)
    assertSquareListsMatch(moves,[
        Square.e6, Square.f5, Square.e4, Square.d5,
        Square.f6, Square.f4, Square.d4, Square.d6,
    ])
});