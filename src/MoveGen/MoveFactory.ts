import {MoveHandler} from "./MoveHandler.ts";
import {Piece, Color, PieceType, FenPieceMap} from "../Board/Piece.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {BitMove, MoveType} from "./BitMove.ts";
import {CastlingMoveMap} from "./CastlingMove.ts";
import { dumpBin } from "BitChess/Utils.ts";


export class MoveFactory extends MoveHandler
{
    makeMove(move: BitMove) {
        super.makeMove(move);

        // evaluate checks and mates
        const movingColor = move.moving & 1
        const enemyColor = movingColor ? 0 : 1
        move.isCheck = this.isSquareThreatened(this.kingSquares[enemyColor], movingColor)
        if(move.isCheck){
            move.isMate = !this.hasLegalMoves(enemyColor)
        }
    }

    hasLegalMoves(color: Color) {
        for(let i=0;i<64;i++){
            const from = this.square120Indexes[i]
            const piece = this.squareList[from]
            if(piece != 0 && (piece & 1) == color){
                if(this.getLegalMovesFromSquare(from, piece).length > 0) {
                    return true
                }
            }
        }
        return false
    }

    getLegalMoves(color: Color = this.state.sideToMove){
        const moves: BitMove[] = []
        for(let i=0;i<64;i++){
            const from = this.square120Indexes[i]
            const piece = this.squareList[from]

            if(piece != 0 && (piece & 1) == color){
                const movesForSquare = this.getLegalMovesFromSquare(from, piece, color)
                for(let j=0;j<movesForSquare.length;j++){
                    moves.push(movesForSquare[j])
                }
            }
        }
        return moves
    }

    getLegalMovesFromSquare(from: Square, moving: Piece, movingColor: Color|null = null): BitMove[] {
        movingColor ??= this.state.sideToMove
        const enemyColor = movingColor ? 0 : 1
        return this.getMovesFromSquare(from, moving).filter((move) => {
            super.makeMove(move)
            const isCheck = this.isSquareThreatened(this.kingSquares[movingColor], enemyColor)
            super.unmakeMove(move)
            return !isCheck
        })
    }

    getMovesFromSquare(from: Square, moving: Piece): BitMove[]
    {
        const type = moving >> 1
        const color: Color = moving & 1

        if(type & PieceType.Pawn){
            return this.#getPawnMoves(from, moving)
        }

        if(type & PieceType.BPawn){
            return this.#getBPawnMoves(from, moving)
        }

        if(type & PieceType.Knight){
            return this.#getKnightMoves(from, moving, color)
        }

        if(type & PieceType.King){
            return this.#getKingMoves(from, moving, color)
        }

        if(type & PieceType.Bishop){
            return this.#getDiagonalMoves(from, moving, color)
        }

        if(type & PieceType.Rook){
            return this.#getLateralMoves(from, moving, color)
        }

        // only the queen remains
        const moves = this.#getDiagonalMoves(from, moving, color)
        const lateralMoves = this.#getLateralMoves(from, moving, color)
        for(let i=0;i<lateralMoves.length;i++){
            moves.push(lateralMoves[i])
        }
        return moves
    }


    getPieceCounts(): Record<Piece,number>
    {
        const pieceCounts: Record<Piece,number> = {
            [Piece.None]: 0,
            [Piece.WhitePawn]: 0,
            [Piece.WhiteKnight]: 0,
            [Piece.WhiteBishop]: 0,
            [Piece.WhiteRook]: 0,
            [Piece.WhiteQueen]: 0,
            [Piece.WhiteKing]: 0,
            [Piece.BlackPawn]: 0,
            [Piece.BlackKnight]: 0,
            [Piece.BlackBishop]: 0,
            [Piece.BlackRook]: 0,
            [Piece.BlackQueen]: 0,
            [Piece.BlackKing]: 0,
        }
        for(let i=0;i<64;i++){
            const piece: Piece = this.squareList[this.square120Indexes[i]]
            pieceCounts[piece]++
        }

        return pieceCounts
    }


    hasSufficientMaterialForMate(): boolean
    {

        const pieceCounts = this.getPieceCounts()
        if(pieceCounts[Piece.WhitePawn] > 0
            || pieceCounts[Piece.BlackPawn] > 0
            || pieceCounts[Piece.WhiteQueen] > 0
            || pieceCounts[Piece.BlackQueen] > 0
            || pieceCounts[Piece.WhiteRook] > 0
            || pieceCounts[Piece.BlackRook] > 0
        ){
            return true
        }

        const whiteMinorPieceCount = pieceCounts[Piece.WhiteBishop] + pieceCounts[Piece.WhiteKnight]
        const blackMinorPieceCount =  pieceCounts[Piece.BlackBishop] + pieceCounts[Piece.BlackKnight]

        // king vs. king
        if(whiteMinorPieceCount == 0 && blackMinorPieceCount == 0){
            return false
        }

        // king + minor piece vs. king
        if((whiteMinorPieceCount == 1 && blackMinorPieceCount == 0)
            || (whiteMinorPieceCount == 0 && blackMinorPieceCount == 1)){
            return false
        }

        if(pieceCounts[Piece.WhiteKnight] > 0 || pieceCounts[Piece.BlackKnight] > 0){
            return true
        }

        if(pieceCounts[Piece.BlackBishop] == 1 && pieceCounts[Piece.WhiteBishop] == 1){

            // check if bishops are on same color square
            let bishopSquareColorSum = 0
            for(let i=0;i<64;i++){
                const index120 = this.square120Indexes[i]
                const piece: Piece = this.squareList[index120]
                if(piece >> 1 & PieceType.Bishop){
                    bishopSquareColorSum += SquareNameMap.colorByIndex[index120]
                }
            }

            return bishopSquareColorSum == 1
        }
        return true
    }


    #getMovesFromOffsets(from: Square, moving: Piece, color: Color, offsets: number[], maxRayLen: number): BitMove[] {
        const moves = []
        for(let i = 0; i<offsets.length;i++) {
            const offset = offsets[i]
            for (let j = 1; j <= maxRayLen; j++) {
                const to: number = from + j * offset
                const captured = this.squareList[to]
                if (captured == Square.Invalid) {
                    break // square out of bounds
                }
                if (captured == 0) {
                    // empty square
                    moves.push(new BitMove(from, to, moving, 0, MoveType.Quiet))
                    continue
                }
                if ((captured & 1) == color) {
                    // friendly piece
                    break
                }
                moves.push(new BitMove(from, to, moving, captured, MoveType.Capture))
                break
            }
        }
        return moves
    }

    #getLateralMoves(from: Square, moving: Piece, color: Color): BitMove[]
    {
        return this.#getMovesFromOffsets(from, moving, color, [1,10,-1,-10], 7)
    }

    #hasLateralThreat(from: Square, color: Color): boolean
    {
        const offsets = [1,10,-1,-10]
        for(let i = 0; i<4;i++) {
            const offset = offsets[i]
            for (let j = 1; j <= 7; j++) {
                const to: number = from + j * offset
                const captured = this.squareList[to]
                if (captured == Square.Invalid) {
                    break // square out of bounds
                }
                if (captured == 0) {
                    continue
                }
                if ((captured & 1) == color) {
                    // friendly piece
                    break
                }

                const capturedType = captured >> 1
                if(capturedType & (PieceType.Rook | PieceType.Queen)){
                    return true
                }
                if(capturedType & PieceType.King && j == 1){
                    return true
                }
                break
            }
        }
        return false
    }

    #getDiagonalMoves(from: Square, moving: Piece, color: Color): BitMove[]
    {
        return this.#getMovesFromOffsets(from, moving, color, [9,11,-9,-11], 7)
    }

    #hasDiagonalThreat(from: Square, color: Color): boolean
    {
        const offsets = [9,11,-9,-11]
        for(let i = 0; i<4;i++) {
            const offset = offsets[i]
            for (let j = 1; j <= 7; j++) {
                const to: number = from + j * offset
                const captured = this.squareList[to]
                if (captured == Square.Invalid) {
                    break // square out of bounds
                }
                if (captured == 0) {
                    continue
                }
                if ((captured & 1) == color) {
                    // friendly piece
                    break
                }

                const capturedType = captured >> 1
                if(capturedType & (PieceType.Bishop | PieceType.Queen)){
                    return true
                }

                if(j > 1){
                    break
                }

                if(capturedType & PieceType.King){
                    return true
                }

                if(capturedType & PieceType.Pawn && offset > 0){
                    return true
                }
                if(capturedType & PieceType.BPawn && offset < 0){
                    return true
                }
                break
            }
        }
        return false
    }


    #getKnightMoves(from: Square, moving: Piece, color: Color): BitMove[]
    {
        return this.#getMovesFromOffsets(from, moving, color, [-21, -19,-12, -8, 8, 12, 19, 21], 1)
    }

    #hasKnightThreat(from: Square, color: Color): boolean
    {
        const offsets = [-21, -19,-12, -8, 8, 12, 19, 21]
        for(let i = 0; i<8;i++) {
            const to: number = from + offsets[i]
            const captured = this.squareList[to]
            if (captured == Square.Invalid) {
                continue
            }
            if ( captured !== 0 && captured >> 1 & PieceType.Knight && (captured & 1) != color) {
                return true
            }
        }
        return false
    }

    #getKingMoves(from: Square, moving: Piece, color: Color): BitMove[]
    {
        const moves = this.#getMovesFromOffsets(from, moving, color, [-10, -9, 1, 11, 10, 9, -1, -11], 1)

        if(from != CastlingMoveMap.kingSquareByColor[color]){
            return moves
        }

        //handle castling moves
        this.state.getCastlingRights(color).forEach((right) => {
            const castlingMove = CastlingMoveMap.byRight[right]
            if(!castlingMove.emptySquares.every((square)=> this.squareList[square] == 0)){
                return
            }
            const enemyColor = color ? 0: 1
            if(!castlingMove.safeSquares.every((square) => !this.isSquareThreatened(square,enemyColor))){
                return
            }
            moves.push(castlingMove.move)
        })

        return moves
    }

    isSquareThreatened(square: Square, enemyColor: Color)
    {
        const movingColor = enemyColor ? 0 : 1
        return this.#hasDiagonalThreat(square, movingColor)
            || this.#hasLateralThreat(square, movingColor)
            || this.#hasKnightThreat(square, movingColor)
    }

    #getPawnMoves(
        from: Square,
        moving: Piece,
    ): BitMove[] {
        const rank = this.squareRanks[this.square64Indexes[from]]
        const promotes = rank == 6

        const moves = this.#getPawnQuietMoves(from, moving, -10, -20, rank == 1, promotes)
        const captureMoves = this.#getPawnCaptureMoves(from, moving, 0, [-11,-9], promotes)
        for(let i = 0; i < captureMoves.length; i++){
            moves.push(captureMoves[i])
        }
        return moves
    }

    #getBPawnMoves(from: Square, moving: Piece): BitMove[]
    {
        const rank = this.squareRanks[this.square64Indexes[from]]
        const promotes = rank == 1

        const moves = this.#getPawnQuietMoves(from, moving, 10, 20, rank == 6, promotes)
        const captureMoves = this.#getPawnCaptureMoves(from, moving, 1, [9,11], promotes)
        for(let i = 0; i < captureMoves.length; i++){
            moves.push(captureMoves[i])
        }
        return moves
    }

    #getPawnQuietMoves(from: Square, moving: Piece, offset: number, doubleOffset: number, onStartSquare: boolean, promotes: boolean): BitMove[]
    {
        const moves: BitMove[] = []
        let to: number = from + offset
        if(this.squareList[to] == 0){
            if(promotes){
                moves.push(new BitMove(from, to, moving, 0, MoveType.KnightPromote))
                moves.push(new BitMove(from, to, moving, 0, MoveType.BishopPromote))
                moves.push(new BitMove(from, to, moving, 0, MoveType.RookPromote))
                moves.push(new BitMove(from, to, moving, 0, MoveType.QueenPromote))
            }else{
                moves.push(new BitMove(from, to, moving, 0, MoveType.Quiet))
                if(onStartSquare){
                    to = from + doubleOffset
                    if(this.squareList[to] == 0){
                        moves.push(new BitMove(from, to, moving, 0, MoveType.DoublePawnPush))
                    }
                }
            }
        }
        return moves
    }

    #getPawnCaptureMoves(from: Square, moving: Piece, color: Color, offsets: number[], promotes: boolean): BitMove[]
    {
        const moves: BitMove[] = []
        for(let i=0;i<2;i++){
            const to: number = from + offsets[i]
            const captured = this.squareList[to]

            if(captured == 0){
                if(to == this.state.enPassantTarget){
                    const captureSquare = this.enPassantCaptureOnSquares[this.square64Indexes[to]]
                    // @ts-ignore to is assumed to be valid if it matches the enPassantTarget
                    moves.push(new BitMove(from, to, moving, this.squareList[captureSquare], MoveType.EnPassant))
                }
                // cannot capture empty square if it's not en-passant.
                continue
            }
            if(captured == Square.Invalid // cannot capture out of bounds square
                || (captured & 1) == color // cannot capture friendly piece
            ){
                continue
            }

            if(promotes){
                moves.push(new BitMove(from, to, moving, captured, MoveType.KnightPromote | MoveType.Capture))
                moves.push(new BitMove(from, to, moving, captured, MoveType.BishopPromote | MoveType.Capture))
                moves.push(new BitMove(from, to, moving, captured, MoveType.RookPromote | MoveType.Capture))
                moves.push(new BitMove(from, to, moving, captured, MoveType.QueenPromote | MoveType.Capture))
            }else{
                moves.push(new BitMove(from, to, moving, captured, MoveType.Capture))
            }
        }
        return moves
    }
}