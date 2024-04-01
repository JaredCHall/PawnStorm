import {MoveFactory} from "../src/MoveFactory.ts";
import {Color, Piece, Square} from "../src/Board.ts";
import {Move, MoveType} from "../src/Move.ts";
import {assertArrayIncludes} from "https://deno.land/std@0.219.0/assert/assert_array_includes.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import { CastlingRight } from "../src/MoveHandler.ts";
import {dumpBin} from "../src/Utils.ts";


const board = new MoveFactory()

const genMoves = (fen: string, from: Square): Move[] => {
    board.setFromFenNumber(fen)
    const moves = board.getMovesFromSquare(from, board.squareList[from])
    board.render(moves.map((move) => move.to))
    return moves
}

const genLegalMoves = (fen: string, from: Square): Move[] => {
    board.setFromFenNumber(fen)
    const moves = board.getLegalMovesFromSquare(from, board.squareList[from])
    board.render(moves.map((move) => move.to))
    return moves
}

const assertMatchesSquareList = (actual: Move[], expected: Square[], message='Move list matches expected square names') => {
    const actualSquares = actual.map((move) => move.to)
    assertArrayIncludes(actualSquares, expected, message)
    const extras = actualSquares.filter((square) => !expected.includes(square))
    assertEquals(extras.length, 0, `${message}: Unexpected squares in list: ${extras.join(', ')}`)
}

const assertSquareThreatened = (piecePositions: string, square: Square, color: number, message: string = 'Square threatened') => {
    board.setPieces(piecePositions)
    const isThreatened = board.isSquareThreatened(square, color)
    board.render(isThreatened ? [square] : [])
    assertEquals(isThreatened, true, message)
}

const assertNotSquareThreatened = (piecePositions: string, square: Square, color: number, message: string = 'Square not threatened') => {
    board.setPieces(piecePositions)
    const isThreatened = board.isSquareThreatened(square, color)
    board.render(isThreatened ? [square] : [])
    assertEquals(isThreatened, false, message)
}

const assertMatchesMoveList = (actual: Move[], expected: Move[], message: string = 'Move list matches expected Move list') => {
    assertEquals(actual, expected, message)
}

Deno.test('it calculates if square is threatened', () => {
    assertNotSquareThreatened('7n/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'h8 knight does not threaten f6 king')
    assertSquareThreatened('6n1/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'g8 knight threatens f6 king')

    assertNotSquareThreatened('6b1/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'g8 bishop does not threaten f6 king')
    assertSquareThreatened('7b/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'h8 bishop threatens f6 king')
    assertNotSquareThreatened('7b/6n1/5K2/8/8/8/8/8', Square.f6, Color.Black, 'blocked h8 bishop does not threaten f6 king')

    assertNotSquareThreatened('6r1/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'g8 rook does not threaten f6 king')
    assertSquareThreatened('5r2/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'f8 rook threatens f6 king')
    assertNotSquareThreatened('5r2/5n2/5K2/8/8/8/8/8', Square.f6, Color.Black, 'blocked f8 rook does not threaten f6 king')

    assertNotSquareThreatened('6q1/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'g8 queen does not threaten f6 king')
    assertSquareThreatened('7q/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'f8 queen threatens f6 king')
    assertSquareThreatened('5q2/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'h8 queen threatens f6 king')
    assertNotSquareThreatened('7q/6n1/5K2/8/8/8/8/8', Square.f6, Color.Black, 'blocked h8 queen does not threaten f6 king')
    assertNotSquareThreatened('5q2/5n2/5K2/8/8/8/8/8', Square.f6, Color.Black, 'blocked f8 queen does not threaten f6 king')

    assertNotSquareThreatened('5k2/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'f8 king does not threaten f6 king')
    assertNotSquareThreatened('7k/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'h8 king does not threaten f6 king')
    assertSquareThreatened('8/8/5Kk1/8/8/8/8/8', Square.f6, Color.Black, 'g6 king threatens f6 king')
    assertSquareThreatened('8/6k1/5K2/8/8/8/8/8', Square.f6, Color.Black, 'g7 king threatens f6 king')

    assertNotSquareThreatened('8/5p2/5K2/8/8/8/8/8', Square.f6, Color.Black, 'f7 pawn does not threaten f6 king')
    assertNotSquareThreatened('8/7p/5K2/8/8/8/8/8', Square.f6, Color.Black, 'h7 pawn does not threaten f6 king')
    assertNotSquareThreatened('7p/8/5K2/8/8/8/8/8', Square.f6, Color.Black, 'h8 pawn does not threaten f6 king')
    assertSquareThreatened('8/6p1/5K2/8/8/8/8/8', Square.f6, Color.Black, 'g7 pawn threatens f6 king')
    assertSquareThreatened('8/4p3/5K2/8/8/8/8/8', Square.f6, Color.Black, 'e7 pawn threatens f6 king')
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
    let moves = genMoves('8/8/8/8/8/8/3PPP2/R3K2R w KQ', Square.e1)
    assertMatchesMoveList(moves,[
        new Move(Square.e1, Square.f1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.d1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.g1, Piece.WhiteKing, 0, MoveType.CastleShort),
        new Move(Square.e1, Square.c1, Piece.WhiteKing, 0, MoveType.CastleLong),
    ], 'Can castle either side if both rights exist')

    moves = genMoves('8/8/8/8/8/8/3PPP2/R3K2R w K', Square.e1)
    assertMatchesMoveList(moves,[
        new Move(Square.e1, Square.f1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.d1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.g1, Piece.WhiteKing, 0, MoveType.CastleShort),
    ], 'Can castle castle short if right exists')

    moves = genMoves('8/8/8/8/8/8/3PPP2/R3K2R w Q', Square.e1)
    assertMatchesMoveList(moves,[
        new Move(Square.e1, Square.f1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.d1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.c1, Piece.WhiteKing, 0, MoveType.CastleLong),
    ], 'Can castle castle long if right exists')

    moves = genMoves('8/8/8/8/8/8/3PPP2/R3K2R w kq', Square.e1)
    assertMatchesMoveList(moves,[
        new Move(Square.e1, Square.f1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.d1, Piece.WhiteKing, 0, 0),
    ], 'Cannot castle if only black as castling rights')

    moves = genMoves('8/8/8/8/8/8/3PPP2/R2QKB1R w KQ', Square.e1)
    assertMatchesMoveList(moves,[], 'Cannot castle if adjacent squares are blocked')

    moves = genMoves('8/8/8/8/8/8/3PPP2/R1Q1K1NR w KQ', Square.e1)
    assertMatchesMoveList(moves,[
        new Move(Square.e1, Square.f1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.d1, Piece.WhiteKing, 0, 0),
    ], 'Cannot castle if rook squares are blocked')

    moves = genMoves('8/8/8/8/8/8/3PPP2/RQ2K1NR w KQ', Square.e1)
    assertMatchesMoveList(moves,[
        new Move(Square.e1, Square.f1, Piece.WhiteKing, 0, 0),
        new Move(Square.e1, Square.d1, Piece.WhiteKing, 0, 0),
    ], 'Cannot castle long if b-file is blocked')
})

Deno.test('it generates castles as black', () => {
    let moves = genMoves('r3k2r/3ppp2/8/8/8/8/8/8 b kq', Square.e8)
    assertMatchesMoveList(moves,[
        new Move(Square.e8, Square.f8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.d8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.g8, Piece.BlackKing, 0, MoveType.CastleShort),
        new Move(Square.e8, Square.c8, Piece.BlackKing, 0, MoveType.CastleLong),
    ], 'Can castle either side if both rights exist')

    moves = genMoves('r3k2r/3ppp2/8/8/8/8/8/8 b k', Square.e8)
    assertMatchesMoveList(moves,[
        new Move(Square.e8, Square.f8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.d8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.g8, Piece.BlackKing, 0, MoveType.CastleShort),
    ], 'Can castle castle short if right exists')

    moves = genMoves('r3k2r/3ppp2/8/8/8/8/8/8 b q', Square.e8)
    assertMatchesMoveList(moves,[
        new Move(Square.e8, Square.f8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.d8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.c8, Piece.BlackKing, 0, MoveType.CastleLong),
    ], 'Can castle castle long if right exists')

    moves = genMoves('r3k2r/3ppp2/8/8/8/8/8/8 b KQ', Square.e8)
    assertMatchesMoveList(moves,[
        new Move(Square.e8, Square.f8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.d8, Piece.BlackKing, 0, 0),
    ], 'Cannot castle if only black as castling rights')

    moves = genMoves('r2qkb1r/3ppp2/8/8/8/8/8/8 b kq', Square.e8)
    assertMatchesMoveList(moves,[], 'Cannot castle if adjacent squares are blocked')

    moves = genMoves('r1q1k1nr/3ppp2/8/8/8/8/8/8 b kq', Square.e8)
    assertMatchesMoveList(moves,[
        new Move(Square.e8, Square.f8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.d8, Piece.BlackKing, 0, 0),
    ], 'Cannot castle if rook squares are blocked')

    moves = genMoves('rq2k1nr/3ppp2/8/8/8/8/8/8 b kq', Square.e8)
    assertMatchesMoveList(moves,[
        new Move(Square.e8, Square.f8, Piece.BlackKing, 0, 0),
        new Move(Square.e8, Square.d8, Piece.BlackKing, 0, 0),
    ], 'Cannot castle long if b-file is blocked')
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

    moves = genMoves('8/8/6b1/4pP2/8/8/8/8 w - e6', Square.f5)
    assertMatchesMoveList(moves,[
        new Move(Square.f5, Square.f6, Piece.WhitePawn, 0, 0),
        new Move(Square.f5, Square.e6, Piece.WhitePawn, Piece.BlackPawn, MoveType.EnPassant),
        new Move(Square.f5, Square.g6, Piece.WhitePawn, Piece.BlackBishop, MoveType.Capture),

    ], 'Pawn has expected en-passant capture in middle of the board')

    moves = genMoves('8/8/N7/Pp6/8/8/8/8 w - b6', Square.a5)
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

    moves = genMoves('8/8/8/8/4Pp2/6B1/8/8 b - e3', Square.f4)
    assertMatchesMoveList(moves,[
        new Move(Square.f4, Square.f3, Piece.BlackPawn, 0, 0),
        new Move(Square.f4, Square.e3, Piece.BlackPawn, Piece.WhitePawn, MoveType.EnPassant),
        new Move(Square.f4, Square.g3, Piece.BlackPawn, Piece.WhiteBishop, MoveType.Capture),

    ], 'Pawn has expected en-passant capture in middle of the board')

    moves = genMoves('8/8/8/8/pP6/n7/8/8 b - b3', Square.a4)
    assertMatchesMoveList(moves,[
        new Move(Square.a4, Square.b3, Piece.BlackPawn, Piece.WhitePawn, MoveType.EnPassant),

    ], 'Pawn has expected en-passant capture on edge of the board')
})

Deno.test('it prevents moving pinned piece', () => {

    const fen = 'r2q1b1r/ppp1kppp/4bn2/1B1P2B1/8/4Q3/PPP2PPP/RN2K2R b'
    let moves = genLegalMoves(fen, Square.f6)
    assertMatchesMoveList(moves, [], 'Cannot move pinned knight')

    moves = genLegalMoves(fen, Square.e6)
    assertMatchesMoveList(moves, [], 'Cannot move pinned bishop')
})

Deno.test('it handles king move legality', () => {
    let moves = genLegalMoves('r2q1b1r/ppp1kppp/4bn2/1B1P2B1/8/4Q3/PPP2PPP/RN2K2R b', Square.e7)
    assertMatchesSquareList(moves, [Square.d6], 'King only has one move')

    moves = genLegalMoves('r2q1b1r/1pp1kppp/p3bB2/1B1P4/8/4Q3/PPP2PPP/RN2K2R b', Square.e7)
    assertMatchesSquareList(moves, [Square.d6, Square.f6], 'King can capture to get out of check')

    moves = genLegalMoves('5k2/5P2/4K3/8/8/8/8/8 b', Square.f8)
    assertMatchesSquareList(moves, [Square.g7], 'King can escape with other king nearby')

    moves = genLegalMoves('rnbq1bnr/ppp1kPpp/8/8/8/8/PPPP1PPP/RNBQKBNR b', Square.e7)
    assertMatchesSquareList(moves, [Square.d7, Square.d6, Square.e6, Square.f6, Square.f7], 'King can scoot behind a pawn')
})

Deno.test('it prevents illegal castles', () => {

    let moves = genLegalMoves('r3k2r/3ppp2/3N4/8/8/5n2/3PPP2/R3K2R b KQkq', Square.e8)
    assertMatchesSquareList(moves, [Square.d8, Square.f8], 'Cannot castle when king is in check')

    moves = genLegalMoves('r3k2r/3ppp2/4N3/8/8/8/3PPP2/R3K2R b KQkq', Square.e8)
    assertMatchesSquareList(moves, [], 'Cannot castle when adjacent squares are threatened')

    moves = genLegalMoves('r3k2r/1P1ppp2/8/8/8/8/1p1PPP2/R3K2R b KQkq', Square.e8)
    assertMatchesSquareList(moves, [Square.d8, Square.f8, Square.g8], 'Cannot castle long when c-file is threatened')

    moves = genLegalMoves('r3k2r/3ppp1B/Q7/8/8/q7/3PPP1b/R3K2R b KQkq', Square.e8)
    assertMatchesSquareList(moves, [Square.d8, Square.f8], 'Cannot castle into check')
})

Deno.test('it generates all moves in a position', () => {

    const factory = new MoveFactory()
    factory.setFromFenNumber('2b1rr2/6kp/1R6/1p6/4n3/2N4P/PPP1B1P1/2K4R w - - 0 24')
    let moves = factory.getLegalMoves(Color.White)
    factory.render(moves.map((move) => move.to))
    assertMatchesSquareList(moves,[
        Square.b8,Square.b7,Square.a6,Square.c6,Square.d6,Square.e6,Square.f6,Square.g6,Square.h6,
        Square.b5,Square.d5,Square.h5,Square.a4,Square.b4,Square.c4,Square.e4,Square.g4,Square.h4,
        Square.a3,Square.b3,Square.d3,Square.f3,Square.g3,Square.h2,
        Square.b1,Square.d1,Square.e1,Square.f1,Square.g1,
    ], 'It generates all moves for white in a position')

    factory.setFromFenNumber('2b1rr2/6kp/1R6/1p6/4n3/2N4P/PPP1B1P1/2K4R b - - 0 24')
    moves = factory.getLegalMoves(Color.Black)
    factory.render(moves.map((move) => move.to))

    assertMatchesSquareList(moves, [
        Square.a6, Square.d8,Square.b7,Square.b4,Square.c5,Square.c3,Square.d2,Square.d6,Square.d7,Square.d8,
        Square.e7,Square.e6,Square.e5,Square.f7,Square.f6,Square.f5,Square.f4,Square.f3,Square.f2,Square.f1,
        Square.g8,Square.h8,Square.g5,Square.g4,Square.g3,Square.h6,Square.h5,Square.h3
    ])
    
})