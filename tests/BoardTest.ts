import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {Board, Color, Piece, PieceIndex, Square, SquareState} from "../MoveGen/Board.ts";
import {assertArrayIncludes} from "https://deno.land/std@0.219.0/assert/assert_array_includes.ts";
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

Deno.test('it generates attack lists', () => {
    board.setPieces('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
    board.generateAttackList()


    assertEquals(board.attackList[Square.f3], 1 << 20 | 1 << 22 | 1 << 30, 'has expected attacks on f3')
    assertEquals(board.attackList[Square.e7], 1 << 3 | 1 << 4 | 1 << 5 | 1 << 6, 'has expected attacks on e7')
    assertEquals(board.attackList[Square.a3], 1 << 25 | 1 << 17, 'has expected attacks on a3')
    assertEquals(board.attackList[Square.h8], 0, 'has expected attacks on h8')

    // ensure invalid squares are still empty
    for(let i=0;i<120;i++) {
        const square = board.squareList[i]
        if(square & SquareState.Invalid){
            assertEquals(board.attackList[i], 0, 'Invalid square does not have attack list')
        }
    }
})


Deno.test('it generates moves', () => {
    board.setPieces('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
    board.generateAttackList()
    const moves = board.generateMoves(Color.White).map((move) => [move.from, move.to, move.moving, move.captured, move.flag])

    assertArrayIncludes(moves, [
        [Square.g1, Square.f3, 30,PieceIndex.None,0],
        [Square.g1, Square.h3, 30,PieceIndex.None,0],
        [Square.b1, Square.c3, 25,PieceIndex.None,0],
        [Square.b1, Square.a3, 25,PieceIndex.None,0],
    ])
})