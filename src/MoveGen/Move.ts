import {Square} from "../Board/Square.ts";

export enum MoveFlag {
    Flag1       = 0b0001,
    Flag2       = 0b0010,
    Capture     = 0b0100,
    Promotion   = 0b1000,
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
}

const squareNamesBy120Index= {
    21: 'a8',22: 'b8',23: 'c8',24: 'd8',25: 'e8',26: 'f8',27: 'g8',28: 'h8',
    31: 'a7',32: 'b7',33: 'c7',34: 'd7',35: 'e7',36: 'f7',37: 'g7',38: 'h7',
    41: 'a6',42: 'b6',43: 'c6',44: 'd6',45: 'e6',46: 'f6',47: 'g6',48: 'h6',
    51: 'a5',52: 'b5',53: 'c5',54: 'd5',55: 'e5',56: 'f5',57: 'g5',58: 'h5',
    61: 'a4',62: 'b4',63: 'c4',64: 'd4',65: 'e4',66: 'f4',67: 'g4',68: 'h4',
    71: 'a3',72: 'b3',73: 'c3',74: 'd3',75: 'e3',76: 'f3',77: 'g3',78: 'h3',
    81: 'a2',82: 'b2',83: 'c2',84: 'd2',85: 'e2',86: 'f2',87: 'g2',88: 'h2',
    91: 'a1',92: 'b1',93: 'c1',94: 'd1',95: 'e1',96: 'f1',97: 'g1',98: 'h1',
}
const promotionTypesMap = {
    [MoveType.KnightPromote]: 'n',
    [MoveType.BishopPromote]: 'b',
    [MoveType.RookPromote]: 'r',
    [MoveType.QueenPromote]: 'q',
    [MoveType.KnightPromote | MoveType.Capture]: 'n',
    [MoveType.BishopPromote | MoveType.Capture]: 'b',
    [MoveType.RookPromote | MoveType.Capture]: 'r',
    [MoveType.QueenPromote | MoveType.Capture]: 'q'
}

export class Move {
    readonly from: Square
    readonly to: Square
    readonly moving: number // moving piece
    readonly captured: number // captured piece
    readonly flag: number

    isCheck: boolean = false
    isMate: boolean = false

    constructor(from: Square, to: Square, moving: number, captured: number, flag: number = MoveType.Quiet) {
        this.from = from
        this.to = to
        this.moving = moving
        this.captured = captured
        this.flag = flag
    }

    serialize(): string
    {
        const isWhite = (this.moving & 1) == 0
        // @ts-ignore ok
        let moveStr: string = squareNamesBy120Index[this.from] + squareNamesBy120Index[this.to]
        if(this.flag & MoveFlag.Promotion){
            switch(this.flag & 0b1011){
                case MoveType.KnightPromote: moveStr += 'N'; break
                case MoveType.BishopPromote: moveStr += 'B'; break
                case MoveType.RookPromote: moveStr += 'R'; break
                case MoveType.QueenPromote: moveStr += 'Q'; break
            }
        }
        return moveStr
    }

}