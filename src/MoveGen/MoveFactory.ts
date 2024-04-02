import {MoveHandler} from "./MoveHandler.ts";
import {Piece, Color, PieceType} from "../Board/Piece.ts";
import {Square} from "../Board/Square.ts";
import {Move, MoveType} from "./Move.ts";
import {CastlingMoveMap} from "./CastlingMove.ts";


enum RayDirection {
    N = -10, NE = -9, E = 1, SE = 11, S = 10, SW = 9, W = -1, NW = -11
}
class RayDirections {

    static readonly cardinal: number[] = [RayDirection.N, RayDirection.E, RayDirection.S, RayDirection.W]
    static readonly ordinal: number[] = [RayDirection.NE, RayDirection.SE, RayDirection.SW, RayDirection.NW]
    static readonly all: number[] = RayDirections.cardinal.concat(RayDirections.ordinal)
    static readonly knightMoves = [-21, -19,-12, -8, 8, 12, 19, 21]

    static readonly pieceMap = {
        // i[0]: max ray length
        // i[1]: capture ray directions
        [PieceType.Knight]: [1, RayDirections.knightMoves],
        [PieceType.Rook]:   [7, RayDirections.cardinal],
        [PieceType.Bishop]: [7, RayDirections.ordinal],
        [PieceType.Queen]:  [7, RayDirections.all],
        [PieceType.King]:   [1, RayDirections.all],

        // i[0]: double-move rank
        // i[1]: promotion rank
        // i[2]: capture move ray directions
        // i[3]: quiet move ray directions
        [PieceType.Pawn]:   [1, 6, [RayDirection.NW , RayDirection.NE], [RayDirection.N, RayDirection.N * 2]],
        [PieceType.BPawn]:  [6, 1, [RayDirection.SW , RayDirection.SE], [RayDirection.S, RayDirection.S * 2]],
    }
}

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
        let moves: Move[] = []
        for(let i=0;i<64;i++){
            const from = this.square120Indexes[i]
            const piece = this.squareList[from]
            if(piece != 0 && (piece & 1) == color){
                moves = moves.concat(this.getLegalMovesFromSquare(from, piece))
            }
        }
        return moves
    }

    getLegalMovesFromSquare(from: Square, moving: Piece): Move[] {
        const movingColor = this.state.sideToMove
        const enemyColor = this.state.sideToMove ? 0 : 1
        return this.getMovesFromSquare(from, moving).filter((move) => {
            super.makeMove(move)
            const isCheck = this.isSquareThreatened(this.kingSquares[movingColor], enemyColor)
            super.unmakeMove(move)
            return !isCheck
        })

    }

    getMovesFromSquare(from: Square, moving: Piece): Move[]
    {
        const moves: Move[] = []
        const type = moving >> 1
        const color: Color = moving & 1

        if(type & PieceType.Pawn || type & PieceType.BPawn){
            return this.#getPawnMoves(from, moving, type, color)
        }

        // @ts-ignore - is correct
        const rayDirections = RayDirections.pieceMap[type]
        const offsets = rayDirections[1]
        const maxRayLength = rayDirections[0]
        for(let i = 0; i<offsets.length;i++) {
            const offset = offsets[i]
            for (let j = 1; j <= maxRayLength; j++) {
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
        if(!(type & PieceType.King) || from != CastlingMoveMap.kingSquareByColor[color]){
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
        const hasKnightThreat = !this.getMovesFromSquare(square, PieceType.Knight << 1 | movingColor)
            .every((move) => move.flag == MoveType.Quiet || !(move.captured >> 1 & PieceType.Knight))
        if(hasKnightThreat){return true}

        const hasCardinalThreat = !this.getMovesFromSquare(square, PieceType.Rook << 1 | movingColor)
            .every((move) => {
                if(move.flag == MoveType.Quiet){return true}
                const capturedType = move.captured >> 1
                if(capturedType & (PieceType.Rook | PieceType.Queen)){return false}
                if(capturedType & PieceType.King){
                    // king can only capture if adjacent
                    if(this.getDistanceBetweenSquares(square, move.to) == 1){
                        return false
                    }
                }
                return true
            })
        if(hasCardinalThreat){return true}

        // Diagonal threat
        return !this.getMovesFromSquare(square, PieceType.Bishop << 1 | movingColor)
            .every((move) => {
                if(move.flag == MoveType.Quiet){return true}
                const capturedType = move.captured >> 1
                if(capturedType & (PieceType.Bishop | PieceType.Queen)){return false}
                if(capturedType & PieceType.King){
                    // king can only capture if adjacent
                    if(this.getDistanceBetweenSquares(square, move.to) == 1){
                        return false
                    }
                }
                if(capturedType & PieceType.Pawn || capturedType & PieceType.BPawn){
                    //@ts-ignore these are the correct directions
                    const captureOffset: number[] = RayDirections.pieceMap[capturedType][2]
                    const actualOffset = move.from - move.to
                    return !captureOffset.includes(actualOffset)
                }
                return true
            })
    }

    #getPawnMoves(from: Square, moving: Piece, type: PieceType, color: Color): Move[] {
        const moves: Move[] = []
        const [
            doubleMoveRank,
            promotesFromRank,
            captureOffsets,
            quietOffsets
        ] = RayDirections.pieceMap[type]
        const rank = this.squareRanks[this.square64Indexes[from]]

        // Quiet moves
        // @ts-ignore it's fine
        let to: number = from + quietOffsets[0]
        if(this.squareList[to] == 0){
            if(promotesFromRank == rank){
                moves.push(new Move(from, to, moving, 0, MoveType.KnightPromote))
                moves.push(new Move(from, to, moving, 0, MoveType.BishopPromote))
                moves.push(new Move(from, to, moving, 0, MoveType.RookPromote))
                moves.push(new Move(from, to, moving, 0, MoveType.QueenPromote))
            }else{
                moves.push(new Move(from, to, moving, 0, MoveType.Quiet))
                if(rank == doubleMoveRank){
                    // @ts-ignore also fine
                    to = from + quietOffsets[1]
                    if(this.squareList[to] == 0){
                        moves.push(new Move(from, to, moving, 0, MoveType.DoublePawnPush))
                    }
                }
            }
        }

        // Capture moves
        const promotes = promotesFromRank == rank
        for(let i=0;i<2;i++){
            // @ts-ignore it's fine
            const to: number = from + captureOffsets[i]
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