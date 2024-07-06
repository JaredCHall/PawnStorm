import {Game} from "../Game/Game.ts";
import {EngineInterface} from "../Engine/EngineInterface.ts";
import {StockfishInterface} from "../Engine/StockfishInterface.ts";
import {PgnParser} from "../Notation/PgnParser.ts";
import {Renderer} from "../Board/Renderer.ts";

export class ConsoleApp {


    readonly name = 'BitChess Console'

    playerSide: 'white'|'black' = 'white';

    game: Game

    renderer: Renderer

    engine: EngineInterface

    constructor() {
        this.game = new Game()
        this.engine = new StockfishInterface()
        this.renderer = new Renderer()
    }

    printMenu(): void
    {
        console.log(`
${this.name} Menu

A console chess app. To play against your favorite engine in the console. This app hides the board by default,
allowing you to work on visualization.

Usage:

You will always have an input prompt available indicated by the '>' character.
You may either enter your next move in algebraic notation, in which case the
game will progress, or input one of the following menu options.

Options:
    menu            Display this menu
    show            Display the board
    list            Display the full move list
    new [fen]       Start a new game and optionally set with fen string
    level [level]   Set the engine's skill level (1 - 9)
    switch          Switch sides and play as the other color
    undo            Undo your last move
    resign          Resign the game
    quit            Exit the application
`)
    }

    renderGame(): void {
        this.renderer.render(this.game)
    }

    async run() {

        this.printMenu()

        while(true){

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
                case 'list':
                    this.#displayMoveList()
                    continue
                case 'new':
                    await this.newGame(null);
                    continue
                case 'undo':
                    this.game.undoMove() // undo engine's last move
                    this.game.undoMove() // undo player's last move
                    continue
                case 'switch':
                    this.#switchSides()
                    await this.engineMove()
                    continue
                case 'resign':
                    this.game.setResigns(this.playerSide)
                    console.log(`Good game. Well played. Lets play another!`)
                    this.game = new Game()
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

            const newLevelInput = input.match(/^level\s([0-9]+)/)
            if(newLevelInput){
                await this.engine.setSkillLevel(parseInt(newLevelInput[1]))
                console.log(`Engine skill level changed to ~${newLevelInput[1]} ELO`)
                continue
            }

            // input is move notation

            try {
                const move = this.game.makeMove(input)
                console.log(move.serialize(true))
            }catch(err){
                console.log(err.message)
                continue
            }

            const status = this.game.getStatus()
            if(status.terminationType !== 'unterminated'){
                this.renderGame()
                console.log('Game over')
                console.log(`${status.winner} wins`)
                continue
            }

            await this.engineMove()

            if(status.terminationType !== 'unterminated'){
                this.renderGame()
                console.log('Game over')
                console.log(`${status.winner} wins`)
            }
        }
    }

    #switchSides(): void {
        this.playerSide = this.playerSide == 'white' ? 'black' : 'white'
    }

    async engineMove(): Promise<void> {
        await this.engine.setFen(this.game.getFenNotation().serialize())
        const move = this.game.makeMove(await this.engine.getBestMove(), 'coordinate')

        console.log(`${move.serialize(true)}`)
    }

    async newGame(fen: string|null): Promise<void>
    {
        this.game = new Game(fen)
        console.log(`New game with FEN: ${this.game.getFenNotation().serialize()}`)
        this.renderGame()
        if(this.playerSide == 'black'){
            await this.engineMove()
        }
    }

    #displayMoveList(): void
    {
        const firstMove = this.game.getMoveNavigator().getFirstMove()
        if(firstMove){
            console.log(new PgnParser().serializeMoves(firstMove))
        }
    }
}