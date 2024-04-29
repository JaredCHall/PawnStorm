import {Game} from "./src/Game/Game.ts";


const game = new Game()

game.render()
game.setNotation('coordinate')
game.makeMove('e2e4')
game.render()
game.makeMove('e7e5')
game.render()
game.makeMove('e1e2')
game.render()
game.makeMove('e8e7')
game.render()