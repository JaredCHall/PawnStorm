import {Game} from "../Game/Game.ts";
import {EngineInterface} from "../Engine/EngineInterface.ts";
import {Renderer} from "../Board/Renderer.ts";
import {GameOverError} from "../Game/Error/GameOverError.ts";
import {InvalidMoveError} from "../Game/Error/InvalidMoveError.ts";
import {PgnSerializer} from "../Notation/PgnSerializer.ts";
import {EtherealInterface} from "../Engine/EtherealInterface.ts";
import {EngineRegistry, EngineType} from "../Engine/EngineRegistry.ts";

class ConsoleAppPlayer {
    type: 'user'|'engine' = 'user'
    name: string = 'user'
    engineTimeToMove: number|null = null
}


export class ConsoleApp {


    readonly name = 'PawnStorm Console'

    showAlways: boolean = true

    players: {
        white: ConsoleAppPlayer,
        black: ConsoleAppPlayer,
    } = {
        white: new ConsoleAppPlayer(),
        black: new ConsoleAppPlayer()
    }

    playerSide: 'white'|'black'|null = 'white';

    game: Game

    renderer: Renderer

    engine: EngineInterface

    engineRegistry: EngineRegistry

    constructor() {
        this.game = new Game()
        this.engine = new EtherealInterface()
        this.renderer = new Renderer()
        this.engineRegistry = new EngineRegistry()
        this.engineRegistry.add('stockfish', EngineType.Stockfish)
        this.engineRegistry.add('ethereal', EngineType.Ethereal)
        this.engineRegistry.add('rustic', EngineType.Rustic)

        this.#setPlayer('white','Console User')
        this.#setEngine('black','stockfish',500)
    }

    printMenu(): void
    {
        console.log(`
${this.name} Menu

By default you will start as white against stockfish with 500ms to move. While playing,
you will always have an input prompt available indicated by the '>' character.
You may either enter your next move in algebraic notation, in which case the
game will progress, or input one of the following menu options.

Note: If engines are assigned to play both colors, the prompt will disappear and the game will play out until its conclusion

Options:
    menu                                Display this menu
    show [always|never]                 Display the board. "always" will display after each move.
    pgn                                 Display the PGN
    new [fen?]                          Start a new game and optionally set with fen string
    player [color] [name]               Set user as color player and optionally assign [name]
    engine [color] [type] [timeToMove]  Set an engine as color player and optionally assign [timeToMove] in milliseconds
                                            [type] can be 'stockfish', 'ethereal', 'rustic'  
    undo                                Undo your last move
    resign                              Resign the game
    quit                                Exit the application
`)
    }

    renderGame(): void {
        this.renderer.render(this.game)
    }

    async run() {

        this.printMenu()

        this.newGame(null)

        while(true){

            if(await this.engineMove()){
                if(this.#handleGameTermination()){
                    continue;
                }
                this.renderGame()

                continue
            }

            const input = prompt(`> `)

            switch (input) {
                case 'menu':
                    this.printMenu()
                    continue
                case 'quit':
                    console.log('Goodbye!')
                    return Deno.exit(0)
                case 'show':
                    this.renderGame()
                    continue
                case 'show always':
                    this.renderGame()
                    this.showAlways = true
                    continue
                case 'show never':
                    this.renderGame()
                    this.showAlways = false
                    continue
                case 'pgn':
                    this.#displayPgn()
                    continue
                case 'new':
                    await this.newGame(null)
                    continue
                case 'undo':
                    this.game.undoMove() // undo engine's last move
                    this.game.undoMove() // undo player's last move
                    continue
                case 'resign':
                    if(this.playerSide === null){
                        throw new Error('Cannot resign if you are not playing.')
                    }

                    this.game.setResigns(this.playerSide)
                    console.log(`Good game. Well played. Lets play another!`)
                    continue
            }

            if(!input){
                continue
            }

            const newFenInput = input.match(/^new\s(.*)$/)
            if(newFenInput !== null){
                await this.newGame(newFenInput[1])
                continue;
            }

            const engineInput = input.match(/^engine\s(black|white)\s(stockfish|ethereal|rustic)(?:\s(\d+))?.*$/)
            if(engineInput){
                this.#setEngine(
                    engineInput[1],
                    engineInput[2],
                    engineInput[3] == null ? 1000 : parseInt(engineInput[3]),
                )
                continue
            }

            const playerInput = input.match(/^player\s(black|white)\s(\S+).*$/)
            if(playerInput){
                this.#setPlayer(
                    playerInput[1],
                    playerInput[2] ?? 'user',
                )
                continue
            }

            // input is move notation
            if(this.#isUserTurn()){
                try {
                    const move = this.game.makeMove(input)
                    console.log(move.serialize(true))
                }catch(err){
                    if(err instanceof GameOverError || err instanceof InvalidMoveError){
                        console.log(`${err.name}: ${err.message}`)
                    }else{
                        throw err
                    }
                    continue
                }
                this.#handleGameTermination()
            }else{
                console.log('Error: Unrecognized input. Enter "menu" for a list of commands')
            }
        }
    }

    #isUserTurn(): boolean
    {
        return this.players[this.game.getSideToMove()].type === 'user'
    }

    #updatePlayerTags()
    {
        this.game.setTag('White', this.players.white.name)
        this.game.setTag('Black', this.players.black.name)
    }

    #setEngine(color:string, type: string, timeToMove: number)
    {
        if(color !== 'white' && color !== 'black'){
            throw new Error(`Invalid color: ${color}`)
        }

        if(type !== 'stockfish' && type !== 'ethereal' && type !== 'rustic'){
            throw new Error(`Invalid player type: ${type}`)
        }

        const player = color == 'white' ? this.players.white : this.players.black
        player.type = 'engine'
        player.name = type
        player.engineTimeToMove = timeToMove

        this.#updatePlayerTags()
    }

    #setPlayer(color: string, name: string)
    {
        if(color !== 'white' && color !== 'black'){
            throw new Error(`Invalid color: ${color}`)
        }

        const player = color == 'white' ? this.players.white : this.players.black

        player.type = 'user'
        player.name = name
        player.engineTimeToMove = null
        this.playerSide = color

        this.#updatePlayerTags()
    }

    async engineMove(): Promise<boolean> {

        if(this.game.isGameOver()){
            return false
        }
        const player = this.players[this.game.getSideToMove()]
        if(player.type !== 'engine'){
            return false
        }

        const engine = this.engineRegistry.get(player.name)
        await engine.setFen(this.game.getFenNotation().serialize())
        const move = this.game.makeMove(await engine.getBestMove(player.engineTimeToMove ?? 1000), 'coordinate')

        console.log(`${move.serialize(true)}`)

        return true
    }

    async newGame(fen: string|null): Promise<void>
    {
        this.game = new Game(fen)
        this.game.setTag('Site', 'PawnStorm ConsoleApp')
        this.#updatePlayerTags()

        console.log(`New game with FEN: ${this.game.getFenNotation().serialize()}`)
        this.renderGame()
    }

    #handleGameTermination(): boolean
    {
        if(!this.game.isGameOver()){
            return false
        }

        const status = this.game.getStatus()

        if(!status.winner){
            console.log('stalemate by ' + status.drawType)
        }else{
            console.log(`${ this.players[status.winner].name} wins`)
        }
        this.renderGame()

        return true
    }

    #displayPgn(): void
    {
        console.log(new PgnSerializer(this.game).serialize().trim())
    }
}