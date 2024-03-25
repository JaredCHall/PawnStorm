import {Piece, Square} from "./Board.ts";

export enum MoveFlag {
    Flag1 = 1,
    Flag2 = 1 << 1,
    Capture = 1 << 2,
    Promotion = 1 << 3,
}

export enum MoveType {
    Quiet,
    DoublePawnPush = MoveFlag.Flag1,
    CastleShort = MoveFlag.Flag2,
    CastleLong = MoveFlag.Flag1 | MoveFlag.Flag2,
    Capture = MoveFlag.Capture,
    EnPassant = MoveFlag.Capture | MoveFlag.Flag1,
    KnightPromote = MoveFlag.Promotion,
    BishopPromote = MoveFlag.Promotion | MoveFlag.Flag1,
    RookPromote = MoveFlag.Promotion | MoveFlag.Flag2,
    QueenPromote = MoveFlag.Promotion | MoveFlag.Flag1 | MoveFlag.Flag2,
    KnightPromoteCapture = MoveFlag.Capture | MoveFlag.Promotion,
    BishopPromoteCapture = MoveFlag.Capture | MoveFlag.Promotion | MoveFlag.Flag1,
    RookPromoteCapture = MoveFlag.Capture | MoveFlag.Promotion | MoveFlag.Flag2,
    QueenPromoteCapture = MoveFlag.Capture | MoveFlag.Promotion | MoveFlag.Flag1 | MoveFlag.Flag2,
}


export class Move {
    readonly bits: number // 28 bits

    constructor(from: Square, to: Square, movingPiece: number, capturedPiece: number, type: MoveType) {
        this.bits = type | (capturedPiece << 4) | (movingPiece << 9) | (to << 14) | (from << 21)
    }

    getType(): MoveType {
        return this.bits & 0x0f
    }

    getCaptured(): number {
        return (this.bits >> 4) & 0x1f
    }

    getMoving(): number {
        return (this.bits >> 9) & 0x1f
    }

    getTo(): Square {
        return (this.bits >> 14) & 0x7f
    }

    getFrom(): Square {
        return (this.bits >> 21) & 0x7f
    }
}