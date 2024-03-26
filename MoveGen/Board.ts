import {Move} from "./Move.ts";
import {binToString, dumpBin} from "../Utils.ts";

export enum Color { // 1 bit
    White= 0,
    Black= 1
}

export enum PieceType { // 6 bits
    Pawn = 1 << 0,
    Knight= 1 << 1,
    Rook = 1 << 2,
    Bishop = 1 << 3,
    Queen = 1 << 4,
    King = 1 << 5
}

export enum Piece { // 7 bits
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

export enum Square { // 7 bits
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
    Empty = 32,
    Invalid = 64
}

export const FenPieceTypeMap = {
    p: PieceType.Pawn,
    n: PieceType.Knight,
    b: PieceType.Bishop,
    r: PieceType.Rook,
    q: PieceType.Queen,
    k: PieceType.King
}

export enum CastlingRight { // 4 bits
    K= 0b0001,
    Q= 0b0010,
    k= 0b0100,
    q= 0b1000
}
export class BoardState {
    sideToMove: Color = Color.White
    castleRights: number = 0b0000
    enPassantTarget: Square|0 = 0
    halfMoveClock: number = 0
}

export class RayDirections {
    static readonly cardinal: number[] = [-10, -1, 1, 10]
    static readonly diagonal: number[] = [9, 11, -9, -11]

    static readonly pieces: Record<PieceType, number[]> = {
        [PieceType.Knight]: [-21, -19,-12, -8, 8, 12, 19, 21],
        [PieceType.Rook]: RayDirections.cardinal,
        [PieceType.Bishop]: RayDirections.diagonal,
        [PieceType.Queen]: RayDirections.cardinal.concat(RayDirections.diagonal),
        [PieceType.King]: RayDirections.cardinal.concat(RayDirections.diagonal),
        [PieceType.Pawn]: []
    }
    static readonly maxLength: Record<PieceType, number> = {
        [PieceType.Knight]: 1,
        [PieceType.Rook]: 7,
        [PieceType.Bishop]: 7,
        [PieceType.Queen]: 7,
        [PieceType.King]: 1,
        [PieceType.Pawn]: 1
    }
    static readonly pawnCaptures = {
        [Color.White]: [-11, -9],
        [Color.Black]: [11, 9],
    }
}

export class Board
{
    state: BoardState = new BoardState()
    ply: number = 0
    attackList: Uint32Array = new Uint32Array(120)   // 32-bit number representing which pieces attack each square
    pieceList: Uint8Array = new Uint8Array(32)      // Square index where piece is located or 0 if captured
    squareList: Uint8Array = new Uint8Array(120)    // 0-31 are piece indexes, 32 is empty square and 64 is out-of-bounds square
    pieceTypeList: Uint8Array = new Uint8Array(32)  // last bit is color, first 6 bits are piece type
    pieceMasks = new Uint32Array(32)    // masks for setting attack list bits for each piece
    positionStack: BoardState[] = []

    constructor() {
        for(let i = 0; i < 32; i++){
            this.pieceMasks[i] = 1
            this.pieceMasks[i] <<= i
        }
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

    generateAttackList(): void
    {
        for(let pieceIndex = 0; pieceIndex < 32; pieceIndex++) {
            const piece: number = this.pieceTypeList[pieceIndex]
            const from: number = this.pieceList[pieceIndex]

            if(from == 0){
                // piece is captured
                continue
            }

            // @ts-ignore it's always a piece type
            const pieceType: PieceType = piece >> 1
            if(pieceType & PieceType.Pawn){
                // @ts-ignore its fine
                const offsets = RayDirections.pawnCaptures[piece & 1]
                for(const i in offsets){
                    const to = from + offsets[i]
                    const capturedIndex: number = this.squareList[to]
                    if(capturedIndex & SquareState.Invalid){
                        continue // square out of bounds
                    }
                    this.attackList[to] |= this.pieceMasks[pieceIndex]
                }
            }else{
                const offsets = RayDirections.pieces[pieceType]
                const maxRayLength = RayDirections.maxLength[pieceType]
                for(let i = 0; i<offsets.length;i++) {
                    const offset = offsets[i]
                    for(let j=1;j<=maxRayLength;j++){
                        const to: number = from + j * offset
                        const capturedIndex = this.squareList[to]
                        if(capturedIndex & SquareState.Invalid){
                            break // square out of bounds
                        }

                        this.attackList[to] |= this.pieceMasks[pieceIndex]
                        if(!(capturedIndex & SquareState.Empty)){
                            // ray is blocked further
                            break
                        }
                    }
                }
            }
        }
    }

    getAttackingPieces(square: Square) {
        let bits = this.attackList[square]
        const pieces = [];
        while (bits !== 0) {
            pieces.push(31 - Math.clz32(bits & -bits)); // Calculate the index of the least significant 'on' bit
            bits &= (bits - 1); // Turn off the least significant 'on' bit
        }
        return pieces;
    }

    #initializePiece(index: number, type: PieceType, color: Color, square: Square) {
        this.pieceTypeList[index] = type << 1 | color //shift to the left one bit and set last bit the same as color
        this.pieceList[index] = square
        this.squareList[square] = index
    }

    #flushLists() {
        for(let i = 0; i < 32; i++) {
            this.pieceList[i] = SquareState.Empty
            this.pieceTypeList[i] = Piece.None
        }

        for(let i = 0; i < 120; i++) {
            this.squareList[i] = SquareState.Invalid
            this.attackList[i] = 0
        }
        let n =0
        for(const i in Square){
            // @ts-ignore ok
            this.squareList[Square[i]] = SquareState.Empty

            n++
        }
    }
}

