import {Board, Color, PieceType, Square} from "./Board.ts";
import {Move, MoveFlag, MoveType} from "./Move.ts";

export enum CastlingRight { // 4 bits
    K= 0b0001,
    Q= 0b0010,
    k= 0b0100,
    q= 0b1000
}

export class CastlingMoveInfo {
    static readonly sideMask = new Uint8Array([0b0011, 0b1100])
    static readonly kingSquare = new Uint8Array([Square.e1, Square.e8])

    static readonly typeMap = new Uint8Array(16)


    static {
        this.typeMap[CastlingRight.K] = 0
        this.typeMap[CastlingRight.Q] = 1
        this.typeMap[CastlingRight.k] = 2
        this.typeMap[CastlingRight.q] = 3
    }

    static readonly typeByKingNewSquare = new Uint8Array(120)
    static readonly kingNewSquare = new Uint8Array([Square.g1, Square.c1, Square.g8, Square.c8])

    static {
        for(let i=0;i<4;i++){
            this.typeByKingNewSquare[this.kingNewSquare[i]] = i
        }
    }

    static readonly rookSquares = [
        [Square.h1, Square.f1], [Square.a1, Square.d1],
        [Square.h8, Square.f8], [Square.a8, Square.d8]
    ]
    static readonly emptySquares = [
        [Square.f1, Square.g1], [Square.d1, Square.c1, Square.b1],
        [Square.f8, Square.g8], [Square.d8, Square.c8, Square.b8],
    ]
    static readonly safeSquares = [
        [Square.e1, Square.f1], [Square.e1, Square.d1],
        [Square.e8, Square.f8], [Square.e8, Square.d8],
    ]

    static readonly moveType = [
        MoveType.CastleShort, MoveType.CastleLong,
        MoveType.CastleShort, MoveType.CastleLong,
    ]

}


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

export class MoveHandler extends Board
{

    state: BoardState = new BoardState()
    positionStack: BoardState[] = []

    enPassantToSquares = new Uint8Array([
         0,  0,  0,  0,  0,  0,  0,  0,
         0,  0,  0,  0,  0,  0,  0,  0,
         0,  0,  0,  0,  0,  0,  0,  0,
        41, 42, 43, 44, 45, 46, 47, 48,
        71, 72, 73, 74, 75, 76, 77, 78,
         0,  0,  0,  0,  0,  0,  0,  0,
         0,  0,  0,  0,  0,  0,  0,  0,
         0,  0,  0,  0,  0,  0,  0,  0,
    ])
    enPassantCaptureOnSquares = new Uint8Array([
        0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,
        51, 52, 53, 54, 55, 56, 57, 58,
        0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,
        61, 62, 63, 64, 65, 66, 67, 68,
        0,  0,  0,  0,  0,  0,  0,  0,
        0,  0,  0,  0,  0,  0,  0,  0,
    ])

    saveBoardState(): void {
        this.positionStack.push(this.state.clone())
    }

    restoreLastState(): void {
        // @ts-ignore deal with it
        this.state = this.positionStack.pop()
    }

    makeMove(move: Move)
    {
        this.saveBoardState()
        this.state.toggleSideToMove()

        this.squareList[move.from] = 0
        const movingType = move.moving >> 1
        const movingColor = move.moving & 1

        // handle pawn moves
        if(movingType & PieceType.Pawn || movingType & PieceType.BPawn){
            this.state.halfMoveClock = 0
            if(move.flag == MoveType.DoublePawnPush){
                this.squareList[move.to] = move.moving
                this.state.enPassantTarget = this.enPassantToSquares[this.square64Indexes[move.to]]
            }else if(move.flag == MoveType.EnPassant){
                const capturedPawnSquare = this.enPassantCaptureOnSquares[this.square64Indexes[move.to]]
                this.squareList[move.to] = move.moving
                this.squareList[capturedPawnSquare] = 0
                this.state.enPassantTarget = 0
            }else if(move.flag & MoveFlag.Promotion){
                const hasFlag1 = move.flag & MoveFlag.Flag1
                const hasFlag2 = move.flag & MoveFlag.Flag2
                if(hasFlag1){
                    if(hasFlag2){
                        this.squareList[move.to] = PieceType.Queen << 1 | movingColor
                    }else{
                        this.squareList[move.to] = PieceType.Bishop << 1 | movingColor
                    }
                }else if(hasFlag2) {
                    this.squareList[move.to] = PieceType.Rook << 1 | movingColor
                }else{
                    this.squareList[move.to] = PieceType.Knight << 1 | movingColor
                }
                this.state.enPassantTarget = 0
            }else{
                this.squareList[move.to] = move.moving
                this.squareList[this.state.enPassantTarget] = 0
                this.state.enPassantTarget = 0
            }
            return
        }

        // moves by other pieces
        this.squareList[move.to] = move.moving
        this.state.enPassantTarget = 0

        if(move.flag & MoveFlag.Capture){
            this.state.halfMoveClock = 0
        }else{
            this.state.halfMoveClock++
        }

        // rook moves
        if(movingType & PieceType.Rook){
            this.state.getCastlingRights(movingColor).forEach((right) => {
                if(CastlingMoveInfo.rookSquares[CastlingMoveInfo.typeMap[right]][0] == move.from){

                    this.state.castleRights &= ~right
                }
            })
            return
        }

        // king moves
        if(movingType & PieceType.King){

            // either castle type
            if(move.flag & MoveFlag.Flag2){
                const type = CastlingMoveInfo.typeByKingNewSquare[move.to]
                const rookSquares = CastlingMoveInfo.rookSquares[type]
                this.squareList[rookSquares[0]] = 0
                this.squareList[rookSquares[1]] = PieceType.Rook << 1 | movingColor
            }
            this.state.castleRights &= CastlingMoveInfo.sideMask[movingColor ? 0 : 1]
            this.kingSquares[movingColor] = move.to
        }
    }

    unmakeMove(move: Move){

        const movingType = move.moving >> 1
        const movingColor = move.moving & 1

        // handle en-passant
        if(move.flag == MoveType.EnPassant){

            if(move.flag == MoveType.EnPassant) {
                this.squareList[move.from] = move.moving
                this.squareList[move.to] = 0
                this.squareList[this.enPassantCaptureOnSquares[this.square64Indexes[move.to]]] = move.captured
                this.restoreLastState()
                return
            }
        }

        this.squareList[move.from] = move.moving
        this.squareList[move.to] = move.captured

        // handle castles
        if(movingType & PieceType.King){
            // either castle type
            if(move.flag & MoveFlag.Flag2){
                const type = CastlingMoveInfo.typeByKingNewSquare[move.to]
                const rookSquares = CastlingMoveInfo.rookSquares[type]
                this.squareList[rookSquares[1]] = 0
                this.squareList[rookSquares[0]] = PieceType.Rook << 1 | movingColor
            }
            this.kingSquares[movingColor] = move.from
        }
        this.restoreLastState()
    }

}