import {Move, MoveType} from "./Move.ts";

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

export enum Piece {
    None = 0,
    WhitePawn = PieceType.Pawn << 1 | Color.White,
    WhiteKnight = PieceType.Knight << 1 | Color.White,
    WhiteBishop = PieceType.Bishop << 1 | Color.White,
    WhiteRook = PieceType.Rook << 1 | Color.White,
    WhiteQueen = PieceType.Queen << 1 | Color.White,
    WhiteKing = PieceType.King << 1 | Color.White,
    BlackPawn = PieceType.Pawn << 1 | Color.Black,
    BlackKnight = PieceType.Knight << 1 | Color.Black,
    BlackBishop = PieceType.Bishop << 1 | Color.Black,
    BlackRook = PieceType.Rook << 1 | Color.Black,
    BlackQueen = PieceType.Queen << 1 | Color.Black,
    BlackKing = PieceType.King << 1 | Color.Black,
}


export enum Square {
    a8 = 21, b8,c8, d8, e8, f8,g8,h8,
    a7 = 31, b7,c7, d7, e7, f7,g7,h7,
    a6= 41, b6,c6, d6, e6, f6,g6,h6,
    a5=51, b5,c5, d5, e5, f5,g5,h5,
    a4=61, b4,c4, d4, e4, f4,g4,h4,
    a3=71, b3,c3, d3, e3, f3,g3,h3,
    a2=81, b2,c2, d2, e2, f2,g2,h2,
    a1=91, b1,c1, d1, e1, f1,g1,h1,
}

export enum SquareState {
    Empty = 64,
    Invalid = 128
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
    attackList: Uint32Array = new Uint32Array(64)
    pieceList: Uint8Array = new Uint8Array(32)
    squareList: Uint8Array = new Uint8Array(120)
    pieceTypeList: Uint8Array = new Uint8Array(32) // last bit is color, first 6 bits are piece type

    #flushLists() {
        this.attackList = new Uint32Array(64)
        this.pieceList = new Uint8Array(32)
        this.squareList = new Uint8Array(120)
        this.pieceTypeList = new Uint8Array(32)

        for(let i = 0; i < 32; i++) {
            this.pieceList[i] = SquareState.Empty
            this.pieceTypeList[i] = Piece.None
        }

        for(let i = 0; i < 120; i++) {
            this.squareList[i] = SquareState.Invalid
        }
        for(const i in Square){
            // @ts-ignore ok
            this.squareList[Square[i]] = SquareState.Empty
        }
    }

    genMove(from: Square, to: Square, moveType: MoveType = MoveType.Quiet): Move
    {
        const moving = this.squareList[from]
        if(moveType == MoveType.EnPassant){
            const epSquare = (moving & Color.Black) != 0 ? to + 10 : to - 10
            //@ts-ignore ok
            return new Move(from, to, moving, this.squareList[epSquare], moveType)
        }
        //@ts-ignore ok
        return new Move(from, to, moving, this.squareList[to], moveType)
    }

    setPieces(piecePlacementsString: string) {
        this.#flushLists()
        const rows = piecePlacementsString.split('/').reverse()
        if (rows.length !== 8) {throw new Error('FEN piece placement must include all eight rows')}
        let squareIndex = 21
        let pieceIndex = 0
        for (let row = 8; row > 0; row--) {
            rows[row - 1].split('').forEach((character) => {
                if (/[1-8]/.test(character)) {
                    // Skip Empty Squares
                    squareIndex += parseInt(character)
                } else if (/[rbnqkpRBNQKP]/.test(character)) {
                    // Handle Pieces
                    const color = character.toUpperCase() === character ? Color.White : Color.Black
                    //@ts-ignore - ok because of regex check
                    const pieceType: PieceType = FenPieceTypeMap[character.toLowerCase()]
                    this.#initializePiece(pieceIndex, pieceType, color, squareIndex)
                    pieceIndex++
                    squareIndex++
                }
            })
            squareIndex+=2
        }
    }

    #initializePiece(index: number, type: PieceType, color: Color, square: Square)
    {
        this.pieceTypeList[index] = type << 1 | color //shift to the left one bit and set last bit the same as color
        this.pieceList[index] = square
        this.squareList[square] = index
    }


}

