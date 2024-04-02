import {Color} from "./Piece.ts";
import {Square} from "./Square.ts";
import {CastlingRight} from "../MoveGen/CastlingMove.ts";
export class BoardState {
    sideToMove: Color
    castleRights: number
    enPassantTarget: Square|0
    halfMoveClock: number

    constructor(sideToMove: Color = Color.White, castleRights: number = 0b0000, enPassantTarget: Square|0 = 0, halfMoveClock: number = 0) {
        this.sideToMove = sideToMove
        this.castleRights = castleRights
        this.enPassantTarget = enPassantTarget
        this.halfMoveClock = halfMoveClock
    }

    getCastlingRights(color: Color){
        const rights = []
        if(color & 1){ // black
            if(this.castleRights & CastlingRight.k){rights.push(CastlingRight.k)}
            if(this.castleRights & CastlingRight.q){rights.push(CastlingRight.q)}
        }else{ //white
            if(this.castleRights & CastlingRight.K){rights.push(CastlingRight.K)}
            if(this.castleRights & CastlingRight.Q){rights.push(CastlingRight.Q)}
        }
        return rights
    }
    toggleSideToMove(): void {
        this.sideToMove = this.sideToMove ? 0 : 1
    }

    clone(): BoardState
    {
        return new BoardState(
            this.sideToMove,
            this.castleRights,
            this.enPassantTarget,
            this.halfMoveClock
        )
    }
}