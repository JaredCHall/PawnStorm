import {BitMove} from "../MoveGen/BitMove.ts";
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
        this.promotes = bitMove.getPromotesType()
    }
}