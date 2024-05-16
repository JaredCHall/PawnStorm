import {Board} from "../Board/Board.ts";
import {Piece, Color, PieceType} from "../Board/Piece.ts";
import {BitMove, MoveFlag, MoveType} from "./BitMove.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {CastlingMove, CastlingMoveMap, CastlingRight} from "./CastlingMove.ts";
import { BoardState } from "../Board/BoardState.ts";
import {FenNumber} from "../Notation/FenNumber.ts";



export class MoveHandler extends Board
{
    ply: number = 0
    state: BoardState = new BoardState()
    positionStack: BoardState[] = []
    // maps of important enPassant squares
    enPassantTargetSquares = new Uint8Array([
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

    // with BoardState now available, we can set pieces and state from a fenNumber
    setFromFenNumber(fenNumber: string): void {
        const parts = fenNumber.split(' ')
        const sideToMove = parts[1] ?? 'w'
        const castleRights = parts[2] ?? '-'
        const enPassantTarget = parts[3] ?? '-'
        const halfMoveClock = parts[4] ?? '-'
        const fullMoveClock = parts[5] ?? '-'
        this.setPieces(parts[0])
        this.state.sideToMove = sideToMove == 'w' ? Color.White : Color.Black

        this.state.castleRights = 0
        if(castleRights != '-'){
            if(castleRights.includes('K')){this.state.castleRights |= CastlingRight.K}
            if(castleRights.includes('Q')){this.state.castleRights |= CastlingRight.Q}
            if(castleRights.includes('k')){this.state.castleRights |= CastlingRight.k}
            if(castleRights.includes('q')){this.state.castleRights |= CastlingRight.q}
        }

        this.state.enPassantTarget = 0
        if(enPassantTarget != '-'){
            this.state.enPassantTarget =  SquareNameMap.indexByName[enPassantTarget]
        }

        this.state.halfMoveClock = 0
        if(halfMoveClock != '-'){
            this.state.halfMoveClock = parseInt(halfMoveClock)
        }

        this.ply = 0
        if(fullMoveClock != '-'){
            const fullMoveClockInt = parseInt(fullMoveClock)
            if(fullMoveClockInt != 0){
                this.ply = (fullMoveClockInt - 1) * 2 + this.state.sideToMove
            }
        }
    }

    makeMove(move: BitMove)
    {
        this.saveBoardState()
        this.state.toggleSideToMove()
        this.ply++;

        this.squareList[move.from] = 0
        const movingType = move.moving >> 1
        const movingColor = move.moving & 1

        // handle pawn moves
        if(movingType & (PieceType.Pawn | PieceType.BPawn)){
            return this.#makePawnMove(move, movingColor)
        }

        // moves by other pieces
        this.squareList[move.to] = move.moving
        this.state.enPassantTarget = 0
        if(move.flag & MoveFlag.Capture){
            this.state.halfMoveClock = 0
            this.#revokeCastleRightsOnRookCapture(movingColor, move.captured, move.to)
        }else{
            this.state.halfMoveClock++
        }
        // rook moves
        if(movingType & PieceType.Rook){
            this.state.getCastlingRights(movingColor).forEach((right) => {
                // @ts-ignore ok
                if(CastlingMoveMap.byRight[right].rookSquares[0] == move.from){
                    this.state.castleRights &= ~right
                }
            })
            return
        }
        // king moves
        if(movingType & PieceType.King){
            // either castle type
            if(move.flag & MoveFlag.Flag2){
                // @ts-ignore - assumed correct
                const castlingMove: CastlingMove = CastlingMoveMap.byKingToSquare[move.to]
                this.squareList[castlingMove.rookSquares[0]] = 0
                this.squareList[castlingMove.rookSquares[1]] = PieceType.Rook << 1 | movingColor
            }
            this.state.castleRights &= CastlingMove.sideMask[movingColor ? 0 : 1]
            this.kingSquares[movingColor] = move.to
        }
    }

    unmakeMove(move: BitMove){

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
                // @ts-ignore assumed correct
                const castlingMove: CastlingMove = CastlingMoveMap.byKingToSquare[move.to]
                this.squareList[castlingMove.rookSquares[1]] = 0
                this.squareList[castlingMove.rookSquares[0]] = PieceType.Rook << 1 | movingColor
            }
            this.kingSquares[movingColor] = move.from
        }
        this.restoreLastState()
        this.ply--
    }

    #makePawnMove(move: BitMove, movingColor: Color)
    {
        this.state.halfMoveClock = 0
        if(move.flag == MoveType.DoublePawnPush){
            this.squareList[move.to] = move.moving
            this.state.enPassantTarget = this.enPassantTargetSquares[this.square64Indexes[move.to]]
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
            this.#revokeCastleRightsOnRookCapture(movingColor, move.captured, move.to)
        }else{
            this.squareList[move.to] = move.moving
            this.squareList[this.state.enPassantTarget] = 0
            this.state.enPassantTarget = 0
        }
    }

    #revokeCastleRightsOnRookCapture(movingColor: Color, captured: Piece, to: number)
    {
        const captureType = captured >> 1
        if(!(captureType & PieceType.Rook)){
            return
        }

        if(movingColor == Color.White){
            if(this.state.castleRights & CastlingRight.k && to == Square.h8){
                this.state.castleRights &= 0b1011
            }else if(this.state.castleRights & CastlingRight.q && to == Square.a8){
                this.state.castleRights &= 0b0111
            }
        }else{
            if(this.state.castleRights & CastlingRight.K && to == Square.h1){
                this.state.castleRights &= 0b1110
            }else if(this.state.castleRights & CastlingRight.Q && to == Square.a1){
                this.state.castleRights &= 0b1101
            }
        }

    }

    getFenNumber(): FenNumber
    {
        let castleRights = ''
        if(this.state.castleRights == 0){castleRights += '-'}
        if(this.state.castleRights & CastlingRight.K){castleRights += 'K'}
        if(this.state.castleRights & CastlingRight.Q){castleRights += 'Q'}
        if(this.state.castleRights & CastlingRight.k){castleRights += 'k'}
        if(this.state.castleRights & CastlingRight.q){castleRights += 'q'}

        return new FenNumber(
            this.serializePiecePositions(),
            this.state.sideToMove == 0 ? 'w' : 'b',
            castleRights,
            this.state.enPassantTarget ? SquareNameMap.nameByIndex[this.state.enPassantTarget] : '-',
            this.state.halfMoveClock,
            Math.floor(this.ply / 2) + 1
        )
    }


    serialize(): string {
        return this.getFenNumber().serialize()
    }

}