import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {Color, FenPieceMap} from "../Board/Piece.ts";
import {MoveNavigator} from "./MoveNavigator.ts";
import {RecordedMove} from "./RecordedMove.ts";
import {ParserInterface} from "../Notation/Moves/ParserInterface.ts";
import {AlgebraicNotationParser} from "../Notation/Moves/AlgebraicNotationParser.ts";
import {CoordinateNotationParser} from "../Notation/Moves/CoordinateNotationParser.ts";
import {GameStatus} from "./GameStatus.ts";
import {FenNumber} from "../Notation/FenNumber.ts";
import {RepetitionTracker} from "./RepetitionTracker.ts";
import {PgnParser} from "../Notation/PgnParser.ts";

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

    private readonly moveNavigator: MoveNavigator

    private notationParser: ParserInterface = new AlgebraicNotationParser(this.moveFactory)

    private repetitionTracker: RepetitionTracker = new RepetitionTracker();

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.setBoard(fen)
        this.moveNavigator = new MoveNavigator(fen)
    }

    setBoard(fenString: string): void {
        this.moveFactory.setFromFenNumber(fenString)
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
            this.moveNavigator.goto(moveId)
            this.moveFactory.setFromFenNumber(this.moveNavigator.startFen)
            this.repetitionTracker.buildFromMove(null)
            return
        }

        const move = this.moveNavigator.getMove(moveId)
        this.moveNavigator.goto(moveId)
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

    makeMove(notation: string): RecordedMove {

        if(this.gameStatus.terminationType != 'unterminated'){
            throw new Error('Cannot make move. Game is already terminated.')
        }

        const move = this.notationParser.parse(notation)

        // serialize the notation before the move is made as it is necessary for disambiguation
        // in algebraic notation. We could unmake/make again, but that is less efficient
        const moveCounter = (Math.floor(this.moveFactory.ply / 2) + 1)
        const serialized = this.notationParser.serialize(move)

        // game officially starts on first move
        if(moveCounter == 1 && this.getSideToMove() == 'white'){
            if(!this.getTag('Date')){
                this.setTag('Date', PgnParser.formatDateTag(new Date()))
            }
        }

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
        this.setTag('Result', PgnParser.formatResultTag(this.gameStatus))

        return recordedMove
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
            const piece = this.moveFactory.squareList[this.moveFactory.square64Indexes[i]]
            if(piece != 0){
                squares[i] = null
            }else{
                squares[i] = FenPieceMap.fenByBitType[piece]
            }
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
        this.gameStatus = new GameStatus('normal', null, 'agreement')
    }

    setResigns(color: 'white'|'black'): void {
        const winner = color == 'white' ? 'black' : 'white'

        this.gameStatus = new GameStatus('normal', winner, null)
    }

    // determine if last move resulted in end of game
    #updateGameTermination(move: RecordedMove): void {
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


    undoMove(): void {
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