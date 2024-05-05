import {Game} from "../Game/Game.ts";
import {BitMove} from "../MoveGen/BitMove.ts";

export class ConsoleApp {

    private game: Game

    constructor() {
        this.game = new Game('rnbqkbnr/p2p1ppp/2p1p3/1p6/3N4/2N5/PPPPPPPP/R1BQKB1R w KQkq - 0 4')
    }


    run() {
        const wantsToPlay = confirm('How about a nice game of chess?')

        if(!wantsToPlay){
            return this.#sayGoodbye()
        }

        const continues = this.#selectNotationType()
        if(!continues){
            return this.#sayGoodbye()
        }

        console.log(`Good luck!`)

        this.game.render()

        while(this.#makeNextUserMove()){
            this.game.render()
        }

        this.#sayGoodbye()

    }

    #sayGoodbye()
    {
        console.log('Good bye!')
    }

    #isExitInput(input: string|null)
    {
        if(!input){
            return false
        }

        return ['quit','exit'].indexOf(input.toLowerCase()) !== -1
    }

    #selectNotationType(): boolean
    {
        let input
        do{
            input = prompt('Would you like to play with algebraic or coordinate notation?', 'algebraic')
            if(this.#isExitInput(input)){
                return false
            }
        }while(!input || (input != 'algebraic' && input != 'coordinate'));

        this.game.setNotation(input ?? 'algebraic')
        return true
    }


    #getUserMoveInput(): string|false
    {
        const input = prompt(`What is the next move for ${this.game.getSideToMove()}?`)

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