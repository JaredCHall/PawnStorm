

//
import {FenPieceMap, Piece, pieceRenderMap, Square, SquareIndexes, Color, PieceType, CastlingRight} from "./Enums.ts";
import {
    bgBrightBlue,
    bgBrightGreen,
    bgBrightMagenta,
    black,
    bold,
    white
} from "https://deno.land/std@0.219.1/fmt/colors.ts";
import {Move, MoveFlag, MoveType} from "./Move.ts";
import {dumpBin} from "./Utils.ts";

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
        [PieceType.Pawn]:   [2, 7, [RayDirection.NW , RayDirection.NE], [RayDirection.N, RayDirection.N * 2]],
        [PieceType.BPawn]:  [7, 2, [RayDirection.SW , RayDirection.SE], [RayDirection.S, RayDirection.S * 2]],
    }

    static onSameRay(square1: Square, square2: Square): boolean
    {
        throw new Error('not implemented')
    }
}

export class CastlingData {
    static readonly sideMask: Record<Color, number> = {
        [Color.White]: 0b1100,
        [Color.Black]: 0b0011,
    }
    static readonly kingSquare: Record<Color, number> = {
        [Color.White]: Square.e1,
        [Color.Black]: Square.e8,
    }
    // i[0] - king
    // i[1] - rook
    // i[2] - squares that must be empty
    // i[3] - squares that must be safe
    static readonly fromToSquares: Record<CastlingRight, number[][]> = {
        [CastlingRight.K]: [[Square.e1, Square.g1], [Square.h1, Square.f1], [Square.f1, Square.g1], [Square.e1, Square.f1]],
        [CastlingRight.Q]: [[Square.e1, Square.c1], [Square.a1, Square.d1], [Square.d1, Square.c1, Square.b1], [Square.e1, Square.d1]],
        [CastlingRight.k]: [[Square.e8, Square.g8], [Square.h8, Square.f8], [Square.f8, Square.g8], [Square.e8, Square.f8]],
        [CastlingRight.q]: [[Square.e8, Square.c8], [Square.a8, Square.d8], [Square.d8, Square.c8, Square.b8], [Square.e8, Square.d8]],
    }

    static readonly MoveTypes = {
        [CastlingRight.K]: MoveType.CastleShort, [CastlingRight.Q]: MoveType.CastleLong,
        [CastlingRight.k]: MoveType.CastleShort, [CastlingRight.q]: MoveType.CastleLong,
    }
}

export class BoardState {
    sideToMove: Color = Color.White
    castleRights: number = 0b0000
    enPassantTarget: Square|0 = 0
    halfMoveClock: number = 0

    getCastlingRights(color: Color){
        const rights = []
        if(color & 1){
            // black
            if(this.castleRights & CastlingRight.k){
                rights.push(CastlingRight.k)
            }
            if(this.castleRights & CastlingRight.q){
                rights.push(CastlingRight.q)
            }
        }else{
            //white
            if(this.castleRights & CastlingRight.K){
                rights.push(CastlingRight.K)
            }
            if(this.castleRights & CastlingRight.Q){
                rights.push(CastlingRight.Q)
            }

        }
        return rights
    }

}

export class Board {

    /**
     * 10x12 board representation
     *
     * square encoding:
     *  zero - empty valid square
     *  bit 8 - set if square is out-of-bounds
     *  bits 7 - 2 are the piece type
     *  bit 1 is the piece color
     */
    readonly squareList = new Uint8Array(120) // first bit is if square is out-of-bounds. next
    readonly squareMailboxMap: Uint8Array =  new Uint8Array(64) // 8x8 index to 10x12 index
    readonly squareIndexMap = new Uint8Array(120) // 10x12 index to 8x8 index
    readonly squaresRanks = new Uint8Array(120)
    readonly squaresFiles = new Uint8Array(120) // files represented as 0-7 for 1-8

    // https://www.chessprogramming.org/Distance
    readonly chebyshevDistances: Uint8Array[] = []

    state = new BoardState()

    constructor() {
        // initialize all squares to invalid
        for(let i = 0; i < 120; i++){
            this.squareList[i] = Square.Invalid
        }
        // set valid squares to empty and build map of indexes
        let row = 8
        for(let i = 0; i < 64; i++){
            const squareIndex = SquareIndexes[i]
            this.squareMailboxMap[i] = squareIndex
            this.squareIndexMap[squareIndex] = i
            this.squareList[squareIndex] = 0
            this.squaresRanks[squareIndex] = row
            this.squaresFiles[squareIndex] = i % 8
            this.chebyshevDistances[i] = new Uint8Array(64)
            if((i + 1) % 8 == 0){
                row--
            }
        }

        // calculate distances
        for(let i = 0; i < 64; i++){
            const square1 = this.squareMailboxMap[i]
            for(let n=0; n < 64; n++){
                const square2 = this.squareMailboxMap[n]
                const rank1 = this.squaresRanks[square1]
                const rank2 = this.squaresRanks[square2]
                const file1 = this.squaresFiles[square1]
                const file2 = this.squaresFiles[square2]
                this.chebyshevDistances[i][n] = Math.max(Math.abs(rank2 - rank1),Math.abs(file2 - file1))
            }
        }
    }

    getDistanceBetweenSquares(square1: Square, square2: Square): number
    {
        return this.chebyshevDistances[this.squareIndexMap[square1]][this.squareIndexMap[square2]]
    }

    setPieces(piecePlacementsString: string) {
        const rows = piecePlacementsString.split('/').reverse()
        if (rows.length !== 8) {throw new Error('FEN piece placement must include all eight rows')}
        let squareIndex = 21
        for (let row = 8; row > 0; row--) {
            rows[row - 1].split('').forEach((character) => {
                if (/[1-8]/.test(character)) {
                    // Skip Empty Squares
                    const empties = parseInt(character)
                    for(let n=0;n<empties;n++){
                        this.squareList[squareIndex] = 0
                        squareIndex++
                    }
                } else if (/[rbnqkpRBNQKP]/.test(character)) {
                    // Handle Pieces
                    // @ts-ignore it's fine
                    const piece = FenPieceMap[character]
                    this.squareList[squareIndex] = piece
                    squareIndex++
                }
            })
            squareIndex+=2
        }
    }

    getMovesForSquare(from: Square, moving: Piece): Move[]
    {
        const moves: Move[] = []
        const type = moving >> 1
        const color: Color = moving & 1

        if(type & PieceType.Pawn || type & PieceType.BPawn){
            return this.#getPawnMoves(from, moving, type, color)
        }

        // @ts-ignore
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
        if(!(type & PieceType.King) || from != CastlingData.kingSquare[color]){
            return moves
        }


        //handle castling moves
        this.state.getCastlingRights(color).forEach((right) => {
            const [kingSquares, rookSquares, emptySquares, safeSquares] = CastlingData.fromToSquares[right]
            if(!emptySquares.every((square)=> this.squareList[square] == 0)){
                return
            }
            const enemyColor = color ? 0: 1
            if(!safeSquares.every((square) => !this.isSquareThreatened(square,enemyColor))){
                return
            }

            moves.push(new Move(from, kingSquares[1], moving, 0, CastlingData.MoveTypes[right]))
        })

        return moves
    }

    isSquareThreatened(square: Square, enemyColor: Color)
    {
        const movingColor = enemyColor ? 0 : 1
        const hasKnightThreat = !this.getMovesForSquare(square, PieceType.Knight << 1 | movingColor)
            .every((move) => move.flag == MoveType.Quiet || !(move.captured >> 1 & PieceType.Knight))
        if(hasKnightThreat){return true}

        const hasCardinalThreat = !this.getMovesForSquare(square, PieceType.Rook << 1 | movingColor)
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
        return !this.getMovesForSquare(square, PieceType.Bishop << 1 | movingColor)
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
        const rank = this.squaresRanks[from]

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
                    // @ts-ignore it's fine - captured piece is one quiet move behind the pawn
                    moves.push(new Move(from, to, moving, this.squareList[to + -1 * quietOffsets[0]], MoveType.EnPassant))
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

    render(highlights: Square[] = [])
    {
        const squaresByRank: Record<number, number[]> = {8: [], 7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: []}
        for(let i=0;i<64;i++){
            const rank = Math.floor((i + 1) / -8) + 9;
            const piece = this.squareList[this.squareMailboxMap[i]]
            squaresByRank[rank].push(piece)
        }

        let i = 20
        for(let rank=8;rank>0;rank--) {
            let squareType = rank % 2 === 0 ? 0 : 1
            console.log(squaresByRank[rank].map((piece)=> {
                i++
                const formatted = this.formatSquare(squareType, piece, highlights.includes(i))
                squareType ^= 1
                return formatted
            }).join(''))
            i+= 2
        }
    }

    formatSquare(squareType: number, moving: number, highlight:boolean)
    {
        //@ts-ignore ok
        let formatted = (pieceRenderMap[moving >> 1] ?? ' ') + ' '

        if(highlight){
            formatted = bgBrightGreen(formatted)
        }else{
            formatted = squareType === 0 ? bgBrightMagenta(formatted) : bgBrightBlue(formatted)
        }

        if(moving == 0){
            return formatted
        }

        return moving & 1 ? bold(black(formatted)) : bold(white(formatted))
    }

}