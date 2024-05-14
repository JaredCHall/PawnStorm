import {BitMove} from "../MoveGen/BitMove.ts";
import {SquareNameMap} from "../Board/Square.ts";
import {FenPieceMap} from "../Board/Piece.ts";

export class Move {

    readonly piece: string // fen type - PRBNQKprbnqk (white pieces are uppercase)

    readonly from: string // a1-h8

    readonly to: string // a1-h8

    readonly promotes: string|null // Q,R,B or N (always uppercase)

    readonly color: 'black'|'white'

    constructor(bitMove: BitMove) {
        this.from = SquareNameMap.nameByIndex[bitMove.from]
        this.to = SquareNameMap.nameByIndex[bitMove.to]
        this.piece = FenPieceMap.fenByBitType[bitMove.moving]
        this.promotes = bitMove.getPromotesType()
        this.color = bitMove.moving & 1 ? 'black' : 'white'
    }
}