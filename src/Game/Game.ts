import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {Color, FenPieceMap} from "../Board/Piece.ts";
import {MoveNavigator} from "./MoveNavigator.ts";
import {RecordedMove} from "./RecordedMove.ts";
import {AlgebraicNotationParser} from "../Notation/Moves/AlgebraicNotationParser.ts";
import {CoordinateNotationParser} from "../Notation/Moves/CoordinateNotationParser.ts";
import {GameStatus} from "./GameStatus.ts";
import {FenNumber} from "../Notation/FenNumber.ts";
import {RepetitionTracker} from "./RepetitionTracker.ts";
import {PgnTagFormatter} from "../Notation/PgnTagFormatter.ts";
import {PgnParser} from "../Notation/PgnParser.ts";
import {Board} from "../Board/Board.ts";
import {GameOverError} from "./Error/GameOverError.ts";
import { Timer } from "src/Game/Timer/Timer.ts";
import {DelayTimer} from "./Timer/DelayTimer.ts";
import {IncrementTimer} from "./Timer/IncrementTimer.ts";
import {ClockTime} from "./Timer/ClockTime.ts";

export class Game {

    private tags: {[key: string]: string} = {
        Event: 'Casual Game',
        Site: '?',
        Round: '1',
        White: '?',
        Black: '?',
    }

    private gameStatus: GameStatus = new GameStatus();

    private readonly moveFactory = new MoveFactory();

    private moveNavigator: MoveNavigator

    private coordinateParser: CoordinateNotationParser = new CoordinateNotationParser(this.moveFactory)

    private algebraicNotationParser: AlgebraicNotationParser = new AlgebraicNotationParser(this.moveFactory)

    private repetitionTracker: RepetitionTracker = new RepetitionTracker();

    private clocks: {white: null|Timer, black: null|Timer} = {
        'white': null,
        'black': null,
    }

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.setBoard(fen)
        this.moveNavigator = new MoveNavigator(fen)
    }

    static load(pgnFileContent: string): Game
    {
        return new PgnParser().parse(pgnFileContent)
    }

    setTimeLimit(
        timeLimit: number,
        increment: number|null = null,
        delay: number|null = null,
    ): void {

        if(increment != null && delay != null){
            throw new Error("May only set increment or delay, not both.")
        }

        if(delay != null) {
            this.clocks.white = new DelayTimer(timeLimit, delay)
            this.clocks.black = new DelayTimer(timeLimit, delay)
        }else if(increment != null){
            this.clocks.white = new IncrementTimer(timeLimit, increment)
            this.clocks.black = new IncrementTimer(timeLimit, increment)
        }else{
            this.clocks.white = new Timer(timeLimit)
            this.clocks.black = new Timer(timeLimit)
        }
    }

    setBoard(fenString: string): void {
        this.moveFactory.setFromFenNumber(fenString)
        this.moveNavigator = new MoveNavigator(fenString)
    }

    getBoard(): Board
    {
        return this.moveFactory
    }

    getFenNotation(): FenNumber {
        return this.moveFactory.getFenNumber()
    }

    getStatus(): GameStatus {
        return this.gameStatus
    }

    getMoveNavigator(): MoveNavigator {
        return this.moveNavigator
    }

    gotoMove(moveId: number): void {

        if(moveId == -1){
            this.moveNavigator.goto(-1)
            this.moveFactory.setFromFenNumber(this.moveNavigator.startFen)
            this.repetitionTracker.buildFromMove(null)
            return
        }

        const move = this.moveNavigator.getMove(moveId)
        this.moveNavigator.goto(moveId)
        this.repetitionTracker.buildFromMove(move)
        this.moveFactory.setFromFenNumber(move.fen.serialize())
    }

    makeMove(notation: string, notationType: 'coordinate'|'algebraic' = 'algebraic'): RecordedMove {

        if(this.gameStatus.terminationType != 'unterminated'){
            throw new GameOverError('Cannot make move. Game is already terminated.')
        }

        const parser = notationType == 'algebraic' ? this.algebraicNotationParser : this.coordinateParser
        const move = parser.parse(notation)

        // serialize the notation before the move is made as it is necessary for disambiguation
        // in algebraic notation. We could unmake/make again, but that is less efficient
        const moveCounter = (Math.floor(this.moveFactory.ply / 2) + 1)
        const serialized = this.algebraicNotationParser.serialize(move)

        // game officially starts on first move
        if(moveCounter == 1 && this.getSideToMove() == 'white'){
            if(!this.getTag('Date')){
                this.setTag('Date', PgnTagFormatter.formatDate(new Date()))
            }
        }

        this.moveFactory.makeMove(move)
        this.#toggleClocks()

        const recordedMove = new RecordedMove(
            move,
            this.getFenNotation(),
            serialized + this.algebraicNotationParser.getCheckOrMateIndicator(move),
            moveCounter,
            this.getClockTime(this.getLastSideToMove())
        )
        this.moveNavigator.addMove(recordedMove)
        this.repetitionTracker.addMove(recordedMove)
        this.#terminateIfMatedOrStalemated(recordedMove)
        this.setTag('Result', PgnTagFormatter.formatResult(this.gameStatus))

        return recordedMove
    }

    getClockTime(color: 'white'|'black'): string|null
    {
        const timer = this.clocks[color] ?? null
        if(!timer){
            return null
        }

        return new ClockTime(timer.timeRemaining).getTimeString()
    }

    startClock(): void
    {
        this.clocks[this.getSideToMove()]?.start()
    }

    #toggleClocks(): void {
        this.clocks[this.getLastSideToMove()]?.stop()
        this.clocks[this.getSideToMove()]?.start()
    }

    #stopClocks(): void
    {
        this.clocks.white?.stop()
        this.clocks.black?.stop()
    }

    setTag(tagName: string, tagValue: string): void {
        this.tags[tagName] = tagValue
    }

    getTag(tagName: string): string|null {
        return this.tags[tagName] ?? null
    }

    allTags(): {[key: string]: string} {
        return this.tags
    }

    getSquares(): (string|null)[] {
        const squares: (string|null)[] = []
        for(let i=0;i<64;i++){
            const piece = this.moveFactory.squareList[this.moveFactory.square120Indexes[i]]
            squares[i] = piece == 0 ? null : FenPieceMap.fenByBitType[piece]
        }
        return squares
    }

    isGameOver(): boolean
    {
        return this.getStatus().terminationType != 'unterminated'
    }

    isCheck(): boolean
    {
        return this.moveNavigator.getLast()?.bitMove.isCheck ?? false
    }

    isMate(): boolean
    {
        return this.moveNavigator.getLast()?.bitMove.isMate ?? false
    }

    isDraw(): boolean
    {
        return this.isGameOver() && this.getStatus().winner === null
    }

    setDrawByAgreement(): void {
        this.terminate(new GameStatus('normal', null, 'agreement'))
    }

    setResigns(color: 'white'|'black'): void {
        const winner = color == 'white' ? 'black' : 'white'

        this.terminate(new GameStatus('normal', winner, null))
    }

    terminate(status: GameStatus)
    {
        this.#stopClocks()
        this.gameStatus = status
    }

    // determine if last move resulted in end of game
    #terminateIfMatedOrStalemated(move: RecordedMove): void {
        // checkmate
        if(move.bitMove.isMate){
            this.terminate(new GameStatus('normal', move.getColor()))
            return
        }
        // stalemates
        if(this.getCandidateMoves(this.getSideToMove()).length == 0){
            this.terminate(new GameStatus('normal', null, 'stalemate'))
            return
        }

        if(!this.moveFactory.hasSufficientMaterialForMate()){
            this.terminate(new GameStatus('normal', null, 'insufficient-material'))
            return
        }
        if(this.moveFactory.state.halfMoveClock >= 50){
            this.terminate(new GameStatus('normal', null, 'fifty-move-rule'))
            return
        }
        if(this.repetitionTracker.repetitionCount > 2){
            this.terminate(new GameStatus('normal', null, 'three-fold-repetition'))
        }

    }

    undoMove(): void {
        const recordedMove = this.moveNavigator.getLast()
        if(!recordedMove){
            throw new Error('Cannot undo last move. No moves have been played.')
        }

        this.moveFactory.unmakeMove(recordedMove.bitMove)
        this.moveNavigator.deleteFrom(recordedMove.getId())
    }

    getSideToMove(): "white"|"black" {
        return this.moveFactory.state.sideToMove ? 'black' : 'white'
    }

    getLastSideToMove(): "white"|"black" {
        return this.moveFactory.state.sideToMove ? 'white' : 'black'
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
}