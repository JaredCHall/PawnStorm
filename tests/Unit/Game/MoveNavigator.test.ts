import {assertEquals} from "@std/assert";
import {assertThrows} from "@std/assert";
import {RecordedMove} from "../../../src/Game/RecordedMove.ts";
import { BitMove } from "src/MoveGen/BitMove.ts";
import {Square} from "../../../src/Board/Square.ts";
import {Piece} from "../../../src/Board/Piece.ts";
import {MoveNavigator} from "../../../src/Game/MoveNavigator.ts";
import { FenNumber } from "../../../src/Notation/FenNumber.ts";
import {PgnSerializer} from "../../../src/Notation/PgnSerializer.ts";
import {Game} from "../../../src/Game/Game.ts";



const navigator = new MoveNavigator('startFen')
const serializer = new PgnSerializer(new Game())

const assertSerializesAs = (expected: string, msg: string = 'Serializes as expected string'): void => {
    assertEquals(serializer.serializeMoves(navigator.getMove(0)), expected, msg)
}


const mockMove = (notation: string, color: number, moveCounter: number): RecordedMove => {

    const piece = color ? Piece.BlackKnight : Piece.WhiteKnight

    const bitMove = new BitMove(Square.e4, Square.e5,piece,0,0)
    return new RecordedMove(
        bitMove,
        new FenNumber('8/8/8/8/8/8/8/8','w','-','-',4,5),
        notation,
        moveCounter
    )
}


const mainLine = [
    mockMove('a1',0,1),
    mockMove('a2',1,1),
    mockMove('a3',0,2),
    mockMove('a4',1,2)
]

// variation starting with white's move
const variation1 = [
    mockMove('b1',0,1),
    mockMove('b2',1,1),
]

// variation starting with black's move
const variation2 = [
    mockMove('c2',1,1),
    mockMove('c3',0,2),
    mockMove('c4',1,2),
]

// nested inside variation 2
const nestedVariation = [
    mockMove('d3',0,2),
]

Deno.test('it creates mainline', () => {
    navigator.addMove(mainLine[0])
    assertEquals(navigator.getLast(), mainLine[0])
    navigator.addMove(mainLine[1])
    assertEquals(navigator.getLast(), mainLine[1])
    navigator.addMove(mainLine[2])
    assertEquals(navigator.getLast(), mainLine[2])
    navigator.addMove(mainLine[3])
    assertEquals(navigator.getLast(), mainLine[3])

    assertEquals(mainLine[0].getPrev(), null)
    assertEquals(mainLine[0].getNext(), mainLine[1])
    assertEquals(mainLine[0].getParent(), null)
    assertEquals(mainLine[0].getChildren(), [])

    assertEquals(mainLine[1].getPrev(), mainLine[0])
    assertEquals(mainLine[1].getNext(), mainLine[2])
    assertEquals(mainLine[1].getParent(), null)
    assertEquals(mainLine[1].getChildren(), [])

    assertEquals(mainLine[2].getPrev(), mainLine[1])
    assertEquals(mainLine[2].getNext(), mainLine[3])
    assertEquals(mainLine[2].getParent(), null)
    assertEquals(mainLine[2].getChildren(), [])

    assertEquals(mainLine[3].getPrev(), mainLine[2])
    assertEquals(mainLine[3].getNext(), null)
    assertEquals(mainLine[3].getParent(), null)
    assertEquals(mainLine[3].getChildren(), [])

    assertSerializesAs('1. a1 a2 2. a3 a4')

})

Deno.test('it creates variations', () => {
    navigator.goto(-1)
    assertEquals(navigator.getLast(), null, 'correctly sets cursor after goto initial position')
    navigator.addMove(variation1[0])
    navigator.addMove(variation1[1])

    navigator.goto(mainLine[0].getId())
    assertEquals(navigator.getLast(), mainLine[0], 'correctly sets cursor after goto')
    navigator.addMove(variation2[0])
    navigator.addMove(variation2[1])
    navigator.addMove(variation2[2])

    navigator.goto(variation2[0].getId())
    assertEquals(navigator.getLast(), variation2[0], 'correctly sets cursor after goto')
    navigator.addMove(nestedVariation[0])

    // children added to mainline moves
    assertEquals(mainLine[0].getChildren(), [variation1[0]], 'first move has variation')
    assertEquals(mainLine[1].getChildren(), [variation2[0]], 'second move has variation')

    // variation 1
    assertEquals(variation1[0].getPrev(), null) // variation on first move of the game, no previous
    assertEquals(variation1[0].getNext(), variation1[1])
    assertEquals(variation1[0].getParent(), mainLine[0])
    assertEquals(variation1[0].getChildren(), [])

    assertEquals(variation1[1].getPrev(), variation1[0])
    assertEquals(variation1[1].getNext(), null)
    assertEquals(variation1[1].getParent(), null)
    assertEquals(variation1[1].getChildren(), [])

    // variation 2
    assertEquals(variation2[0].getPrev(), mainLine[0])
    assertEquals(variation2[0].getNext(), variation2[1])
    assertEquals(variation2[0].getParent(), mainLine[1])
    assertEquals(variation2[0].getChildren(), [])

    assertEquals(variation2[1].getPrev(), variation2[0])
    assertEquals(variation2[1].getNext(), variation2[2])
    assertEquals(variation2[1].getParent(), null)
    assertEquals(variation2[1].getChildren(), [nestedVariation[0]])

    assertEquals(variation2[2].getPrev(), variation2[1])
    assertEquals(variation2[2].getNext(), null)
    assertEquals(variation2[2].getParent(), null)
    assertEquals(variation2[2].getChildren(), [])

    // nested variation
    assertEquals(nestedVariation[0].getPrev(), variation2[0])
    assertEquals(nestedVariation[0].getNext(), null)
    assertEquals(nestedVariation[0].getParent(), variation2[1])
    assertEquals(nestedVariation[0].getChildren(), [])

    assertSerializesAs('1. a1 (1. b1 b2) 1... a2 (1... c2 2. c3 (2. d3) 2... c4) 2. a3 a4')
})

Deno.test('it deletes variations and lines', () => {

    // delete from 2. c3
    navigator.deleteFrom(variation2[1].getId())
    assertEquals(navigator.getLast(), variation2[0], 'sets cursor to previous move when cursor is part of deleted line')
    assertThrows(() => {navigator.getMove(variation2[1].getId())})
    assertThrows(() => {navigator.getMove(variation2[2].getId())})
    assertThrows(() => {navigator.getMove(nestedVariation[0].getId())})

    assertSerializesAs('1. a1 (1. b1 b2) 1... a2 (1... c2) 2. a3 a4')

    navigator.deleteFrom(variation1[0].getId())
    assertEquals(navigator.getLast(), variation2[0], 'leaves cursor as it was when not part of the deleted line')
    assertThrows(() => {navigator.getMove(variation1[0].getId())})
    assertThrows(() => {navigator.getMove(variation1[1].getId())})

    assertSerializesAs('1. a1 a2 (1... c2) 2. a3 a4')

    // deletes everything
    navigator.deleteFrom(0)
    assertEquals(navigator.getLast(), null, 'deletes every move')
    assertThrows(() => {navigator.getMove(0)})

})

