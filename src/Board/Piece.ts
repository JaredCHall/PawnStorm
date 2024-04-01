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

export const FenPieceMap = new Map([
    ['p', Piece.BlackPawn], ['n', Piece.BlackKnight],['b', Piece.BlackBishop],['r', Piece.BlackRook],['q', Piece.BlackQueen],['k', Piece.BlackKing],
    ['P', Piece.WhitePawn], ['N', Piece.WhiteKnight],['B', Piece.WhiteBishop],['R', Piece.WhiteRook],['Q', Piece.WhiteQueen],['K', Piece.WhiteKing],
])