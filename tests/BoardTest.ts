import {Board} from "../src/Board.ts";
import {CastlingRight, Piece, Square} from "../src/Enums.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {binToString} from "../src/Utils.ts";
import {assertArrayIncludes} from "https://deno.land/std@0.219.0/assert/assert_array_includes.ts";
import {Move, MoveType} from "../src/Move.ts";
const board = new Board()


const assertSquareEquals = (square: Square, pieceCode: number) => {
    assertEquals(board.squareList[square], pieceCode, `Expected ${binToString(pieceCode,8)} on square ${square}`)
}

const assertMatchesSquareList = (actual: Move[], expected: Square[], message='Move list matches expected square names') => {
    const actualSquares = actual.map((move) => move.to)
    assertArrayIncludes(actualSquares, expected, message)
    const extras = actualSquares.filter((square) => !expected.includes(square))
    assertEquals(extras.length, 0, `${message}: Unexpected squares in list: ${extras.join(', ')}`)
}

const assertMatchesMoveList = (actual: Move[], expected: Move[], message: string = 'Move list matches expected Move list') => {
    assertEquals(actual, expected, message)
}

const genMoves = (piecePositions: string, from: Square, enPassantTarget: Square|0=0, castleRights: number = 0): Move[] => {
    board.setPieces(piecePositions)
    board.state.enPassantTarget = enPassantTarget
    board.state.castleRights = castleRights
    const moves = board.getMovesForSquare(from, board.squareList[from])
    board.render(moves.map((move) => move.to))
    return moves
}

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

    const oob = 0
    const expectedList = [
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob,   8,   8,   8,   8,   8,   8,   8,   8, oob,
        oob,   7,   7,   7,   7,   7,   7,   7,   7, oob,
        oob,   6,   6,   6,   6,   6,   6,   6,   6, oob,
        oob,   5,   5,   5,   5,   5,   5,   5,   5, oob,
        oob,   4,   4,   4,   4,   4,   4,   4,   4, oob,
        oob,   3,   3,   3,   3,   3,   3,   3,   3, oob,
        oob,   2,   2,   2,   2,   2,   2,   2,   2, oob,
        oob,   1,   1,   1,   1,   1,   1,   1,   1, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
    ]
    assertEquals(Array.from(board.squaresRanks), expectedList, 'squaresRanks is set correctly')
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


Deno.test('it generates moves for queen', () => {
    let moves = genMoves('8/8/8/4Q3/8/8/8/8', Square.e5)
    assertMatchesSquareList(moves, [
        Square.e6, Square.e7, Square.e8, // N
        Square.f5, Square.g5, Square.h5, // E
        Square.e4, Square.e3, Square.e2, Square.e1, // S
        Square.d5, Square.c5, Square.b5, Square.a5, // W
        Square.f6, Square.g7, Square.h8, // NE
        Square.f4, Square.g3, Square.h2, // SE
        Square.d4, Square.c3, Square.b2, Square.a1, // SW
        Square.d6, Square.c7, Square.b8 // NW
    ], 'quiet moves on open board')

    moves = genMoves('6RQ/7r/5P2/8/8/8/8/8', Square.h8)
    assertMatchesSquareList(moves, [
        Square.g7, Square.h7
    ], 'moves on edge of the board')
});

Deno.test('it generates moves for rook', () => {
    let moves = genMoves('8/8/8/4R3/8/8/8/8', Square.e5)
    assertMatchesSquareList(moves, [
        Square.e6, Square.e7, Square.e8, // N
        Square.f5, Square.g5, Square.h5, // E
        Square.e4, Square.e3, Square.e2, Square.e1, // S
        Square.d5, Square.c5, Square.b5, Square.a5, // W
    ], 'quiet moves on open board')

    moves = genMoves('5R1R/7r/5P2/8/8/8/8/8', Square.h8)
    assertMatchesSquareList(moves, [
        Square.g8, Square.h7
    ], 'moves on edge of the board')
});

Deno.test('it generates moves for bishop', () => {
    let moves = genMoves('8/8/8/4B3/8/8/8/8', Square.e5)
    assertMatchesSquareList(moves,[
        Square.f6, Square.g7, Square.h8, // NE
        Square.f4, Square.g3, Square.h2, // SE
        Square.d4, Square.c3, Square.b2, Square.a1, // SW
        Square.d6, Square.c7, Square.b8 // NW
    ], 'quiet moves on open board')

    moves = genMoves('5P2/8/7B/6r1/8/8/8/8', Square.h6)
    assertMatchesSquareList(moves, [
        Square.g7, Square.g5
    ], 'moves on edge of the board')
});

Deno.test('it generates moves for knight', () => {
    let moves = genMoves('8/8/8/4N3/8/8/8/8', Square.e5)
    assertMatchesSquareList(moves,[
        Square.c6, Square.d7, Square.f7, Square.g6,
        Square.c4, Square.d3, Square.f3, Square.g4
    ], 'quiet moves on open board')

    moves = genMoves('7N/5P2/6r1/8/8/8/8/8', Square.h8)
    assertMatchesSquareList(moves, [
        Square.g6
    ], 'moves on edge of the board')
});

Deno.test('it generates moves for king', () => {
    let moves = genMoves('8/8/8/4K3/8/8/8/8', Square.e5)
    assertMatchesSquareList(moves,[
        Square.e6, Square.f5, Square.e4, Square.d5,
        Square.f6, Square.f4, Square.d4, Square.d6,
    ], 'quiet moves on open board')
});

Deno.test('it generates castles as white', () => {
    let moves = genMoves('8/8/8/8/8/8/3PPP2/R3K2R', Square.e1, 0, CastlingRight.K | CastlingRight.Q)
    assertMatchesMoveList(moves,[
        new Move(Square.e1, Square.f1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.d1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.g1, Piece.WhiteKing, 0, MoveType.CastleShort),
        new Move(Square.e1, Square.c1, Piece.WhiteKing, 0, MoveType.CastleLong),
    ], 'Can castle either side')
})

Deno.test('it generates quiet moves for white pawn', () => {
    let moves = genMoves('8/8/8/8/8/8/4P3/8', Square.e2)
    assertMatchesMoveList(moves,[
        new Move(Square.e2, Square.e3, Piece.WhitePawn, 0, 0),
        new Move(Square.e2, Square.e4, Piece.WhitePawn, 0, MoveType.DoublePawnPush)
    ], 'Pawn has expected moves from starting rank')

    moves = genMoves('8/4P3/8/8/8/8/8/8', Square.e7)
    assertMatchesMoveList(moves,[
        new Move(Square.e7, Square.e8, Piece.WhitePawn, 0, MoveType.KnightPromote),
        new Move(Square.e7, Square.e8, Piece.WhitePawn, 0, MoveType.BishopPromote),
        new Move(Square.e7, Square.e8, Piece.WhitePawn, 0, MoveType.RookPromote),
        new Move(Square.e7, Square.e8, Piece.WhitePawn, 0, MoveType.QueenPromote),
    ], 'Pawn has expected promotions')
});

Deno.test('it generates quiet moves for black pawn', () => {
    let moves = genMoves('8/4p3/8/8/8/8/8/8', Square.e7)
    assertMatchesMoveList(moves,[
        new Move(Square.e7, Square.e6, Piece.BlackPawn, 0, 0),
        new Move(Square.e7, Square.e5, Piece.BlackPawn, 0, MoveType.DoublePawnPush)
    ], 'Pawn has expected moves from starting rank')

    moves = genMoves('8/8/8/8/8/8/4p3/8', Square.e2)
    assertMatchesMoveList(moves,[
        new Move(Square.e2, Square.e1, Piece.BlackPawn, 0, MoveType.KnightPromote),
        new Move(Square.e2, Square.e1, Piece.BlackPawn, 0, MoveType.BishopPromote),
        new Move(Square.e2, Square.e1, Piece.BlackPawn, 0, MoveType.RookPromote),
        new Move(Square.e2, Square.e1, Piece.BlackPawn, 0, MoveType.QueenPromote),
    ], 'Pawn has expected promotions')
});

Deno.test('it generates captures and en-passant for white pawn', () => {
    let moves = genMoves('8/8/8/4pn2/4P3/8/8/8', Square.e4)
    assertMatchesMoveList(moves,[
        new Move(Square.e4, Square.f5, Piece.WhitePawn, Piece.BlackKnight, MoveType.Capture)
    ], 'Pawn has expected capture in middle of the board')

    moves = genMoves('8/8/8/6pn/7P/8/8/8', Square.h4)
    assertMatchesMoveList(moves,[
        new Move(Square.h4, Square.g5, Piece.WhitePawn, Piece.BlackPawn, MoveType.Capture)
    ], 'Pawn has expected capture on edge of the board')

    moves = genMoves('5QRn/6P1/8/8/8/8/8/8', Square.g7)
    assertMatchesMoveList(moves,[
        new Move(Square.g7, Square.h8, Piece.WhitePawn, Piece.BlackKnight, MoveType.KnightPromote | MoveType.Capture),
        new Move(Square.g7, Square.h8, Piece.WhitePawn, Piece.BlackKnight, MoveType.BishopPromote | MoveType.Capture),
        new Move(Square.g7, Square.h8, Piece.WhitePawn, Piece.BlackKnight, MoveType.RookPromote | MoveType.Capture),
        new Move(Square.g7, Square.h8, Piece.WhitePawn, Piece.BlackKnight, MoveType.QueenPromote | MoveType.Capture),
    ], 'Pawn has expected capture promotions')

    moves = genMoves('8/8/6b1/4pP2/8/8/8/8', Square.f5, Square.e6)
    assertMatchesMoveList(moves,[
        new Move(Square.f5, Square.f6, Piece.WhitePawn, 0, 0),
        new Move(Square.f5, Square.e6, Piece.WhitePawn, Piece.BlackPawn, MoveType.EnPassant),
        new Move(Square.f5, Square.g6, Piece.WhitePawn, Piece.BlackBishop, MoveType.Capture),

    ], 'Pawn has expected en-passant capture in middle of the board')

    moves = genMoves('8/8/N7/Pp6/8/8/8/8', Square.a5, Square.b6)
    assertMatchesMoveList(moves,[
        new Move(Square.a5, Square.b6, Piece.WhitePawn, Piece.BlackPawn, MoveType.EnPassant),

    ], 'Pawn has expected en-passant capture on edge of the board')
})

Deno.test('it generates captures and en-passant for black pawn', () => {
    let moves = genMoves('8/8/8/8/4p3/4PN2/8/8', Square.e4)
    assertMatchesMoveList(moves,[
        new Move(Square.e4, Square.f3, Piece.BlackPawn, Piece.WhiteKnight, MoveType.Capture)
    ], 'Pawn has expected capture in middle of the board')

    moves = genMoves('8/8/8/8/7p/6PN/8/8', Square.h4)
    assertMatchesMoveList(moves,[
        new Move(Square.h4, Square.g3, Piece.BlackPawn, Piece.WhitePawn, MoveType.Capture)
    ], 'Pawn has expected capture on edge of the board')

    moves = genMoves('8/8/8/8/8/8/6p1/5qrN', Square.g2)
    assertMatchesMoveList(moves,[
        new Move(Square.g2, Square.h1, Piece.BlackPawn, Piece.WhiteKnight, MoveType.KnightPromote | MoveType.Capture),
        new Move(Square.g2, Square.h1, Piece.BlackPawn, Piece.WhiteKnight, MoveType.BishopPromote | MoveType.Capture),
        new Move(Square.g2, Square.h1, Piece.BlackPawn, Piece.WhiteKnight, MoveType.RookPromote | MoveType.Capture),
        new Move(Square.g2, Square.h1, Piece.BlackPawn, Piece.WhiteKnight, MoveType.QueenPromote | MoveType.Capture),
    ], 'Pawn has expected capture promotions')

    moves = genMoves('8/8/8/8/4Pp2/6B1/8/8', Square.f4, Square.e3)
    assertMatchesMoveList(moves,[
        new Move(Square.f4, Square.f3, Piece.BlackPawn, 0, 0),
        new Move(Square.f4, Square.e3, Piece.BlackPawn, Piece.WhitePawn, MoveType.EnPassant),
        new Move(Square.f4, Square.g3, Piece.BlackPawn, Piece.WhiteBishop, MoveType.Capture),

    ], 'Pawn has expected en-passant capture in middle of the board')

    moves = genMoves('8/8/8/8/pP6/n7/8/8', Square.a4, Square.b3)
    assertMatchesMoveList(moves,[
        new Move(Square.a4, Square.b3, Piece.BlackPawn, Piece.WhitePawn, MoveType.EnPassant),

    ], 'Pawn has expected en-passant capture on edge of the board')
})