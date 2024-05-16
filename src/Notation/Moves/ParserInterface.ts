import {BitMove} from "../../MoveGen/BitMove.ts";
import {MoveFactory} from "../../MoveGen/MoveFactory.ts";


export type NotationType = 'coordinate'|'algebraic'

export interface ParserInterface {
    moveFactory: MoveFactory
    parse(notation: string): BitMove
    serialize(move: BitMove): string
    getCheckOrMateIndicator(move: BitMove): string
    getType(): NotationType
}