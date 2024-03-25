import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {Board, Piece, Square, SquareState} from "../MoveGen/Board.ts";
import {MoveType} from "../MoveGen/Move.ts";

const board = new Board()

Deno.test('it sets the board', () => {
    board.setPieces('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
    
    const expectedPieceTypes = [
        Piece.BlackRook, Piece.BlackKnight, Piece.BlackBishop, Piece.BlackQueen, Piece.BlackKing, Piece.BlackBishop, Piece.BlackKnight, Piece.BlackRook,
        Piece.BlackPawn, Piece.BlackPawn, Piece.BlackPawn, Piece.BlackPawn, Piece.BlackPawn, Piece.BlackPawn, Piece.BlackPawn, Piece.BlackPawn,
        Piece.WhitePawn, Piece.WhitePawn, Piece.WhitePawn, Piece.WhitePawn, Piece.WhitePawn, Piece.WhitePawn, Piece.WhitePawn, Piece.WhitePawn,
        Piece.WhiteRook, Piece.WhiteKnight, Piece.WhiteBishop,  Piece.WhiteQueen, Piece.WhiteKing, Piece.WhiteBishop, Piece.WhiteKnight, Piece.WhiteRook,
    ]
    assertEquals(Array.from(board.pieceTypeList), expectedPieceTypes, 'pieceTypeList is set correctly')

    const expectedPieceList = [
        Square.a8, Square.b8, Square.c8, Square.d8, Square.e8, Square.f8, Square.g8, Square.h8,
        Square.a7, Square.b7, Square.c7, Square.d7, Square.e7, Square.f7, Square.g7, Square.h7,
        Square.a2, Square.b2, Square.c2, Square.d2, Square.e2, Square.f2, Square.g2, Square.h2,
        Square.a1, Square.b1, Square.c1, Square.d1, Square.e1, Square.f1, Square.g1, Square.h1,
    ]
    assertEquals(Array.from(board.pieceList), expectedPieceList, 'pieceList is set correctly')

    const emp = SquareState.Empty
    const oob = SquareState.Invalid
    
    const expectedSquareList = [
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob,   0,   1,   2,   3,   4,   5,   6,   7, oob, // Black Pieces
        oob,   8,   9,   10, 11,  12,  13,  14,  15, oob, // Black Pawns
        oob, emp, emp, emp, emp, emp, emp, emp, emp, oob,
        oob, emp, emp, emp, emp, emp, emp, emp, emp, oob,
        oob, emp, emp, emp, emp, emp, emp, emp, emp, oob,
        oob, emp, emp, emp, emp, emp, emp, emp, emp, oob,
        oob,  16,  17,  18,  19,  20,  21,  22,  23, oob, // White Pawns
        oob,  24,  25,  26,  27,  28,  29,  30,  31, oob, // White Pieces
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
        oob, oob, oob, oob, oob, oob, oob, oob, oob, oob,
    ]
    assertEquals(Array.from(board.squareList), expectedSquareList, 'squareList is set correctly')
})

Deno.test('it generates quiet move with genMove', () => {

    const move = board.genMove(Square.g8, Square.f6)

    assertEquals(move.getFrom(), Square.g8)
    assertEquals(move.getTo(), Square.f6)
    assertEquals(move.getMoving(), 6)
    assertEquals(move.getCaptured(), 0)
    assertEquals(move.getType(), 0)
})

Deno.test('it generates capture move with genMove', () => {

    board.setPieces('4k3/8/3R4/8/8/6b1/8/4K3')
    const move = board.genMove(Square.g3, Square.d6, MoveType.Capture)

    assertEquals(move.getFrom(), Square.g3)
    assertEquals(move.getTo(), Square.d6)
    assertEquals(move.getMoving(), 2)
    assertEquals(move.getCaptured(), 1)
    assertEquals(move.getType(), MoveType.Capture)
})

Deno.test('it generates en-passant with genMove for white', () => {

    board.setPieces('4k3/8/6Pp/8/8/8/8/4K3')
    const move = board.genMove(Square.g6, Square.h7, MoveType.EnPassant)

    assertEquals(move.getFrom(), Square.g6)
    assertEquals(move.getTo(), Square.h7)
    assertEquals(move.getMoving(), 1)
    assertEquals(move.getCaptured(), 2)
    assertEquals(move.getType(), MoveType.EnPassant)
})

Deno.test('it generates en-passant with genMove for black', () => {

    board.setPieces('4k3/8/8/8/8/1Pp5/8/4K3')
    const move = board.genMove(Square.c3, Square.b2, MoveType.EnPassant)

    assertEquals(move.getFrom(), Square.c3)
    assertEquals(move.getTo(), Square.b2)
    assertEquals(move.getMoving(), 2)
    assertEquals(move.getCaptured(), 1)
    assertEquals(move.getType(), MoveType.EnPassant)
})