import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {Color, FenPieceMap} from "../Board/Piece.ts";
import {MoveNavigator} from "./MoveNavigator.ts";
import {RecordedMove} from "./RecordedMove.ts";
import {ParserInterface} from "../NotationParser/ParserInterface.ts";
import {AlgebraicNotationParser} from "../NotationParser/AlgebraicNotationParser.ts";
import {CoordinateNotationParser} from "../NotationParser/CoordinateNotationParser.ts";
import {GameStatus} from "./GameStatus.ts";
import {FenNumber} from "./FenNumber.ts";
import {RepetitionTracker} from "./RepetitionTracker.ts";

export class Game {

    private gameStatus: GameStatus = new GameStatus();

    private readonly moveFactory = new MoveFactory();

    private readonly moveNavigator: MoveNavigator

    private notationParser: ParserInterface = new AlgebraicNotationParser(this.moveFactory)

    private repetitionTracker: RepetitionTracker = new RepetitionTracker();

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.setBoard(fen)
        this.moveNavigator = new MoveNavigator(fen)
    }

    setBoard(fenString: string): void
    {
        this.moveFactory.setFromFenNumber(fenString)
    }

    getFenNotation(): FenNumber
    {
        return this.moveFactory.getFenNumber()
    }

    getStatus(): GameStatus
    {
        return this.gameStatus
    }

    getMoveNavigator(): MoveNavigator
    {
        return this.moveNavigator
    }

    gotoMove(moveId: number): void {

        if(moveId == -1){
            this.moveNavigator.setCursor(moveId)
            this.moveFactory.setFromFenNumber(this.moveNavigator.startFen)
            this.repetitionTracker.buildFromMove(null)
            return
        }

        const move = this.moveNavigator.getMove(moveId)
        this.moveNavigator.setCursor(moveId)
        this.repetitionTracker.buildFromMove(move)
        this.moveFactory.setFromFenNumber(move.fen.serialize())
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

    makeMove(notation: string): RecordedMove{

        if(this.gameStatus.terminationType != 'unterminated'){
            throw new Error('Cannot make move. Game is already terminated.')
        }

        const move = this.notationParser.parse(notation)

        // serialize the notation before the move is made as it is necessary for disambiguation
        // in algebraic notation. We could unmake/make again, but that is less efficient
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
        this.repetitionTracker.addMove(recordedMove)
        this.#updateGameTermination(recordedMove)

        return recordedMove
    }

    getSquares(): (string|null)[]
    {
        const squares: (string|null)[] = []
        for(let i=0;i<64;i++){
            const piece = this.moveFactory.squareList[this.moveFactory.square64Indexes[i]]
            if(piece != 0){
                squares[i] = null
            }else{
                squares[i] = FenPieceMap.fenByBitType[piece]
            }
        }
        return squares
    }

    getPieces(color: string|null = null): (string)[] {
        //@ts-ignore - filter removes null values
        return this.getSquares().filter((piece) => {
            if(!piece){
                return false
            }
            return !color || color == (piece.toUpperCase() == piece ? 'white' : 'black')
        })
    }

    setDrawByAgreement(): void {
        this.gameStatus = new GameStatus('normal', null, 'agreement')
    }

    setResigns(color: 'white'|'black'): void {
        const winner = color == 'white' ? 'black' : 'white'

        this.gameStatus = new GameStatus('normal', winner, null)
    }

    // determine if last move resulted in end of game
    #updateGameTermination(move: RecordedMove): void
    {
        // checkmate
        if(move.bitMove.isMate){
            this.gameStatus = new GameStatus('normal', move.color)
            return
        }
        // stalemates
        if(this.getCandidateMoves(this.getSideToMove()).length == 0){
            this.gameStatus = new GameStatus('normal', null, 'stalemate')
            return
        }

        if(!this.moveFactory.hasSufficientMaterialForMate()){
            this.gameStatus = new GameStatus('normal', null, 'insufficient-material')
            return
        }
        if(this.moveFactory.state.halfMoveClock >= 50){
            this.gameStatus = new GameStatus('normal', null, 'fifty-move-rule')
            return
        }
        if(this.repetitionTracker.repetitionCount > 2){
            this.gameStatus = new GameStatus('normal', null, 'three-fold-repetition')
        }

    }


    undoMove(): void
    {
        const recordedMove = this.moveNavigator.getLast()
        if(!recordedMove){
            throw new Error('Cannot undo last move. No moves have been played.')
        }

        this.moveFactory.unmakeMove(recordedMove.bitMove)
        this.moveNavigator.deleteFrom(recordedMove.getId())
    }

    getSideToMove(): string {
        return this.moveFactory.state.sideToMove ? 'black' : 'white'
    }

    getCandidateMoves(colorOrSquare: string) {
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