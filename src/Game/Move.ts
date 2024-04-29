import {BitMove, MoveFlag, MoveType} from "../MoveGen/BitMove.ts";
import {SquareNameMap} from "../Board/Square.ts";
import {FenPieceMap} from "../Board/Piece.ts";

export class Move {

    readonly piece: string

    readonly from: string

    readonly to: string

    readonly promotes: string|null

    constructor(bitMove: BitMove) {

        this.from = SquareNameMap.nameByIndex[bitMove.from]
        this.to = SquareNameMap.nameByIndex[bitMove.to]
        this.piece = FenPieceMap.fenByBitType[bitMove.moving]

        if(bitMove.flag & MoveFlag.Promotion){
            switch(bitMove.flag & 0b1011){
                case MoveType.KnightPromote: this.promotes = 'N'; break
                case MoveType.BishopPromote: this.promotes = 'B'; break
                case MoveType.RookPromote: this.promotes = 'R'; break
                case MoveType.QueenPromote: this.promotes = 'Q'; break
                default: this.promotes = null;
            }
        }else{
            this.promotes = null
        }


    }
}