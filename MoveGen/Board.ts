import {Move, MoveFlag, MoveType} from "./Move.ts";

export enum Color { // 1 bit
    White= 0,
    Black= 1
}

export enum PieceType { // 7 bits
    Pawn = 1 << 0,
    Knight= 1 << 1,
    Rook = 1 << 2,
    Bishop = 1 << 3,
    Queen = 1 << 4,
    King = 1 << 5,
    BPawn = 1 << 6
}

export enum PieceIndex {
    None = 32
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

export const SquareIndexes = [
    21, 22, 23, 24, 25, 26, 27, 28, 
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
    51, 52, 53, 54, 55, 56, 57, 58,
    61, 62, 63, 64, 65, 66, 67, 68,
    71, 72, 73, 74, 75, 76, 77, 78,
    81, 82, 83, 84, 85, 86, 87, 88,
    91, 92, 93, 94, 95, 96, 97, 98,
]

export enum SquareState {
    Empty = 32,
    Invalid = 64
}

export const FenPieceMap = {
    p: Piece.BlackPawn,
    n: Piece.BlackKnight,
    b: Piece.BlackBishop,
    r: Piece.BlackRook,
    q: Piece.BlackQueen,
    k: Piece.BlackKing,
    P: Piece.WhitePawn,
    N: Piece.WhiteKnight,
    B: Piece.WhiteBishop,
    R: Piece.WhiteRook,
    Q: Piece.WhiteQueen,
    K: Piece.WhiteKing,
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

export class SquareInfo {
    static getRow(index: number) {
        return Math.floor((index - 20) / -10) + 8
    }
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
        [PieceType.Pawn]: [-11 , -9],
        [PieceType.BPawn]: [11, 9],
    }
    static readonly maxLength: Record<PieceType, number> = {
        [PieceType.Knight]: 1,
        [PieceType.Rook]: 7,
        [PieceType.Bishop]: 7,
        [PieceType.Queen]: 7,
        [PieceType.King]: 1,
        [PieceType.Pawn]: 1,
        [PieceType.BPawn]: 1,
    }
    static readonly pawnPushes = {
        [PieceType.Pawn]: [-10, -20],
        [PieceType.BPawn]: [10, 20],
    }
}

export class Board
{
    state: BoardState = new BoardState()
    ply: number = 0
    attackList: Uint32Array = new Uint32Array(120)   // 32-bit number representing which pieces attack each square
    pieceList: Uint8Array = new Uint8Array(32)      // Square index where piece is located or 0 if captured
    squareList: Uint8Array = new Uint8Array(120)    // 0-31 are piece indexes, 32 is empty square and 64 is out-of-bounds square
    pieceTypeList: Uint8Array = new Uint8Array(32)  // last bit is color, first 7 bits are piece type
    pieceMasks = new Uint32Array(32)    // masks for setting attack list bits for each piece
    sideMasks = new Uint32Array(2)
    positionStack: BoardState[] = []

    squareIndexList: Uint8Array =  new Uint8Array(64)

    constructor() {
        for(let i = 0; i < 32; i++){
            this.pieceMasks[i] = 1
            this.pieceMasks[i] <<= i
        }
        for(let i = 0; i < 64; i++){
            // hoping the typed array is faster
            this.squareIndexList[i] = SquareIndexes[i]
        }
        this.sideMasks[Color.White] = 0b11111111111111110000000000000000
        this.sideMasks[Color.Black] = 0b00000000000000001111111111111111
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
                    // @ts-ignore safe because of regex
                    const piece = FenPieceMap[character]
                    this.pieceTypeList[pieceIndex] = piece
                    this.pieceList[pieceIndex] = squareIndex
                    this.squareList[squareIndex] = pieceIndex
                    pieceIndex++
                    squareIndex++
                }
            })
            squareIndex+=2
        }
    }

    generateMoves(sideToMove: Color): Move[]
    {
        const moves: Move[] = []
        for(let i = 0; i < 64; i ++) {

            const to: Square = this.squareIndexList[i]
            const capturedIndex = this.squareList[to]
            const moveType = capturedIndex & SquareState.Empty ? MoveType.Quiet : MoveType.Capture
            const occupyingPiece = this.pieceTypeList[capturedIndex] ?? 0
            const occupyingPieceColor = occupyingPiece & 1

            this.getAttackingPieces(to, sideToMove).forEach((movingIndex: number) => {
                const moving = this.pieceTypeList[movingIndex]
                const from = this.pieceList[movingIndex]

                // Do not allow capturing own piece
                if(moveType == MoveType.Capture && (moving & 1) == occupyingPieceColor){
                    return
                }

                if(moving & PieceType.Pawn << 1 || moving & PieceType.BPawn << 1){
                    if(this.state.enPassantTarget == to){
                        // @ts-ignore just try it
                        const enPassantCapture = this.squareList[to + RayDirections.pawnPushes[moving >> 1][0]]
                        moves.push(new Move(from, to, movingIndex, enPassantCapture, MoveType.EnPassant))
                        return
                    }

                    if(moveType == MoveType.Quiet){
                        // pawns cannot capture diagonally if there is no piece there
                        return
                    }

                    // handle promote + capture
                    if((sideToMove == Color.White && SquareInfo.getRow(to) == 8)
                            || (sideToMove == Color.Black && SquareInfo.getRow(to) == 1)){
                        moves.push(new Move(from, to, movingIndex, capturedIndex, MoveType.KnightPromote | MoveFlag.Capture))
                        moves.push(new Move(from, to, movingIndex, capturedIndex, MoveType.BishopPromote | MoveFlag.Capture))
                        moves.push(new Move(from, to, movingIndex, capturedIndex, MoveType.RookPromote | MoveFlag.Capture))
                        moves.push(new Move(from, to, movingIndex, capturedIndex, MoveType.QueenPromote | MoveFlag.Capture))
                    }

                }
                moves.push(new Move(this.pieceList[movingIndex], to, movingIndex, capturedIndex, moveType))
            })
        }

        //TODO: Add pawn pushes
        //TODO: Add castling moves

        return moves
    }



    generateAttacksForPiece(pieceIndex: number): void
    {
        const piece: number = this.pieceTypeList[pieceIndex]
        const from: number = this.pieceList[pieceIndex]
        const pieceType: PieceType = piece >> 1

        // piece is captured
        if(from == 0){return}
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

    generateAttackList(): void
    {
        for(let pieceIndex = 0; pieceIndex < 32; pieceIndex++) {
            this.generateAttacksForPiece(pieceIndex)
        }
    }

    getAttackingPieces(square: number, sideToMove: Color) {
        let bits = this.attackList[square] & this.sideMasks[sideToMove]

        if(bits == 0){
            return []
        }

        const pieces = [];
        while (bits !== 0) {
            pieces.push(31 - Math.clz32(bits & -bits)); // Calculate the index of the least significant 'on' bit
            bits &= (bits - 1); // Turn off the least significant 'on' bit
        }
        return pieces;
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

