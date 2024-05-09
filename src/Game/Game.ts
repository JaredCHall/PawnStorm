import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {Color} from "../Board/Piece.ts";
import {NotationParser} from "../MoveGen/NotationParser.ts";
import {MainLine} from "./MainLine.ts";
import {RecordedMove} from "./RecordedMove.ts";

export class Game {

    private readonly moveFactory = new MoveFactory();

    private mainLine: MainLine = new MainLine()

    private readonly notationParser = new NotationParser(this.moveFactory)

    constructor(fen: string|null = null) {
        this.setBoard(fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    }

    setBoard(fenString: string): void
    {
        this.moveFactory.setFromFenNumber(fenString)
        this.mainLine = new MainLine()
    }

    getFenNotation(): string
    {
        return this.moveFactory.serialize()
    }

    getMainLine(): MainLine
    {
        return this.mainLine
    }

    setNotation(type: 'algebraic'|'coordinate') {
        this.notationParser.setNotationType(type)
    }

    makeMove(notation: string, newVariation: boolean = false){
        const move = this.notationParser.parse(notation)
        this.moveFactory.makeMove(move)

        const recordedMove = new RecordedMove(
            move,
            this.getFenNotation(),
            this.notationParser.serializeMove(move)
        )
        this.mainLine.addMove(recordedMove, newVariation)
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