import {BoardState, CastlingRight, MoveHandler} from "../src/MoveHandler.ts";
import {Move, MoveType} from "../src/Move.ts";
import {Piece, Square} from "../src/Board120.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {binToString} from "../src/Utils.ts";

const board = new MoveHandler()
let oldState = new BoardState()

const setBoard = (piecePositions: string, state: BoardState = new BoardState()) => {
    board.setPieces(piecePositions)
    oldState = state
    board.state = state.clone()
}

const assertSquareEquals = (square: Square, pieceCode: number) => {
    assertEquals(board.squareList[square], pieceCode, `Expected ${binToString(pieceCode,8)} on square ${square}`)
}

const assertBoardStatePushed = (state: BoardState) => {
    assertEquals(board.state, state, 'Expected state set on board object')
    assertEquals(board.positionStack, [oldState], 'Previous state pushed to stack')
}

const assertBoardStatePopped = () => {
    assertEquals(board.state, oldState, 'Expected state set on board object')
    assertEquals(board.positionStack, [], 'Previous state popped from stack')
}

Deno.test('it initializes board state', () => {
    assertEquals(board.state, new BoardState(), 'Initializes board state')
    assertEquals(board.positionStack, [],'Initializes position stack')
})

Deno.test('board state gets correct castle rights', () => {
    let state = new BoardState(0, 0b1111)
    assertEquals(state.getCastlingRights(0), [CastlingRight.K, CastlingRight.Q])
    assertEquals(state.getCastlingRights(1), [CastlingRight.k, CastlingRight.q])

    state = new BoardState(0, 0b0101)
    assertEquals(state.getCastlingRights(0), [CastlingRight.K])
    assertEquals(state.getCastlingRights(1), [CastlingRight.k])

    state = new BoardState(0, 0b000)
    assertEquals(state.getCastlingRights(0), [])
    assertEquals(state.getCastlingRights(1), [])

    state = new BoardState(0, 0b1010)
    assertEquals(state.getCastlingRights(0), [CastlingRight.Q])
    assertEquals(state.getCastlingRights(1), [CastlingRight.q])
})

Deno.test('it makes quiet moves for piece', () => {

    board.setPieces('8/8/8/6r1/8/5N2/8/8')
    const move = new Move(Square.f3, Square.e5, Piece.WhiteKnight, 0, 0)

    // make move
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.f3, 0)
    assertSquareEquals(Square.e5, Piece.WhiteKnight)
    assertBoardStatePushed(new BoardState(1,0,0,1))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.f3, Piece.WhiteKnight)
    assertSquareEquals(Square.e5, 0)
    assertBoardStatePopped()
})

Deno.test('it makes quiet moves for pawn', () => {

    board.setPieces('8/8/8/6r1/8/5P2/8/8')
    const move = new Move(Square.f3, Square.f4, Piece.WhitePawn, 0, 0)

    // make move
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.f3, 0)
    assertSquareEquals(Square.f4, Piece.WhitePawn)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.f3, Piece.WhitePawn)
    assertSquareEquals(Square.f4, 0)
    assertBoardStatePopped()
})

Deno.test('it makes quiet knight promotions for pawn', () => {
    board.setPieces('8/5P2/8/6r1/8/8/8/8')
    const move = new Move(Square.f7, Square.f8, Piece.WhitePawn, 0, MoveType.KnightPromote)


    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.f7, 0)
    assertSquareEquals(Square.f8, Piece.WhiteKnight)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.f7, Piece.WhitePawn)
    assertSquareEquals(Square.f8, 0)
    assertBoardStatePopped()
})

Deno.test('it makes quiet bishop promotions for pawn', () => {
    board.setPieces('8/5P2/8/6r1/8/8/8/8')
    const move = new Move(Square.f7, Square.f8, Piece.WhitePawn, 0, MoveType.BishopPromote)


    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.f7, 0)
    assertSquareEquals(Square.f8, Piece.WhiteBishop)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.f7, Piece.WhitePawn)
    assertSquareEquals(Square.f8, 0)
    assertBoardStatePopped()
})

Deno.test('it makes quiet rook promotions for pawn', () => {
    board.setPieces('8/5P2/8/6r1/8/8/8/8')
    const move = new Move(Square.f7, Square.f8, Piece.WhitePawn, 0, MoveType.RookPromote)


    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.f7, 0)
    assertSquareEquals(Square.f8, Piece.WhiteRook)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.f7, Piece.WhitePawn)
    assertSquareEquals(Square.f8, 0)
    assertBoardStatePopped()
})

Deno.test('it makes quiet queen promotions for pawn', () => {
    board.setPieces('8/5P2/8/6r1/8/8/8/8')
    const move = new Move(Square.f7, Square.f8, Piece.WhitePawn, 0, MoveType.QueenPromote)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.f7, 0)
    assertSquareEquals(Square.f8, Piece.WhiteQueen)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.f7, Piece.WhitePawn)
    assertSquareEquals(Square.f8, 0)
    assertBoardStatePopped()
})


Deno.test('it revokes long castles for white when a1 rook moves', () => {

    // setup
    setBoard('8/8/8/8/8/8/8/R7', new BoardState(0, 0b0011))
    const move = new Move(Square.a1, Square.a8, Piece.WhiteRook, 0, 0)

    // make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.a1, 0)
    assertSquareEquals(Square.a8, Piece.WhiteRook)
    assertBoardStatePushed(new BoardState(1,CastlingRight.K,0,1))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.a1, Piece.WhiteRook)
    assertSquareEquals(Square.a8, 0)
    assertBoardStatePopped()
})

Deno.test('it revokes short castles for white when h1 rook moves', () => {
    // setup
    setBoard('8/8/8/8/8/8/8/7R', new BoardState(0, 0b0011))
    const move = new Move(Square.h1, Square.h8, Piece.WhiteRook, 0, 0)

    // make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.h1, 0)
    assertSquareEquals(Square.h8, Piece.WhiteRook)
    assertBoardStatePushed(new BoardState(1,CastlingRight.Q,0,1))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.h1, Piece.WhiteRook)
    assertSquareEquals(Square.h8, 0)
    assertBoardStatePopped()
})

Deno.test('it revokes long castles for black when a8 rook moves', () => {

    // setup
    setBoard('r7/8/8/8/8/8/8/8', new BoardState(0, 0b1100))
    const move = new Move(Square.a8, Square.a1, Piece.BlackRook, 0, 0)

    // make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.a8, 0)
    assertSquareEquals(Square.a1, Piece.BlackRook)
    assertBoardStatePushed(new BoardState(1,CastlingRight.k,0,1))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.a8, Piece.BlackRook)
    assertSquareEquals(Square.a1, 0)
    assertBoardStatePopped()
})

Deno.test('it revokes short castles for black when h8 rook moves', () => {
    // setup
    setBoard('7r/8/8/8/8/8/8/8', new BoardState(0, 0b1100))
    const move = new Move(Square.h8, Square.h1, Piece.BlackRook, 0, 0)

    // make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.h8, 0)
    assertSquareEquals(Square.h1, Piece.BlackRook)
    assertBoardStatePushed(new BoardState(1,CastlingRight.q,0,1))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.h8, Piece.BlackRook)
    assertSquareEquals(Square.h1, 0)
    assertBoardStatePopped()
})

Deno.test('it updates king square when white king moves', () => {

    setBoard('8/8/8/4K3/8/8/8/8')
    const move = new Move(Square.e5, Square.d5, Piece.WhiteKing, 0, 0)

    //make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.d5, Piece.WhiteKing)
    assertSquareEquals(Square.e5, 0)
    assertEquals(board.kingSquares[0], Square.d5)

    //unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.d5, 0)
    assertSquareEquals(Square.e5,  Piece.WhiteKing)
    assertEquals(board.kingSquares[0], Square.e5)
})

Deno.test('it revokes castle rights when white king moves', () => {

    setBoard('8/8/8/4K3/8/8/8/8', new BoardState(0,0b0011))
    const move = new Move(Square.e5, Square.d5, Piece.WhiteKing, 0, 0)

    //make
    board.makeMove(move)
    board.render()
    assertBoardStatePushed(new BoardState(1,0,0,1))

    //unmake
    board.unmakeMove(move)
    board.render()
    assertBoardStatePopped()
})

Deno.test('it updates king square when black king moves', () => {
    setBoard('8/8/8/4k3/8/8/8/8')
    const move = new Move(Square.e5, Square.d5, Piece.BlackKing, 0, 0)

    //make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.d5, Piece.BlackKing)
    assertSquareEquals(Square.e5, 0)
    assertEquals(board.kingSquares[1], Square.d5)

    //unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.d5, 0)
    assertSquareEquals(Square.e5,  Piece.BlackKing)
    assertEquals(board.kingSquares[1], Square.e5)
})

Deno.test('it revokes castle rights when black king moves', () => {
    setBoard('8/8/8/4k3/8/8/8/8', new BoardState(0,0b1100))
    const move = new Move(Square.e5, Square.d5, Piece.BlackKing, 0, 0)

    //make
    board.makeMove(move)
    board.render()
    assertBoardStatePushed(new BoardState(1,0,0,1))

    //unmake
    board.unmakeMove(move)
    board.render()
    assertBoardStatePopped()
})

Deno.test('it castles short as white', () => {
    board.setPieces('r3k2r/8/8/8/8/8/8/R3K2R')
    setBoard('r3k2r/8/8/8/8/8/8/R3K2R', new BoardState(0,0b0011))
    const move = new Move(Square.e1, Square.g1, Piece.WhiteKing, 0, MoveType.CastleShort)

    //make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e1, 0)
    assertSquareEquals(Square.g1, Piece.WhiteKing)
    assertSquareEquals(Square.h1, 0)
    assertSquareEquals(Square.f1, Piece.WhiteRook)
    assertBoardStatePushed(new BoardState(1,0,0,1))

    //unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e1, Piece.WhiteKing)
    assertSquareEquals(Square.g1, 0)
    assertSquareEquals(Square.h1,  Piece.WhiteRook)
    assertSquareEquals(Square.f1, 0)
    assertBoardStatePopped()
})

Deno.test('it castles long as white', () => {
    board.setPieces('r3k2r/8/8/8/8/8/8/R3K2R')
    setBoard('r3k2r/8/8/8/8/8/8/R3K2R', new BoardState(0,0b0011))
    const move = new Move(Square.e1, Square.c1, Piece.WhiteKing, 0, MoveType.CastleLong)

    //make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e1, 0)
    assertSquareEquals(Square.c1, Piece.WhiteKing)
    assertSquareEquals(Square.a1, 0)
    assertSquareEquals(Square.d1, Piece.WhiteRook)
    assertBoardStatePushed(new BoardState(1,0,0,1))

    //unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e1, Piece.WhiteKing)
    assertSquareEquals(Square.c1, 0)
    assertSquareEquals(Square.a1,  Piece.WhiteRook)
    assertSquareEquals(Square.d1, 0)
    assertBoardStatePopped()
})

Deno.test('it castles short as black', () => {
    board.setPieces('r3k2r/8/8/8/8/8/8/R3K2R')
    setBoard('r3k2r/8/8/8/8/8/8/R3K2R', new BoardState(0,0b1100))
    const move = new Move(Square.e8, Square.g8, Piece.BlackKing, 0, MoveType.CastleShort)

    //make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e8, 0)
    assertSquareEquals(Square.g8, Piece.BlackKing)
    assertSquareEquals(Square.h8, 0)
    assertSquareEquals(Square.f8, Piece.BlackRook)
    assertBoardStatePushed(new BoardState(1,0,0,1))

    //unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e8, Piece.BlackKing)
    assertSquareEquals(Square.g8, 0)
    assertSquareEquals(Square.h8,  Piece.BlackRook)
    assertSquareEquals(Square.f8, 0)
    assertBoardStatePopped()
})

Deno.test('it castles long as black', () => {
    board.setPieces('r3k2r/8/8/8/8/8/8/R3K2R')
    setBoard('r3k2r/8/8/8/8/8/8/R3K2R', new BoardState(0,0b1100))
    const move = new Move(Square.e8, Square.c8, Piece.BlackKing, 0, MoveType.CastleLong)

    //make
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e8, 0)
    assertSquareEquals(Square.c8, Piece.BlackKing)
    assertSquareEquals(Square.a8, 0)
    assertSquareEquals(Square.d8, Piece.BlackRook)
    assertBoardStatePushed(new BoardState(1,0,0,1))

    //unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e8, Piece.BlackKing)
    assertSquareEquals(Square.c8, 0)
    assertSquareEquals(Square.a8,  Piece.BlackRook)
    assertSquareEquals(Square.d8, 0)
    assertBoardStatePopped()
})