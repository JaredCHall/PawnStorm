
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


export const squareNameMap = {
    'a8': Square.a8, 'b8': Square.b8, 'c8': Square.c8, 'd8': Square.d8, 'e8': Square.e8, 'f8': Square.f8, 'g8': Square.g8, 'h8': Square.h8,
    'a7': Square.a7, 'b7': Square.b7, 'c7': Square.c7, 'd7': Square.d7, 'e7': Square.e7, 'f7': Square.f7, 'g7': Square.g7, 'h7': Square.h7,
    'a6': Square.a6, 'b6': Square.b6, 'c6': Square.c6, 'd6': Square.d6, 'e6': Square.e6, 'f6': Square.f6, 'g6': Square.g6, 'h6': Square.h6,
    'a5': Square.a5, 'b5': Square.b5, 'c5': Square.c5, 'd5': Square.d5, 'e5': Square.e5, 'f5': Square.f5, 'g5': Square.g5, 'h5': Square.h5,
    'a4': Square.a4, 'b4': Square.b4, 'c4': Square.c4, 'd4': Square.d4, 'e4': Square.e4, 'f4': Square.f4, 'g4': Square.g4, 'h4': Square.h4,
    'a3': Square.a3, 'b3': Square.b3, 'c3': Square.c3, 'd3': Square.d3, 'e3': Square.e3, 'f3': Square.f3, 'g3': Square.g3, 'h3': Square.h3,
    'a2': Square.a2, 'b2': Square.b2, 'c2': Square.c2, 'd2': Square.d2, 'e2': Square.e2, 'f2': Square.f2, 'g2': Square.g2, 'h2': Square.h2,
    'a1': Square.a1, 'b1': Square.b1, 'c1': Square.c1, 'd1': Square.d1, 'e1': Square.e1, 'f1': Square.f1, 'g1': Square.g1, 'h1': Square.h1,
}