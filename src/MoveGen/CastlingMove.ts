import {Square} from "../Board/Square.ts";
import {Move, MoveType} from "./Move.ts";
import {Piece, PieceType} from "../Board/Piece.ts";

export enum CastlingRight { // 4 bits
    K= 0b0001,
    Q= 0b0010,
    k= 0b0100,
    q= 0b1000
}

export class CastlingMove
{
    static readonly sideMask = new Uint8Array([0b0011, 0b1100])

    readonly right: CastlingRight
    readonly move: Move
    readonly rookSquares: Square[]
    readonly emptySquares: Square[]
    readonly safeSquares: Square[]
    constructor(right: CastlingRight) {
        this.right = right
        switch(right)
        {
            case CastlingRight.K:
                this.move = new Move(Square.e1, Square.g1, Piece.WhiteKing, 0, MoveType.CastleShort)
                this.rookSquares = [Square.h1, Square.f1]
                this.emptySquares = [Square.f1, Square.g1]
                this.safeSquares = [Square.e1, Square.f1]
                break
            case CastlingRight.Q:
                this.move = new Move(Square.e1, Square.c1, Piece.WhiteKing, 0, MoveType.CastleLong)
                this.rookSquares = [Square.a1, Square.d1]
                this.emptySquares = [Square.d1, Square.c1, Square.b1]
                this.safeSquares = [Square.e1, Square.d1]
                break
            case CastlingRight.k:
                this.move = new Move(Square.e8, Square.g8, Piece.BlackKing, 0, MoveType.CastleShort)
                this.rookSquares = [Square.h8, Square.f8]
                this.emptySquares = [Square.f8, Square.g8]
                this.safeSquares = [Square.e8, Square.f8]
                break
            case CastlingRight.q:
            default:
                this.move = new Move(Square.e8, Square.c8, Piece.BlackKing, 0, MoveType.CastleLong)
                this.rookSquares = [Square.a8, Square.d8]
                this.emptySquares = [Square.d8, Square.c8, Square.b8]
                this.safeSquares = [Square.e8, Square.d8]
        }
    }

}

export class CastlingMoveMap
{
    static readonly byRight = {
        [CastlingRight.K]: new CastlingMove(CastlingRight.K),
        [CastlingRight.Q]: new CastlingMove(CastlingRight.Q),
        [CastlingRight.k]: new CastlingMove(CastlingRight.k),
        [CastlingRight.q]: new CastlingMove(CastlingRight.q),
    }

    static readonly kingSquareByColor = new Uint8Array([Square.e1, Square.e8])
    static readonly byRookFromSquare: Partial<Record<Square, CastlingMove>> = {
        [Square.h1]: this.byRight[CastlingRight.K], [Square.a1]: this.byRight[CastlingRight.Q],
        [Square.h8]: this.byRight[CastlingRight.k], [Square.a8]: this.byRight[CastlingRight.q],
    }
    static readonly byKingToSquare: Partial<Record<Square, CastlingMove>> = {
        [Square.g1]: this.byRight[CastlingRight.K], [Square.c1]: this.byRight[CastlingRight.Q],
        [Square.g8]: this.byRight[CastlingRight.k], [Square.c8]: this.byRight[CastlingRight.q],
    }
}

