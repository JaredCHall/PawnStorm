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