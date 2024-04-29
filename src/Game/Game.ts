import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove, MoveFlag} from "../MoveGen/BitMove.ts";
import {Color} from "../Board/Piece.ts";

export class Game {

    readonly moveFactory = new MoveFactory();

    protected notation: string = 'algebraic'

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.moveFactory.setFromFenNumber(fen)
    }


    setNotation(type: 'algebraic'|'coordinate')
    {
        this.notation = type
    }

    makeMove(notation: string){
        const move = this.#parseNotation(notation)
        this.moveFactory.makeMove(move)
    }

    #parseNotation(notation: string): BitMove {

        if(this.notation === 'coordinate'){
            const parts = notation.match(/^([a-h][1-8])(\s)?([a-h][1-8])(\s)?(=)?([QBNR])?$/)
            if(parts === null){
                throw new Error(`Invalid Move: "${notation}". Invalid Coordinate Notation.`)
            }

            const fromName = parts[1]
            const from = SquareNameMap.indexByName[parts[1]] ?? null
            if(!from){
                throw new Error(`Invalid Move: "${notation}". Invalid origin square ${fromName}.`)
            }
            const toName = parts[3]
            const to = SquareNameMap.indexByName[toName] ?? null
            if(!to){
                throw new Error(`Invalid Move: "${notation}". Invalid destination square ${toName}.`)
            }

            const promoteType = parts[6] || null
            if(promoteType && ['R','B','N','Q'].indexOf(promoteType) == -1){
                throw new Error(`Invalid Move: "${notation}". Invalid promotion type: "${promoteType}".`)
            }

            const moving = this.moveFactory.squareList[from]
            if(moving == 0){
                throw new Error(`Invalid Move: "${notation}". There is no piece on ${fromName}.`)
            }

            const bitMoves = this.moveFactory.getMovesFromSquare(from, moving)
                .filter((bitMove) => {
                    return bitMove.to == to && bitMove.getPromotesType() === promoteType
                })

            if(bitMoves.length !== 1){
                throw new Error(`Invalid Move: "${notation}". Not a legal move.`)
            }
            return bitMoves[0]
        }else{
            throw new Error('Algebraic Notation not implemented')
        }
    }


    getLegalMoves(colorOrSquare: string)
    {
        let moves: BitMove[]

        if(colorOrSquare === 'white'){
            moves = this.moveFactory.getLegalMoves(Color.White)
        }else if(colorOrSquare === 'black'){
            moves = this.moveFactory.getLegalMoves(Color.Black)
        }else {
            const squareIndex = SquareNameMap.indexByName[colorOrSquare] ?? null
            if(squareIndex === null){
                throw new Error(`Invalid Square: ${colorOrSquare}. Not a real square.`)
            }
            const piece = this.moveFactory.squareList[squareIndex]
            if(piece == 0){
                throw new Error(`Invalid Square: ${colorOrSquare}. There is no piece on the square.`)
            }

            moves = this.moveFactory.getLegalMovesFromSquare(squareIndex, piece)
        }

        return moves.map((move) => new Move(move))
    }

    render(highlights: Square[] = [])
    {
        this.moveFactory.render(highlights)
    }

}