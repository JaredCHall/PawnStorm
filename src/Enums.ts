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
    Invalid = 255
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

export const pieceRenderMap: Record<PieceType, string> = {
    [PieceType.Pawn]: '♟',
    [PieceType.Knight]: '♞',
    [PieceType.Bishop]: '♝',
    [PieceType.Rook]: '♜',
    [PieceType.Queen]: '♛',
    [PieceType.King]: '♚',
    [PieceType.BPawn]: '♟',
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