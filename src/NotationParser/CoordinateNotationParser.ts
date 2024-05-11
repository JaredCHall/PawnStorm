import {NotationType, ParserInterface} from "./ParserInterface.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {SquareNameMap} from "../Board/Square.ts";
import {MoveFactory} from "../MoveGen/MoveFactory.ts";

export class CoordinateNotationParser implements ParserInterface{


    constructor(public moveFactory: MoveFactory) {}

    getType(): NotationType {
        return 'coordinate'
    }

    parse(notation: string): BitMove {
        const parts = notation.match(/^([a-h][1-8])(\s)?([a-h][1-8])(\s)?(=)?([QBNR])?$/)
        if(parts === null){
            throw new Error(`"${notation}" is not valid coordinate notation.`)
        }

        const fromName = parts[1]
        const from = SquareNameMap.indexByName[parts[1]]

        const toName = parts[3]
        const to = SquareNameMap.indexByName[toName]

        const promoteType = parts[6] || null
        const moving = this.moveFactory.squareList[from]
        if(moving == 0){
            throw new Error(`"${notation}" is not possible. There is no piece on the ${fromName} square.`)
        }

        const bitMoves = this.moveFactory.getMovesFromSquare(from, moving)
            .filter((bitMove) => {
                return bitMove.to == to && bitMove.getPromotesType() === promoteType
            })

        if(bitMoves.length !== 1){
            throw new Error(`"${notation}" is not a legal move.`)
        }
        return bitMoves[0]
    }

    serialize(move: BitMove): string {
        let notation = SquareNameMap.nameByIndex[move.from] + SquareNameMap.nameByIndex[move.to]
        if(move.getPromotesType() !== null){
            notation += move.getPromotesType()
        }
        return notation
    }

    getCheckOrMateIndicator(move: BitMove): string {
        if(!move.isCheck){
            return ''
        }
        return move.isMate ? '#' : '+'
    }
}