import {
    bgBrightBlue,
    bgBrightGreen,
    bgBrightMagenta,
    black,
    bold,
    white
} from "https://deno.land/std@0.219.1/fmt/colors.ts";
import { Square } from "./Square.ts";
import {Piece, PieceType, FenPieceMap} from "./Piece.ts";

/**
 * 10x12 board representation
 *
 * square encoding:
 *  zero - empty valid square
 *  255 - out-of-bounds sentinel value
 *  bits 8 - 2 are the piece type (black and white pawns are different types)
 *  bit 1 is the piece color
 */
export class Board
{

    readonly squareList = new Uint8Array(120) // encoded squares
    readonly square120Indexes: Uint8Array =  new Uint8Array([
        21, 22, 23, 24, 25, 26, 27, 28,
        31, 32, 33, 34, 35, 36, 37, 38,
        41, 42, 43, 44, 45, 46, 47, 48,
        51, 52, 53, 54, 55, 56, 57, 58,
        61, 62, 63, 64, 65, 66, 67, 68,
        71, 72, 73, 74, 75, 76, 77, 78,
        81, 82, 83, 84, 85, 86, 87, 88,
        91, 92, 93, 94, 95, 96, 97, 98,
    ]) // 8x8 index to 10x12 index
    readonly square64Indexes = new Uint8Array(120) // 10x12 index to 8x8 index

    // quick access to king squares, for checking if a move puts the king in check
    readonly kingSquares = new Uint8Array(2)

    // square data saved for quick access, uses index64
    readonly squareRanks = new Uint8Array(64) // rank 0-7
    readonly squareFiles = new Uint8Array(64) // file 0-7
    // The Chebyshev Distance - https://www.chessprogramming.org/Distance
    readonly squareDistances: Uint8Array[] = []

    constructor() {
        // initialize all squares to invalid
        for(let i = 0; i < 120; i++){
            this.squareList[i] = Square.Invalid
        }
        // set valid squares to empty and build map of indexes
        let row = 7
        for(let i = 0; i < 64; i++){
            const squareIndex = this.square120Indexes[i]
            this.square64Indexes[squareIndex] = i
            this.squareList[squareIndex] = 0
            this.squareRanks[i] = row
            this.squareFiles[i] = i % 8
            this.squareDistances[i] = new Uint8Array(64)
            if((i + 1) % 8 == 0){
                row--
            }
        }

        // calculate distances
        for(let i = 0; i < 64; i++){
            const rank1 = this.squareRanks[i]
            const file1 = this.squareFiles[i]
            for(let n= 0; n < 64; n++){
                const rank2 = this.squareRanks[n]
                const file2 = this.squareFiles[n]
                this.squareDistances[i][n] = Math.max(
                    Math.abs(rank2 - rank1),
                    Math.abs(file2 - file1)
                )
            }
        }
    }

    getDistanceBetweenSquares(square1: Square, square2: Square): number
    {
        return this.squareDistances[this.square64Indexes[square1]][this.square64Indexes[square2]]
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
                    const piece: Piece = FenPieceMap.get(character)
                    this.squareList[squareIndex] = piece
                    // store king positions for quicker access
                    if((piece >> 1) & PieceType.King){
                        // @ts-ignore ok
                        this.kingSquares[piece & 1] = squareIndex
                    }
                    squareIndex++
                }
            })
            squareIndex+=2
        }
    }


    render(highlights: Square[] = [])
    {
        const squaresByRank: Record<number, number[]> = {7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: [], 0: []}
        for(let i=0;i<64;i++){
            const rank = this.squareRanks[i]
            const piece = this.squareList[this.square120Indexes[i]]
            squaresByRank[rank].push(piece)
        }

        let i = 20
        for(let rank=7;rank>=0;rank--) {
            let squareType = rank % 2 === 0 ? 1: 0
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
        const pieceRenderMap: Record<PieceType, string> = {
            [PieceType.Pawn]: '♟',
            [PieceType.Knight]: '♞',
            [PieceType.Bishop]: '♝',
            [PieceType.Rook]: '♜',
            [PieceType.Queen]: '♛',
            [PieceType.King]: '♚',
            [PieceType.BPawn]: '♟',
        }

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

    serialize(): string {
        const files = ['a','b','c','d','e','f','g','h']
        // @ts-ignore let's try it
        const pieceMap = new Map(Array.from(FenPieceMap, a => a.reverse()));
        let emptySquares = 0
        let serialized = ''

        let row = 8
        for(let i=0;i<64;i++)
        {
            const piece = this.squareList[this.square120Indexes[i]]
            const isLastInRow = (i+1) % 8 == 0

            if(!piece){
                emptySquares++
                if(!isLastInRow){continue}
            }

            if(emptySquares > 0){
                serialized += emptySquares.toString()
                emptySquares = 0
            }
            if(piece) {
                const fenType = pieceMap.get(piece)
                serialized += fenType
            }
            if(isLastInRow){
                if(row != 1){
                    serialized += '/'
                }
                row--
            }
        }
        return serialized
    }
}