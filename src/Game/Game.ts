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

export class Game {

    private gameStatus: GameStatus = new GameStatus();

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
            return
        }

        const move = this.moveNavigator.getMove(moveId)
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

    makeMove(notation: string): RecordedMove{
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

    // determine if last move resulted in end of game
    #updateGameTermination(move: RecordedMove): void
    {
        // checkmate
        if(move.bitMove.isMate){
            this.gameStatus = new GameStatus('normal', move.color)
            return
        }
        // stalemate
        if(this.getCandidateMoves(this.getSideToMove()).length == 0){
            this.gameStatus = new GameStatus('normal', null, 'stalemate')
            return
        }

        if(this.#hasInsufficientMaterial()){
            this.gameStatus = new GameStatus('normal', null, 'insufficient-material')
            return
        }


    }

    #hasInsufficientMaterial(): boolean
    {
        // insufficient material
        const whitePieces: string[] = this.getPieces('white')
        const blackPieces: string[] = this.getPieces('black')

        if(whitePieces.length > 4 || blackPieces.length > 4){
            return false
        }

        if(whitePieces.includes('P') || blackPieces.includes('p')){
            return false
        }
        if(whitePieces.includes('Q') || blackPieces.includes('q')){
            return false
        }
        if(whitePieces.includes('R') || blackPieces.includes('r')){
            return false
        }

        // king vs. king
        if(whitePieces.length == 1 && blackPieces.length == 1){
            return true
        }

        // king + minor piece vs. king
        if((whitePieces.length == 2 && blackPieces.length == 1)
            || (whitePieces.length == 1 && blackPieces.length == 2)){
            return true
        }


        // TODO: Add King + Bishop vs. King + Bishop (if bishops are same color)


        return false

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