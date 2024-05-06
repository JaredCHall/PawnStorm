import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {Color} from "../Board/Piece.ts";
import {NotationParser} from "../MoveGen/NotationParser.ts";

export class Game {

    readonly moveFactory = new MoveFactory();

    readonly notationParser = new NotationParser(this.moveFactory)

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.moveFactory.setFromFenNumber(fen)
    }

    setNotation(type: 'algebraic'|'coordinate') {
        this.notationParser.setNotationType(type)
    }

    makeMove(notation: string){
        const move = this.notationParser.parse(notation)
        this.moveFactory.makeMove(move)
    }

    getSideToMove(): string {
        return this.moveFactory.state.sideToMove ? 'black' : 'white'
    }

    getLegalMoves(colorOrSquare: string) {
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