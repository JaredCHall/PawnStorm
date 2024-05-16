import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {BitMove, MoveType} from "../../src/MoveGen/BitMove.ts";
import {Square} from "../../src/Board/Square.ts";
import {Piece} from "../../src/Board/Piece.ts";
import {MoveFactory} from "../../src/MoveGen/MoveFactory.ts";
import {CoordinateNotationParser} from "../../src/Notation/Moves/CoordinateNotationParser.ts";
import {assertThrows} from "https://deno.land/std@0.219.0/assert/assert_throws.ts";

const getParser = (fen: string): CoordinateNotationParser => {
    const factory = new MoveFactory()
    factory.setFromFenNumber(fen)
    return new CoordinateNotationParser(factory)
}


Deno.test('it parses notation', () => {
    const parser = getParser('2bq1b1r/1Pp2Qpp/3k4/3Bp3/3n4/2N5/P1PP1PPP/R1B1K2R w KQ - 3 11')

    assertEquals(parser.getType(), 'coordinate')

    // quiet move
    let move = parser.parse('c3e4')
    assertEquals(move, new BitMove(Square.c3,Square.e4, Piece.WhiteKnight, 0,0))

    // capture
    move = parser.parse('f7f8')
    assertEquals(move, new BitMove(Square.f7,Square.f8, Piece.WhiteQueen, Piece.BlackBishop,MoveType.Capture))

    // castles
    move = parser.parse('e1g1')
    assertEquals(move, new BitMove(Square.e1,Square.g1, Piece.WhiteKing, 0,MoveType.CastleShort))

    // pawn promotion
    move = parser.parse('b7b8=B')
    assertEquals(move, new BitMove(Square.b7,Square.b8, Piece.WhitePawn, 0,MoveType.BishopPromote))
    move = parser.parse('b7b8Q')
    assertEquals(move, new BitMove(Square.b7,Square.b8, Piece.WhitePawn, 0,MoveType.QueenPromote))

})


Deno.test('it handles invalid moves', () => {
    const parser = getParser('2bq1b1r/1Pp2Qpp/3k4/3Bp3/3n4/2N5/P1PP1PPP/R1B1K2R w KQ - 3 11')


    // Does not allow gibberish
    assertThrows(
        () => {parser.parse('Kings pawn to Bishop Five')},
        Error,
        '"Kings pawn to Bishop Five" is not valid coordinate notation.',
    )

    // Does not allow algebraic notation
    assertThrows(
        () => {parser.parse('Ne4')},
        Error,
        '"Ne4" is not valid coordinate notation.',
    )

    // errors if no piece on square
    assertThrows(
        () => {parser.parse('a8b7')},
        Error,
        '"a8b7" is not possible. There is no piece on the a8 square.',
    )

    // does not allow illegal king move
    assertThrows(
        () => {parser.parse('e1c6')},
        Error,
        '"e1c6" is not a legal move.',
    )

    // invalid pawn promotion
    assertThrows(
        () => {parser.parse('b7b8K')},
        Error,
        '"b7b8K" is not valid coordinate notation.',
    )

})

Deno.test("it serializes moves", () => {
    const parser = getParser('2bq1b1r/1Pp2Qpp/3k4/3Bp3/3n4/2N5/P1PP1PPP/R1B1K2R w KQ - 3 11')
    // quiet move
    assertEquals(parser.serialize(new BitMove(Square.c3,Square.e4, Piece.WhiteKnight, 0,0)), 'c3e4')
    // capture
    assertEquals(parser.serialize(new BitMove(Square.f7,Square.f8, Piece.WhiteQueen, Piece.BlackBishop,MoveType.Capture)), 'f7f8')
    // castles
    assertEquals(parser.serialize(new BitMove(Square.e1,Square.g1, Piece.WhiteKing, 0,MoveType.CastleShort)), 'e1g1')
    // pawn promotion
    assertEquals(parser.serialize(new BitMove(Square.b7,Square.b8, Piece.WhitePawn, 0,MoveType.BishopPromote)), 'b7b8B')
    assertEquals(parser.serialize(new BitMove(Square.b7,Square.b8, Piece.WhitePawn, 0,MoveType.QueenPromote)), 'b7b8Q')

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