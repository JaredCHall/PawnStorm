

//
import {FenPieceMap, MoveType, Piece, pieceRenderMap, Square, SquareIndexes, Color, PieceType} from "./Enums.ts";
import {
    bgBrightBlue,
    bgBrightGreen,
    bgBrightMagenta,
    black,
    bold,
    white
} from "https://deno.land/std@0.219.1/fmt/colors.ts";
import {Move} from "./Move.ts";


class RayDirections {
    static readonly cardinal: number[] = [-10, -1, 1, 10]
    static readonly diagonal: number[] = [9, 11, -9, -11]
    static readonly all: number[] = RayDirections.cardinal.concat(RayDirections.diagonal)
    static readonly knightMoves = [-21, -19,-12, -8, 8, 12, 19, 21]

    // i[0]: max ray length
    // i[1]: capture ray directions
    // i[2]: quiet move ray directions (pawns only)
    static readonly pieceMap = {
        [PieceType.Knight]: [7, RayDirections.knightMoves],
        [PieceType.Rook]:   [7, RayDirections.cardinal],
        [PieceType.Bishop]: [7, RayDirections.diagonal],
        [PieceType.Queen]:  [7, RayDirections.all],
        [PieceType.King]:   [7, RayDirections.all],
        [PieceType.Pawn]:   [1, [-11 , -9], [10, 20]],
        [PieceType.BPawn]:  [1, [11, 9], [10, 20]],
    }
}

export class BoardState {
    sideToMove: Color = Color.White
    castleRights: number = 0b0000
    enPassantTarget: Square|0 = 0
    halfMoveClock: number = 0
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
    squareList = new Uint8Array(120) // first bit is if square is out-of-bounds. next
    squareIndexMap: Uint8Array =  new Uint8Array(64)

    constructor() {
        // initialize all squares to invalid
        for(let i = 0; i < 120; i++){
            this.squareList[i] = Square.Invalid
        }
        // set valid squares to empty and build map of indexes
        for(let i = 0; i < 64; i++){
            this.squareIndexMap[i] = SquareIndexes[i]
            this.squareList[SquareIndexes[i]] = 0
        }
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
        const color = moving & 1

        if(type & PieceType.Pawn || type & Piece.BlackPawn){
           throw new Error('not implemented')
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
                if (captured & Square.Invalid) {
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
            }
        }
        return moves
    }

    render(highlights: Square[] = [])
    {
        const squaresByRank: Record<number, number[]> = {8: [], 7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: []}
        for(let i=0;i<64;i++){
            const rank = Math.floor((i + 1) / -8) + 9;
            const piece = this.squareList[this.squareIndexMap[i]]
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