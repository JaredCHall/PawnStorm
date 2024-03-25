import {Move, MoveType} from "../MoveGen/Move.ts";
import {Square} from "../MoveGen/Board.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";


Deno.test('It creates capture Move object', () => {

    const move = new Move(Square.a1, Square.a2, 5, 7, MoveType.CastleLong)

    console.log(move.bits.toString(2))

    assertEquals(move.getFrom(),Square.a1, 'Extracts FromSquare bits')
    assertEquals(move.getTo(),Square.a2, 'Extracts ToSquare bits')
    assertEquals(move.getMoving(),5, 'Extracts MovingPiece bits')
    assertEquals(move.getCaptured(),7, 'Extracts CapturedPiece bits')
    assertEquals(move.getType(),MoveType.CastleLong, 'Extracts MoveFlag bits')

})

Deno.test('It creates quiet Move object', () => {

    const move = new Move(Square.h4, Square.d2, 5, 0, MoveType.Quiet)

    console.log(move.bits.toString(2))

    assertEquals(move.getFrom(),Square.h4, 'Extracts FromSquare bits')
    assertEquals(move.getTo(),Square.d2, 'Extracts ToSquare bits')
    assertEquals(move.getMoving(),5, 'Extracts MovingPiece bits')
    assertEquals(move.getCaptured(),0, 'Extracts CapturedPiece bits')
    assertEquals(move.getType(),MoveType.Quiet, 'Extracts MoveFlag bits')

})

Deno.test('It creates another move type', () => {

    const move = new Move(Square.g3, Square.d6, 2, 1, MoveType.Capture)

    console.log(move.bits.toString(2))

    assertEquals(move.getFrom(),Square.g3, 'Extracts FromSquare bits')
    assertEquals(move.getTo(),Square.d6, 'Extracts ToSquare bits')
    assertEquals(move.getMoving(),2, 'Extracts MovingPiece bits')
    assertEquals(move.getCaptured(),1, 'Extracts CapturedPiece bits')
    assertEquals(move.getType(),MoveType.Capture, 'Extracts MoveFlag bits')

})