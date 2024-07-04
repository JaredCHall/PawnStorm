import {Game} from "../Game/Game.ts";
import {EngineInterface} from "../Engine/EngineInterface.ts";
import {StockfishInterface} from "../Engine/StockfishInterface.ts";

export class ConsoleApp {


    readonly name = 'BitChess Console'

    playerSide: 'white'|'black' = 'white';

    game: Game

    engine: EngineInterface

    constructor() {
        this.game = new Game()
        this.engine = new StockfishInterface()
    }

    printMenu(): void
    {
        console.log(`
${this.name} Menu

A console chess app. To play against your favorite engine in the console.

Usage:

You will always have an input prompt available indicated by the '>' character.
You may either enter your next move in algebraic notation, in which case the
game will progress, or input one of the following menu options.

Options:
    menu            Display this menu
    new [fen]       Start a new game and optionally set with fen string
    level [level]   Set the engine's skill level (1 - 9)
    switch          Switch sides and play as the other color
    undo            Undo your last move
    resign          Resign the game
    quit            Exit the application
`)
    }

    async run() {

        this.printMenu()

        while(true){

            console.log(`${this.playerSide} to move`)
            this.game.render()

            const input = prompt(`> `)

            switch (input) {
                case 'menu': this.printMenu(); break;
                case 'quit': return Deno.exit(0)
                case 'undo':
                    this.game.undoMove() // undo engine's last move
                    this.game.undoMove() // undo player's last move
                    continue
                case 'switch':
                    this.switchSides()
                    this.engineMove()
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
                this.game = new Game(newFenInput[1])
                if(this.playerSide == 'black'){
                    this.engineMove()
                }
                continue;
            }

            const newLevelInput = input.match(/^level\s([0-9]+)/)
            if(newLevelInput){
                await this.engine.setSkillLevel(parseInt(newLevelInput[1]))
                continue
            }

            // input is move notation

            try {
                this.game.makeMove(input)
            }catch(err){
                console.log(err.message)
                continue
            }

            const status = this.game.getStatus()
            if(status.terminationType !== 'unterminated'){
                this.game.render()
                console.log('Game over')
                console.log(`${status.winner} wins`)
                break
            }

            await this.engineMove()

            if(status.terminationType !== 'unterminated'){
                this.game.render()
                console.log('Game over')
                console.log(`${status.winner} wins`)
                break
            }


        }
    }

    switchSides(): void {
        this.playerSide = this.playerSide == 'white' ? 'black' : 'white'
    }

    async engineMove(): Promise<void> {
        await this.engine.setFen(this.game.getFenNotation().serialize())
        this.game.makeMove(await this.engine.getBestMove(), 'coordinate')

        console.log(`Engine move`)
        this.game.render()

    }

    #isExitInput(input: string|null)
    {
        if(!input){
            return false
        }

        return ['quit','exit'].indexOf(input.toLowerCase()) !== -1
    }

    #getUserMoveInput(): string|false
    {
        const input = prompt(`> `)

        if(!input || this.#isExitInput(input)){
            return false
        }

        return input
    }



    #makeNextUserMove(): boolean
    {
        let input
        do{
            input = this.#getUserMoveInput()
            if(input === false){
                return false
            }

            try {
                this.game.makeMove(input)
            }catch(err){
                console.log(err.message)
                input = null
            }

        }while(!input);

        return true
    }

}