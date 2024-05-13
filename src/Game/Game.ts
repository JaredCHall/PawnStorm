import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {CandidateMove} from "./CandidateMove.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {Color} from "../Board/Piece.ts";
import {MoveNavigator} from "./MoveNavigator.ts";
import {RecordedMove} from "./RecordedMove.ts";
import {ParserInterface} from "../NotationParser/ParserInterface.ts";
import {AlgebraicNotationParser} from "../NotationParser/AlgebraicNotationParser.ts";
import {CoordinateNotationParser} from "../NotationParser/CoordinateNotationParser.ts";

export class Game {

    private readonly moveFactory = new MoveFactory();

    private readonly moveNavigator: MoveNavigator

    private notationParser: ParserInterface = new AlgebraicNotationParser(this.moveFactory)

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.setBoard(fen)
        this.moveNavigator = new MoveNavigator(fen)
    }

    setBoard(fenString: string): void
    {
        this.moveFactory.setFromFenNumber(fenString)
    }

    getFenNotation(): string
    {
        return this.moveFactory.serialize()
    }

    getMoveNavigator(): MoveNavigator
    {
        return this.moveNavigator
    }

    gotoMove(moveId: number): void {

        if(moveId == -1){
            this.moveNavigator.setCursor(moveId)
            this.moveFactory.setFromFenNumber(this.moveNavigator.startFen)
            return
        }

        const move = this.moveNavigator.getMove(moveId)
        if(!move){
            throw new Error(`Could not find move for move "${moveId}"`)
        }
        this.moveNavigator.setCursor(moveId)
        this.moveFactory.setFromFenNumber(move.fen)
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

    makeMove(notation: string){
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
        this.moveNavigator.addMove(recordedMove)
    }

    undoMove(): void
    {
        const recordedMove = this.moveNavigator.getLast()
        if(!recordedMove){
            throw new Error('Cannot undo last move. No moves have been played.')
        }

        this.moveFactory.unmakeMove(recordedMove.move)
        this.moveNavigator.deleteFrom(recordedMove.getId())
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

        return moves.map((move) => new CandidateMove(move))
    }

    render(highlights: Square[] = [])
    {
        this.moveFactory.render(highlights)
    }

}