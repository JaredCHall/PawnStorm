
export enum Color {
    White= 0,
    Black= 1
}

export enum PieceType {
    Pawn = 1 << 0,
    Knight= 1 << 1,
    Rook = 1 << 2,
    Bishop = 1 << 3,
    Queen = 1 << 4,
    King = 1 << 5
}

export enum Square {
    a8 = 0, b8,c8, d8, e8, f8,g8,h8,
    a7, b7,c7, d7, e7, f7,g7,h7,
    a6, b6,c6, d6, e6, f6,g6,h6,
    a5, b5,c5, d5, e5, f5,g5,h5,
    a4, b4,c4, d4, e4, f4,g4,h4,
    a3, b3,c3, d3, e3, f3,g3,h3,
    a2, b2,c2, d2, e2, f2,g2,h2,
    a1, b1,c1, d1, e1, f1,g1,h1,
    Empty = 255,
}

export const FenPieceTypeMap = {
    p: PieceType.Pawn,
    n: PieceType.Knight,
    b: PieceType.Bishop,
    r: PieceType.Rook,
    q: PieceType.Queen,
    k: PieceType.King
}

export class Board
{
    //attackList: Uint32Array = new Uint32Array(64)
    pieceList: Uint8Array = new Uint8Array(32)
    squareList: Uint8Array = new Uint8Array(64)
    pieceTypeList: Uint8Array = new Uint8Array(32) // last bit is color, first 6 bits are piece type

    constructor() {
        for(let i = 0; i<64; i++){
            this.squareList[i] = Square.Empty
        }
    }

    setPieces(piecePlacementsString: string) {
        const rows = piecePlacementsString.split('/').reverse()
        if (rows.length !== 8) {throw new Error('FEN piece placement must include all eight rows')}
        let squareIndex = 0
        let pieceIndex = 0
        for (let row = 8; row > 0; row--) {
            rows[row - 1].split('').forEach((character) => {
                if (/[1-8]/.test(character)) {
                    squareIndex += parseInt(character)
                } else if (/[rbnqkpRBNQKP]/.test(character)) {
                    const color = character.toUpperCase() === character ? Color.White : Color.Black
                    //@ts-ignore - ok because of regex check
                    const pieceType: PieceType = FenPieceTypeMap[character.toLowerCase()]
                    this.#initializePiece(pieceIndex, pieceType, color, squareIndex)
                    pieceIndex++
                    squareIndex++
                }
            })
        }
    }


    #initializePiece(index: number, type: PieceType, color: Color, square: Square)
    {
        this.pieceTypeList[index] = type << 1 | color //shift to the left one bit and set last bit the same as color
        this.pieceList[index] = square
        this.squareList[square] = index
    }


}

