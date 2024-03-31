import {
    bgBrightBlue,
    bgBrightGreen,
    bgBrightMagenta,
    black,
    bold,
    white
} from "https://deno.land/std@0.219.1/fmt/colors.ts";

export enum Color { // 1 bit
    White= 0,
    Black= 1
}

export enum PieceType { // 7 bits
    Pawn    = 0b0000001,
    Knight  = 0b0000010,
    Rook    = 0b0000100,
    Bishop  = 0b0001000,
    Queen   = 0b0010000,
    King    = 0b0100000,
    BPawn   = 0b1000000
}

const pieceRenderMap: Record<PieceType, string> = {
    [PieceType.Pawn]: '♟',
    [PieceType.Knight]: '♞',
    [PieceType.Bishop]: '♝',
    [PieceType.Rook]: '♜',
    [PieceType.Queen]: '♛',
    [PieceType.King]: '♚',
    [PieceType.BPawn]: '♟',
}

export enum Piece { // 8 bits
    None = 0,
    WhitePawn = PieceType.Pawn << 1 | Color.White,
    WhiteKnight = PieceType.Knight << 1 | Color.White,
    WhiteBishop = PieceType.Bishop << 1 | Color.White,
    WhiteRook = PieceType.Rook << 1 | Color.White,
    WhiteQueen = PieceType.Queen << 1 | Color.White,
    WhiteKing = PieceType.King << 1 | Color.White,
    BlackPawn = PieceType.BPawn << 1 | Color.Black,
    BlackKnight = PieceType.Knight << 1 | Color.Black,
    BlackBishop = PieceType.Bishop << 1 | Color.Black,
    BlackRook = PieceType.Rook << 1 | Color.Black,
    BlackQueen = PieceType.Queen << 1 | Color.Black,
    BlackKing = PieceType.King << 1 | Color.Black,
}

export const FenPieceMap = {
    p: Piece.BlackPawn, n: Piece.BlackKnight, b: Piece.BlackBishop, r: Piece.BlackRook, q: Piece.BlackQueen, k: Piece.BlackKing,
    P: Piece.WhitePawn, N: Piece.WhiteKnight, B: Piece.WhiteBishop, R: Piece.WhiteRook, Q: Piece.WhiteQueen, K: Piece.WhiteKing
}

export enum Square { // 7 bits
    a8 = 21, b8,c8, d8, e8, f8,g8,h8,
    a7 = 31, b7,c7, d7, e7, f7,g7,h7,
    a6 = 41, b6,c6, d6, e6, f6,g6,h6,
    a5 = 51, b5,c5, d5, e5, f5,g5,h5,
    a4 = 61, b4,c4, d4, e4, f4,g4,h4,
    a3 = 71, b3,c3, d3, e3, f3,g3,h3,
    a2 = 81, b2,c2, d2, e2, f2,g2,h2,
    a1 = 91, b1,c1, d1, e1, f1,g1,h1,
    Invalid = 255
}

export enum SquareFile {a, b, c, d, e, f, g, h}
export type SquareRank = 0|1|2|3|4|5|6|7
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
                    const piece = FenPieceMap[character]
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