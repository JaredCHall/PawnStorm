import {BoardState, CastlingRight, MoveHandler} from "../src/MoveHandler.ts";
import {Move, MoveFlag, MoveType} from "../src/Move.ts";
import {Color, Piece, Square} from "../src/Board.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {binToString} from "../src/Utils.ts";
import {MoveFactory} from "../src/MoveFactory.ts";

let board = new MoveHandler()
let lastBoardState = new BoardState()

const setBoard = (piecePositions: string, state: BoardState = new BoardState()) => {
    board = new MoveHandler()
    board.setPieces(piecePositions)
    board.state = state.clone()
    lastBoardState = state
}

const assertSquareEquals = (square: Square, pieceCode: number) => {
    assertEquals(board.squareList[square], pieceCode, `Expected ${binToString(pieceCode,8)} on square ${square}`)
}

const assertBoardStatePushed = (state: BoardState) => {
    assertEquals(board.state, state, 'Expected state set on board object')
    assertEquals(board.positionStack, [lastBoardState], 'Previous state pushed to stack')
}

const assertBoardStatePopped = () => {
    assertEquals(board.state, lastBoardState, 'Expected state set on board object')
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

Deno.test('it sets board from Fen Number', () => {

    // black to move with board state parts set
    board.setFromFenNumber('8/8/8/8/8/8/8/8 b KQ e3 4 20')
    assertEquals(board.state.sideToMove, Color.Black)
    assertEquals(board.ply, 39)
    assertEquals(board.state.enPassantTarget, Square.e3)
    assertEquals(board.state.castleRights, 0b0011)
    assertEquals(board.state.halfMoveClock, 4)

    // empty board state
    board.setFromFenNumber('8/8/8/8/8/8/8/8 w - - 0 0')
    assertEquals(board.state.sideToMove, Color.White)
    assertEquals(board.ply, 0)
    assertEquals(board.state.enPassantTarget,0)
    assertEquals(board.state.castleRights, 0)
    assertEquals(board.state.halfMoveClock, 0)
})

Deno.test('it serializes as FEN string', () => {

    let fen = '8/8/8/8/8/8/8/8 w KQ e3 4 20'
    board.setFromFenNumber(fen)
    assertEquals(board.serialize(), fen)

    fen = '8/8/4r1pk/1p1pP1R1/p4KP1/2P5/PP6/8 b - - 10 47'
    board.setFromFenNumber(fen)
    assertEquals(board.serialize(), fen)

    fen = '1r2k2r/p1ppqNb1/bn2pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQk - 1 2'
    board.setFromFenNumber(fen)
    assertEquals(board.serialize(), fen)

})

Deno.test('it makes quiet moves for piece', () => {

    setBoard('8/8/8/6r1/8/5N2/8/8')
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

Deno.test('it makes capture moves for piece', () => {

    setBoard('8/8/8/6r1/8/5N2/8/8')
    const move = new Move(Square.f3, Square.g5, Piece.WhiteKnight, Piece.BlackRook, MoveType.Capture)

    // make move
    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.f3, 0)
    assertSquareEquals(Square.g5, Piece.WhiteKnight)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.f3, Piece.WhiteKnight)
    assertSquareEquals(Square.g5, Piece.BlackRook)
    assertBoardStatePopped()
})

Deno.test('it makes quiet moves for pawn', () => {

    setBoard('8/8/8/6r1/8/5P2/8/8')
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
    setBoard('8/5P2/8/6r1/8/8/8/8')
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
    setBoard('8/5P2/8/6r1/8/8/8/8')
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
    setBoard('8/5P2/8/6r1/8/8/8/8')
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
    setBoard('8/5P2/8/6r1/8/8/8/8')
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

Deno.test('it makes double pawn push for white', () => {
    setBoard('8/8/8/8/8/8/P7/8')
    const move = new Move(Square.a2, Square.a4, Piece.WhitePawn,0, MoveType.DoublePawnPush)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.a2, 0)
    assertSquareEquals(Square.a4, Piece.WhitePawn)
    // sets en-passant target
    assertBoardStatePushed(new BoardState(1,0,Square.a3))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.a2, Piece.WhitePawn)
    assertSquareEquals(Square.a4, 0)
    assertBoardStatePopped()
})

Deno.test('it makes double pawn push for black', () => {
    setBoard('8/p7/8/8/8/8/8/8')
    const move = new Move(Square.a7, Square.a5, Piece.BlackPawn,0, MoveType.DoublePawnPush)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.a7, 0)
    assertSquareEquals(Square.a5, Piece.BlackPawn)
    // sets en-passant target
    assertBoardStatePushed(new BoardState(1,0,Square.a6))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.a7, Piece.BlackPawn)
    assertSquareEquals(Square.a5, 0)
    assertBoardStatePopped()
})

Deno.test('it makes capture moves for pawn', () => {

    setBoard('8/8/8/8/8/2q5/1P6/8')
    const move = new Move(Square.b2, Square.c3, Piece.WhitePawn, Piece.BlackQueen, MoveType.Capture)

    // make move
    board.makeMove(move) // greatest day in the b-pawn's life
    board.render()
    assertSquareEquals(Square.b2, 0)
    assertSquareEquals(Square.c3, Piece.WhitePawn)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    // unmake
    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.b2, Piece.WhitePawn)
    assertSquareEquals(Square.c3, Piece.BlackQueen)
    assertBoardStatePopped()
})

Deno.test('it makes capture knight promotions for pawn', () => {
    setBoard('8/8/8/8/8/8/4p3/3R4', new BoardState(1))
    const move = new Move(Square.e2, Square.d1, Piece.BlackPawn, Piece.WhiteRook, MoveType.KnightPromote | MoveFlag.Capture)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e2, 0)
    assertSquareEquals(Square.d1, Piece.BlackKnight)
    assertBoardStatePushed(new BoardState(0,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e2, Piece.BlackPawn)
    assertSquareEquals(Square.d1, Piece.WhiteRook)
    assertBoardStatePopped()
})

Deno.test('it makes capture bishop promotions for pawn', () => {
    setBoard('8/8/8/8/8/8/4p3/3R4', new BoardState(1))
    const move = new Move(Square.e2, Square.d1, Piece.BlackPawn, Piece.WhiteRook, MoveType.BishopPromote | MoveFlag.Capture)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e2, 0)
    assertSquareEquals(Square.d1, Piece.BlackBishop)
    assertBoardStatePushed(new BoardState(0,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e2, Piece.BlackPawn)
    assertSquareEquals(Square.d1, Piece.WhiteRook)
    assertBoardStatePopped()
})

Deno.test('it makes capture rook promotions for pawn', () => {
    setBoard('8/8/8/8/8/8/4p3/3R4', new BoardState(1))
    const move = new Move(Square.e2, Square.d1, Piece.BlackPawn, Piece.WhiteRook, MoveType.RookPromote | MoveFlag.Capture)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e2, 0)
    assertSquareEquals(Square.d1, Piece.BlackRook)
    assertBoardStatePushed(new BoardState(0,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e2, Piece.BlackPawn)
    assertSquareEquals(Square.d1, Piece.WhiteRook)
    assertBoardStatePopped()
})

Deno.test('it makes capture queen promotions for pawn', () => {
    setBoard('8/8/8/8/8/8/4p3/3R4', new BoardState(1))
    const move = new Move(Square.e2, Square.d1, Piece.BlackPawn, Piece.WhiteRook, MoveType.QueenPromote | MoveFlag.Capture)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e2, 0)
    assertSquareEquals(Square.d1, Piece.BlackQueen)
    assertBoardStatePushed(new BoardState(0,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e2, Piece.BlackPawn)
    assertSquareEquals(Square.d1, Piece.WhiteRook)
    assertBoardStatePopped()
})

Deno.test('it makes en-passant capture as white', () => {
    setBoard('8/8/3p4/3pPp2/8/8/8/8', new BoardState(0,0,Square.f6))
    const move = new Move(Square.e5, Square.f6, Piece.WhitePawn, Piece.BlackPawn, MoveType.EnPassant)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.e5, 0)
    assertSquareEquals(Square.f6, Piece.WhitePawn)
    assertSquareEquals(Square.f5, 0)
    assertBoardStatePushed(new BoardState(1,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.e5, Piece.WhitePawn)
    assertSquareEquals(Square.f6, 0)
    assertSquareEquals(Square.f5, Piece.BlackPawn)
    assertBoardStatePopped()
})

Deno.test('it makes en-passant capture as black', () => {
    setBoard('8/8/8/8/6Pp/8/8/8', new BoardState(1,0,Square.g3))
    const move = new Move(Square.h4, Square.g3, Piece.BlackPawn, Piece.WhitePawn, MoveType.EnPassant)

    board.makeMove(move)
    board.render()
    assertSquareEquals(Square.h4, 0)
    assertSquareEquals(Square.g3, Piece.BlackPawn)
    assertSquareEquals(Square.g4, 0)
    assertBoardStatePushed(new BoardState(0,0,0,0))

    board.unmakeMove(move)
    board.render()
    assertSquareEquals(Square.h4, Piece.BlackPawn)
    assertSquareEquals(Square.g3, 0)
    assertSquareEquals(Square.g4, Piece.WhitePawn)
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

Deno.test('it revokes short castles for black when h8 rook is captured', () => {
    setBoard('1r2k2r/p1ppqNb1/bn2pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R', new BoardState(0,0b0111))

    const move = new Move(Square.f7, Square.h8, Piece.WhiteKnight, Piece.BlackRook, MoveType.Capture)
    board.makeMove(move)
    board.render()
    assertBoardStatePushed(new BoardState(1,0b0011))
    board.unmakeMove(move)
    assertBoardStatePopped()
})

Deno.test('it revokes long castles for black when a8 rook is captured', () => {
    setBoard('r3k2r/p1ppq1b1/bN2pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R', new BoardState(0,0b1101))

    const move = new Move(Square.b6, Square.a8, Piece.WhiteKnight, Piece.BlackRook, MoveType.Capture)
    board.makeMove(move)
    board.render()
    assertBoardStatePushed(new BoardState(1,0b0101))
    board.unmakeMove(move)
    assertBoardStatePopped()
})

Deno.test('it revokes short castles for white when h1 rook is captured', () => {
    setBoard('r3k2r/p1ppq1b1/bN2p1p1/3P4/1p2P3/2N2Qnp/PPPBBPPP/R3K2R', new BoardState(1,0b0111))

    const move = new Move(Square.g3, Square.h1, Piece.BlackKnight, Piece.WhiteRook, MoveType.Capture)
    board.makeMove(move)
    board.render()
    assertBoardStatePushed(new BoardState(0,0b0110))
    board.unmakeMove(move)
    assertBoardStatePopped()
})

Deno.test('it revokes long castles for white when a1 rook is captured', () => {
    setBoard('r3k2r/p1ppq1b1/bN2p1p1/3P4/1p2P3/1nN2Q1p/PPPBBPPP/R3K2R', new BoardState(1,0b0111))

    const move = new Move(Square.b3, Square.a1, Piece.BlackKnight, Piece.WhiteRook, MoveType.Capture)
    board.makeMove(move)
    board.render()
    assertBoardStatePushed(new BoardState(0,0b0101))
    board.unmakeMove(move)
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