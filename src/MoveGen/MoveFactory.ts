import {MoveHandler} from "./MoveHandler.ts";
import {Piece, Color, PieceType} from "../Board/Piece.ts";
import {Square} from "../Board/Square.ts";
import {Move, MoveType} from "./Move.ts";
import {CastlingMoveMap} from "./CastlingMove.ts";


export class MoveFactory extends MoveHandler
{
    options = {
        evaluateChecksAndMates: false,
    }

    makeMove(move: Move) {
        super.makeMove(move);
        if(this.options.evaluateChecksAndMates){
            const movingColor = move.moving & 1
            const enemyColor = movingColor ? 0 : 1
            move.isCheck = this.isSquareThreatened(this.kingSquares[enemyColor], movingColor)
            if(move.isCheck){
                move.isMate = !this.hasLegalMoves(enemyColor)
            }
        }
    }

    hasLegalMoves(color: Color) {
        for(let i=0;i<64;i++){
            const from = this.square120Indexes[i]
            const piece = this.squareList[from]
            if(piece != 0 && (piece & 1) == color){
                // if(this.hasLegalMoveFromSquare(from, piece)){
                //     return true
                // }

                // TODO: This can be improved to early return on the first legal move within a single piece's move set
                if(this.getLegalMovesFromSquare(from, piece).length > 0) {
                    // early return
                    return true
                }
            }
        }
        return false
    }

    getLegalMoves(color: Color = this.state.sideToMove){
        const moves: Move[] = []
        for(let i=0;i<64;i++){
            const from = this.square120Indexes[i]
            const piece = this.squareList[from]

            if(piece != 0 && (piece & 1) == color){
                const movesForSquare = this.getLegalMovesFromSquare(from, piece)
                for(let j=0;j<movesForSquare.length;j++){
                    moves.push(movesForSquare[j])
                }
            }
        }
        return moves
    }

    getLegalMovesFromSquare(from: Square, moving: Piece): Move[] {
        const movingColor = this.state.sideToMove
        const enemyColor = this.state.sideToMove ? 0 : 1
        return this.getMovesFromSquare(from, moving).filter((move) => {
            return this.#isMoveLegal(move, movingColor, enemyColor)
        })
    }

    hasLegalMoveFromSquare(from: Square, moving: Piece): boolean {
        const type = moving >> 1
        const color: Color = moving & 1

        if(type & PieceType.Pawn){
            return this.#hasLegalPawnMove(from, moving)
        }

        if(type & PieceType.BPawn){
            return this.#hasLegalBPawnMove(from, moving)
        }

        if(type & PieceType.Knight){
            return this.#hasLegalKnightMove(from, moving, color)
        }

        if(type & PieceType.King){
            return this.#hasLegalKingMove(from, moving, color)
        }

        if(type & PieceType.Bishop){
            return this.#hasLegalDiagonalMove(from, moving, color)
        }

        if(type & PieceType.Rook){
            return this.#hasLegalLateralMove(from, moving, color)
        }

        // only the queen remains
        return this.#hasLegalDiagonalMove(from, moving, color) || this.#hasLegalLateralMove(from, moving, color);

    }

    getMovesFromSquare(from: Square, moving: Piece): Move[]
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

    #getMovesFromOffsets(from: Square, moving: Piece, color: Color, offsets: number[], maxRayLen: number): Move[] {
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
                    moves.push(new Move(from, to, moving, 0, MoveType.Quiet))
                    continue
                }
                if ((captured & 1) == color) {
                    // friendly piece
                    break
                }
                moves.push(new Move(from, to, moving, captured, MoveType.Capture))
                break
            }
        }
        return moves
    }

    #hasLegalMoveFromOffsets(from: Square, moving: Piece, offsets: number[], maxRayLen: number, movingColor: Color, enemyColor: Color): boolean {
        for(let i = 0; i<offsets.length;i++) {
            const offset = offsets[i]
            for (let j = 1; j <= maxRayLen; j++) {
                const to: number = from + j * offset
                const captured = this.squareList[to]
                if (captured == Square.Invalid) {
                    break // square out of bounds
                }
                if (captured == 0) {
                    if(this.#isMoveLegal(new Move(from, to, moving, 0, MoveType.Quiet), movingColor, enemyColor)){
                        return true
                    }
                    continue
                }
                if ((captured & 1) == movingColor) {
                    // friendly piece
                    break
                }
                if(this.#isMoveLegal(new Move(from, to, moving, captured, MoveType.Capture), movingColor, enemyColor)){
                    return true
                }
                break
            }
        }
        return false
    }

    #getLateralMoves(from: Square, moving: Piece, color: Color): Move[]
    {
        return this.#getMovesFromOffsets(from, moving, color, [1,10,-1,-10], 7)
    }

    #hasLegalLateralMove(from: Square, moving: Piece, color: Color): boolean
    {
        return this.#hasLegalMoveFromOffsets(from, moving, [1,10,-1,-10], 7, color, color ? 0 : 1)
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

    #getDiagonalMoves(from: Square, moving: Piece, color: Color): Move[]
    {
        return this.#getMovesFromOffsets(from, moving, color, [9,11,-9,-11], 7)
    }

    #hasLegalDiagonalMove(from: Square, moving: Piece, color: Color): boolean
    {
        return this.#hasLegalMoveFromOffsets(from, moving, [9,11,-9,-11], 7, color, color ? 0 : 1)
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


    #getKnightMoves(from: Square, moving: Piece, color: Color): Move[]
    {
        return this.#getMovesFromOffsets(from, moving, color, [-21, -19,-12, -8, 8, 12, 19, 21], 1)
    }

    #hasLegalKnightMove(from: Square, moving: Piece, color: Color): boolean
    {
        return this.#hasLegalMoveFromOffsets(from, moving, [-21, -19,-12, -8, 8, 12, 19, 21], 1, color, color ? 0 : 1)
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

    #getKingMoves(from: Square, moving: Piece, color: Color): Move[]
    {
        const moves = this.#getMovesFromOffsets(from, moving, color, [-10, -9, 1, 11, 10, 9, -1, -11], 1)

        if(from != CastlingMoveMap.kingSquareByColor[color]){
            return moves
        }

        //handle castling moves
        const castlingRights = this.state.getCastlingRights(color)
        const enemyColor = color ? 0: 1
        for(let i = 0; i < castlingRights.length; i++){
            const castlingMove = CastlingMoveMap.byRight[castlingRights[i]]
            if(!castlingMove.emptySquares.every((square)=> this.squareList[square] == 0)){
                continue
            }

            if(!castlingMove.safeSquares.every((square) => !this.isSquareThreatened(square,enemyColor))){
                continue
            }
            moves.push(castlingMove.move)
        }

        return moves
    }

    #hasLegalKingMove(from: Square, moving: Piece, color: Color): boolean
    {
        const enemyColor = color ? 0 : 1
        if(this.#hasLegalMoveFromOffsets(from, moving, [-10, -9, 1, 11, 10, 9, -1, -11], 1, color, enemyColor)) {
            return true
        }

        if(from != CastlingMoveMap.kingSquareByColor[color]){
            return false
        }

        //handle castling moves
        const castlingRights = this.state.getCastlingRights(color)
        for(let i = 0; i < castlingRights.length; i++){
            const castlingMove = CastlingMoveMap.byRight[castlingRights[i]]
            if(!castlingMove.emptySquares.every((square)=> this.squareList[square] == 0)){
                continue
            }
            if(!castlingMove.safeSquares.every((square) => !this.isSquareThreatened(square,enemyColor))){
                continue
            }
            if(this.#isMoveLegal(castlingMove.move, color, enemyColor)){
                return true
            }
        }
       return false
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
    ): Move[] {
        const rank = this.squareRanks[this.square64Indexes[from]]
        const promotes = rank == 6

        const moves = this.#getPawnQuietMoves(from, moving, -10, -20, rank == 1, promotes)
        const captureMoves = this.#getPawnCaptureMoves(from, moving, 0, [-11,-9], promotes)
        for(let i = 0; i < captureMoves.length; i++){
            moves.push(captureMoves[i])
        }
        return moves
    }

    #hasLegalPawnMove(from: Square, moving: Piece): boolean {
        const rank = this.squareRanks[this.square64Indexes[from]]
        return this.#hasLegalPawnQuietMove(from, moving, -10, rank == 1, 0, 1)
            || this.#hasLegalPawnCaptureMove(from, moving, [-11,-9], 0 , 1)
    }
    #hasLegalBPawnMove(from: Square, moving: Piece): boolean {
        const rank = this.squareRanks[this.square64Indexes[from]]
        return this.#hasLegalPawnQuietMove(from, moving, 10, rank == 6, 1, 0)
            || this.#hasLegalPawnCaptureMove(from, moving, [11,9], 1 , 0)
    }

    #isMoveLegal(move: Move, movingColor: Color, enemyColor: Color): boolean {
        super.makeMove(move)
        const isCheck = this.isSquareThreatened(this.kingSquares[movingColor], enemyColor)
        super.unmakeMove(move)
        return !isCheck
    }

    #hasLegalPawnQuietMove(from: Square, moving: Piece, offset: number, onStartSquare: boolean, movingColor: Color, enemyColor: Color): boolean
    {
        const to: number = from + offset
        if(this.squareList[to] == 0){
            if(this.#isMoveLegal(new Move(from, to, moving, 0, MoveType.Quiet), movingColor, enemyColor)) {
                return true
            }
            if(onStartSquare
                && this.squareList[to + offset] == 0
                && this.#isMoveLegal(new Move(from, to + offset, moving, 0, MoveType.Quiet), movingColor, enemyColor)) {
                return true
            }
        }
        return false
    }

    #hasLegalPawnCaptureMove(from: Square, moving: Piece, offsets: number[], movingColor: Color, enemyColor: Color): boolean
    {
        for(let i=0;i<2;i++){
            const to: number = from + offsets[i]
            const captured = this.squareList[to]

            if(captured == 0){
                if(to == this.state.enPassantTarget){
                    const captureSquare = this.enPassantCaptureOnSquares[this.square64Indexes[to]]
                    // @ts-ignore to is assumed to be valid if it matches the enPassantTarget
                    if(this.#isMoveLegal(new Move(from, to, moving, this.squareList[captureSquare], MoveType.EnPassant), movingColor, enemyColor)){
                        return true
                    }
                }
                // cannot capture empty square if it's not en-passant.
                continue
            }
            if(captured == Square.Invalid // cannot capture out of bounds square
                || (captured & 1) == movingColor // cannot capture friendly piece
            ){
                continue
            }

            if(this.#isMoveLegal(new Move(from, to, moving, captured, MoveType.Capture), movingColor, enemyColor)){
                return true
            }
        }
        return false
    }


    #getBPawnMoves(from: Square, moving: Piece): Move[]
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

    #getPawnQuietMoves(from: Square, moving: Piece, offset: number, doubleOffset: number, onStartSquare: boolean, promotes: boolean): Move[]
    {
        const moves: Move[] = []
        let to: number = from + offset
        if(this.squareList[to] == 0){
            if(promotes){
                moves.push(new Move(from, to, moving, 0, MoveType.KnightPromote))
                moves.push(new Move(from, to, moving, 0, MoveType.BishopPromote))
                moves.push(new Move(from, to, moving, 0, MoveType.RookPromote))
                moves.push(new Move(from, to, moving, 0, MoveType.QueenPromote))
            }else{
                moves.push(new Move(from, to, moving, 0, MoveType.Quiet))
                if(onStartSquare){
                    to = from + doubleOffset
                    if(this.squareList[to] == 0){
                        moves.push(new Move(from, to, moving, 0, MoveType.DoublePawnPush))
                    }
                }
            }
        }
        return moves
    }

    #getPawnCaptureMoves(from: Square, moving: Piece, color: Color, offsets: number[], promotes: boolean): Move[]
    {
        const moves: Move[] = []
        for(let i=0;i<2;i++){
            const to: number = from + offsets[i]
            const captured = this.squareList[to]

            if(captured == 0){
                if(to == this.state.enPassantTarget){
                    const captureSquare = this.enPassantCaptureOnSquares[this.square64Indexes[to]]
                    // @ts-ignore to is assumed to be valid if it matches the enPassantTarget
                    moves.push(new Move(from, to, moving, this.squareList[captureSquare], MoveType.EnPassant))
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
                moves.push(new Move(from, to, moving, captured, MoveType.KnightPromote | MoveType.Capture))
                moves.push(new Move(from, to, moving, captured, MoveType.BishopPromote | MoveType.Capture))
                moves.push(new Move(from, to, moving, captured, MoveType.RookPromote | MoveType.Capture))
                moves.push(new Move(from, to, moving, captured, MoveType.QueenPromote | MoveType.Capture))
            }else{
                moves.push(new Move(from, to, moving, captured, MoveType.Capture))
            }
        }
        return moves
    }
}