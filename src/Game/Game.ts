import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {Color} from "../Board/Piece.ts";
import {MoveNavigator} from "./MoveNavigator.ts";
import {RecordedMove} from "./RecordedMove.ts";
import {ParserInterface} from "../NotationParser/ParserInterface.ts";
import {AlgebraicNotationParser} from "../NotationParser/AlgebraicNotationParser.ts";
import {CoordinateNotationParser} from "../NotationParser/CoordinateNotationParser.ts";

export class Game {

    private readonly moveFactory = new MoveFactory();

    private readonly mainLine: MoveNavigator

    private notationParser: ParserInterface = new AlgebraicNotationParser(this.moveFactory)

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.setBoard(fen)
        this.mainLine = new MoveNavigator(fen)
    }

    setBoard(fenString: string): void
    {
        this.moveFactory.setFromFenNumber(fenString)
    }

    getFenNotation(): string
    {
        return this.moveFactory.serialize()
    }

    getMainLine(): MoveNavigator
    {
        return this.mainLine
    }

    gotoMove(moveId: number): void
    {
       const move = this.mainLine.getMove(moveId)
       if(!move){
           throw new Error(`Could not find move for move "${moveId}"`)
       }
       this.mainLine.setCursor(moveId)
       this.moveFactory.setFromFenNumber(this.mainLine.getFenBeforeMove(moveId))
    }

    setNotation(type: 'algebraic'|'coordinate') {
        if(type == this.notationParser.getType()){
            return
        }

        switch(type){
            case 'algebraic':
                this.notationParser = new AlgebraicNotationParser(this.moveFactory)
                break
            case 'coordinate':
                this.notationParser = new CoordinateNotationParser(this.moveFactory)
                break
        }
    }

    makeMove(notation: string, newVariation: boolean = false){
        const move = this.notationParser.parse(notation)

        // serialize the notation before the move is made as it is necessary for disambiguation
        // in algebraic notation. We could unmake/make again, but that is not efficient
        const moveCounter = (Math.floor(this.moveFactory.ply / 2) + 1)
        const serialized = this.notationParser.serialize(move)

        this.moveFactory.makeMove(move)

        const recordedMove = new RecordedMove(
            move,
            this.getFenNotation(),
            serialized + this.notationParser.getCheckOrMateIndicator(move),
            moveCounter
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