import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {BitMove, MoveType} from "../../../src/MoveGen/BitMove.ts";
import {Square} from "../../../src/Board/Square.ts";
import {Piece} from "../../../src/Board/Piece.ts";
import {MoveFactory} from "../../../src/MoveGen/MoveFactory.ts";
import {assertThrows} from "https://deno.land/std@0.219.0/assert/assert_throws.ts";
import {AlgebraicNotationParser} from "../../../src/Notation/Moves/AlgebraicNotationParser.ts";

const getParser = (fen: string): AlgebraicNotationParser => {
    const factory = new MoveFactory()
    factory.setFromFenNumber(fen)
    return new AlgebraicNotationParser(factory)
}


Deno.test('it parses notation', () => {
    const parser = getParser('2bq1b1r/1Pp2Qpp/3k4/3Bp3/3n4/2N1P3/P1P2PPP/R1B1K2R w KQ - 3 11')
    let move

    // pawn move
    move = parser.parse('a4')
    assertEquals(move, new BitMove(Square.a2,Square.a4, Piece.WhitePawn, 0,MoveType.DoublePawnPush))

    // pawn capture
    move = parser.parse('exd4')
    assertEquals(move, new BitMove(Square.e3,Square.d4, Piece.WhitePawn, Piece.BlackKnight,MoveType.Capture))

    // pawn capture no 'x'
    move = parser.parse('ed4')
    assertEquals(move, new BitMove(Square.e3,Square.d4, Piece.WhitePawn, Piece.BlackKnight,MoveType.Capture))

    // pawn capture no 'x' or file disambiguation
    move = parser.parse('d4')
    assertEquals(move, new BitMove(Square.e3,Square.d4, Piece.WhitePawn, Piece.BlackKnight,MoveType.Capture))

    // quiet move
    move = parser.parse('Ne4')
    assertEquals(move, new BitMove(Square.c3,Square.e4, Piece.WhiteKnight, 0,0))

    // capture
    move = parser.parse('Qxf8')
    assertEquals(move, new BitMove(Square.f7,Square.f8, Piece.WhiteQueen, Piece.BlackBishop,MoveType.Capture))
    move = parser.parse('Qf8')
    assertEquals(move, new BitMove(Square.f7,Square.f8, Piece.WhiteQueen, Piece.BlackBishop,MoveType.Capture))

    // castles
    move = parser.parse('O-O')
    assertEquals(move, new BitMove(Square.e1,Square.g1, Piece.WhiteKing, 0,MoveType.CastleShort))

    // pawn promotion
    move = parser.parse('b8=B')
    assertEquals(move, new BitMove(Square.b7,Square.b8, Piece.WhitePawn, 0,MoveType.BishopPromote))
    move = parser.parse('b8Q')
    assertEquals(move, new BitMove(Square.b7,Square.b8, Piece.WhitePawn, 0,MoveType.QueenPromote))
})


Deno.test('it handles invalid moves', () => {
    const parser = getParser('2bq1b1r/1Pp2Qpp/3k4/3Bp3/3n4/2N5/P1PP1PPP/R1B1K2R w KQ - 3 11')
    // Does not allow gibberish
    assertThrows(
        () => {parser.parse('Kings pawn to Queens Bishop Five')},
        Error, '"Kings pawn to Queens Bishop Five" is not valid algebraic notation.',
    )
    // does not allow illegal king move
    assertThrows(
        () => {parser.parse('Kc6')},
        Error, '"Kc6" is not a legal move.',
    )
    // invalid pawn promotion
    assertThrows(
        () => {parser.parse('b7b8K')},
        Error, '"b7b8K" is not valid algebraic notation.'
    )
})

Deno.test('it handles ambiguous moves', () => {
    let parser: AlgebraicNotationParser
    let move



    parser = getParser('R7/8/6N1/2B1B3/8/8/4N1N1/R7 w - - 0 1')
    // errors when knight move is ambiguous
    assertThrows(
        () => {parser.parse('Ra5')},
        Error,'"Ra5" is ambiguous.',
    )
    assertThrows(
        () => {parser.parse('Raa5')}, // both rooks are on a-file so this is still ambiguous
        Error,'"Raa5" is ambiguous.',
    )
    // correct rook move
    move = parser.parse('R1a5')
    assertEquals(move, new BitMove(Square.a1,Square.a5, Piece.WhiteRook, 0,0))

    // errors when bishop move is ambiguous
    assertThrows(
        () => {parser.parse('Bd4')},
        Error,'"Bd4" is ambiguous.',
    )
    assertThrows(
        () => {parser.parse('B5d4')}, // both bishops are on 4th rank so this is still ambiguous
        Error,'"B5d4" is ambiguous.',
    )
    // correct bishop move
    move = parser.parse('Bed4')
    assertEquals(move, new BitMove(Square.e5,Square.d4, Piece.WhiteBishop, 0,0))

    // errors when knight move is ambiguous
    assertThrows(
        () => {parser.parse('Nf4')},
        Error,'"Nf4" is ambiguous.',
    )
    assertThrows(
        () => {parser.parse('N2f4')}, // two knights are on 2nd rank so this is still ambiguous
        Error,'"N2f4" is ambiguous.',
    )
    assertThrows(
        () => {parser.parse('Ngf4')}, // two knights are on g file so this is still ambiguous
        Error,'"Ngf4" is ambiguous.',
    )
    // correct knight move
    move = parser.parse('Ng2f4')
    assertEquals(move, new BitMove(Square.g2,Square.f4, Piece.WhiteKnight, 0,0))

    // edge-case revealed in testing
    parser  = getParser('r2qrbk1/1pp2ppp/2n5/p2bp3/Q7/P2PBNP1/1PR1PPBP/R5K1 w - - 5 15')
    move = parser.parse('Rac1')
    assertEquals(move, new BitMove(Square.a1,Square.c1, Piece.WhiteRook, 0,0))

})


Deno.test("it serializes moves", () => {
    const parser = getParser('2bq1b1r/1Pp2Qpp/3k4/3Bp3/3n4/2N1P3/P1P2PPP/R3K2R w KQ - 3 11')

    // pawn move
    assertEquals(parser.serialize(new BitMove(Square.a2,Square.a4, Piece.WhitePawn, 0,MoveType.DoublePawnPush)), 'a4')
    // pawn capture
    assertEquals(parser.serialize(new BitMove(Square.e3,Square.d4, Piece.WhitePawn, Piece.BlackKnight,MoveType.Capture)), 'exd4')
    // quiet move
    assertEquals(parser.serialize(new BitMove(Square.c3,Square.e4, Piece.WhiteKnight, 0,0)), 'Ne4')
    // capture
    assertEquals(parser.serialize(new BitMove(Square.f7,Square.f8, Piece.WhiteQueen, Piece.BlackBishop,MoveType.Capture)), 'Qxf8')
    // castles short
    assertEquals(parser.serialize(new BitMove(Square.e1,Square.g1, Piece.WhiteKing, 0,MoveType.CastleShort)), 'O-O')
    // castles long
    assertEquals(parser.serialize(new BitMove(Square.e1,Square.c1, Piece.WhiteKing, 0,MoveType.CastleLong)), 'O-O-O')
    // pawn promotion
    assertEquals(parser.serialize(new BitMove(Square.b7,Square.b8, Piece.WhitePawn, 0,MoveType.BishopPromote)), 'b8=B')
    assertEquals(parser.serialize(new BitMove(Square.b7,Square.c8, Piece.WhitePawn, Piece.BlackBishop, MoveType.QueenPromote)), 'bxc8=Q')

})

Deno.test('it serializes ambiguous moves', () => {
    const parser = getParser('R1N5/8/6N1/2B1B3/8/2n5/1P2N1N1/R7 w - - 0 1')
    assertEquals(parser.serialize(new BitMove(Square.a1,Square.a5, Piece.WhiteRook, 0,0)),'R1a5')
    assertEquals(parser.serialize(new BitMove(Square.e5,Square.d4, Piece.WhiteBishop, 0,0)),'Bed4')
    assertEquals(parser.serialize(new BitMove(Square.g2,Square.f4, Piece.WhiteKnight, 0,0)),'Ng2f4')
    assertEquals(parser.serialize(new BitMove(Square.b2,Square.b3, Piece.WhitePawn, 0,0)),'b3')
    assertEquals(parser.serialize(new BitMove(Square.b2,Square.c3, Piece.WhitePawn, Piece.BlackKnight,0)),'bxc3')
    // knights can require disambiguation even when they are not on the same rank or file
    assertEquals(parser.serialize(new BitMove(Square.c8,Square.e7, Piece.WhiteKnight, 0,0)),'Nce7')

})

Deno.test('it gets check and mate indicators', () => {

    const parser = getParser('2bq1b1r/1Pp2Qpp/3k4/3Bp3/3n4/2N5/P1PP1PPP/R1B1K2R w KQ - 3 11')

    // check and mate
    const move = new BitMove(Square.c3,Square.e4, Piece.WhiteKnight, 0)
    move.isCheck = true
    assertEquals(parser.getCheckOrMateIndicator(move), '+')
    move.isMate = true
    assertEquals(parser.getCheckOrMateIndicator(move), '#')
    move.isCheck = false
    assertEquals(parser.getCheckOrMateIndicator(move), '')
})