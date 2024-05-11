import { Game } from "BitChess/Game/Game.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";

Deno.test('it plays the opera game', () => {

    const game = new Game()

    game.makeMove('e4')
    game.makeMove('e5')
    game.makeMove('Nf3')
    game.makeMove('d6')

    game.makeMove('d4')
    game.makeMove('Bg4')

    game.makeMove('dxe5')
    game.makeMove('Bxf3')

    game.makeMove('Qxf3')
    game.makeMove('dxe5')

    game.makeMove('Bc4')
    game.makeMove('Nf6')

    game.makeMove('Qb3')
    game.makeMove('Qe7')

    game.makeMove('Nc3')
    game.makeMove('c6')

    game.makeMove('Bg5')
    game.makeMove('b5')

    game.makeMove('Nxb5')
    game.makeMove('cxb5')

    game.makeMove('Bxb5')
    game.makeMove('Nbd7')

    game.makeMove('O-O-O')
    game.makeMove('Rd8')

    game.makeMove('Rxd7')
    game.makeMove('Rxd7')

    game.makeMove('Rd1')
    game.makeMove('Qe6')

    game.makeMove('Bxd7')
    game.makeMove('Nxd7')

    game.makeMove('Qb8')
    game.makeMove('Nxb8')

    game.makeMove('Rd8')

    game.render()

    assertEquals(
        game.getMainLine().serialize(),
        '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#'
    )


    console.log(game.getMainLine().serialize())

})