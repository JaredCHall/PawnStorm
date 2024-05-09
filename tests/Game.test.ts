import {Game} from "../src/Game/Game.ts";


Deno.test('it handles move list and variations', () => {


    const game = new Game('4k3/8/4K3/8/8/4R3/8/8 w - - 0 1')

    game.render()
    game.makeMove('Re4')
    game.makeMove('Kf8')
    game.makeMove('Rg4')
    game.makeMove('Ke8')
    game.makeMove('Rg8#')

    game.render()

    console.log(game.getMainLine())

})