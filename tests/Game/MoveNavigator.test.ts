import {Game} from "BitChess/Game/Game.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";



Deno.test('it navigates moves and variations in algebraic notation', () => {
    const game = new Game('4k3/8/4K3/8/8/4R3/8/8 w - - 0 1')

    game.render()
    game.makeMove('Re4')
    game.makeMove('Kf8')
    game.makeMove('Rg4')
    game.makeMove('Ke8')
    game.makeMove('Rg8#')

    const moveNav = game.getMoveNavigator()

    // main line is good
    assertEquals(moveNav.getMove(0).notation, 'Re4')
    assertEquals(moveNav.getMove(1).notation, 'Kf8')
    assertEquals(moveNav.getMove(2).notation, 'Rg4')
    assertEquals(moveNav.getMove(3).notation, 'Ke8')
    assertEquals(moveNav.getMove(4).notation, 'Rg8#')


    // first variation
    game.gotoMove(0)
    game.makeMove('Re5', true)
    game.makeMove('Kf8')
    game.makeMove('Rg5')
    game.makeMove('Ke8')
    game.makeMove('Rg8#')
    assertEquals(moveNav.getMove(5).notation, 'Re5')
    assertEquals(moveNav.getMove(6).notation, 'Kf8')
    assertEquals(moveNav.getMove(7).notation, 'Rg5')
    assertEquals(moveNav.getMove(8).notation, 'Ke8')
    assertEquals(moveNav.getMove(9).notation, 'Rg8#')

    // sub variation
    game.gotoMove(9)
    game.makeMove('Rg6', true)
    game.makeMove('Kf8')
    game.makeMove('Rg5')
    game.makeMove('Ke8')
    game.makeMove('Rg8')
    assertEquals(moveNav.getMove(10).notation, 'Rg6')
    assertEquals(moveNav.getMove(11).notation, 'Kf8')
    assertEquals(moveNav.getMove(12).notation, 'Rg5')
    assertEquals(moveNav.getMove(13).notation, 'Ke8')
    assertEquals(moveNav.getMove(14).notation, 'Rg8#')

    // second variation
    game.gotoMove(0)
    game.makeMove('Re1', true)
    game.makeMove('Kf8')
    game.makeMove('Rg1')
    game.makeMove('Ke8')
    game.makeMove('Rg8#')
    assertEquals(moveNav.getMove(15).notation, 'Re1')
    assertEquals(moveNav.getMove(16).notation, 'Kf8')
    assertEquals(moveNav.getMove(17).notation, 'Rg1')
    assertEquals(moveNav.getMove(18).notation, 'Ke8')
    assertEquals(moveNav.getMove(19).notation, 'Rg8#')

    assertEquals(
        moveNav.serialize(),
        '1. Re4 (1. Re5 Kf8 2. Rg5 Ke8 3. Rg8# (3. Rg6 Kf8 4. Rg5 Ke8 5. Rg8#)) (1. Re1 Kf8 2. Rg1 Ke8 3. Rg8#) 1... Kf8 2. Rg4 Ke8 3. Rg8#'
    )

    game.undoMove()

    assertEquals(
        moveNav.serialize(),
        '1. Re4 (1. Re5 Kf8 2. Rg5 Ke8 3. Rg8# (3. Rg6 Kf8 4. Rg5 Ke8 5. Rg8#)) (1. Re1 Kf8 2. Rg1 Ke8) 1... Kf8 2. Rg4 Ke8 3. Rg8#'
    )

    moveNav.deleteFrom(5)

    assertEquals(
        moveNav.serialize(),
        '1. Re4 (1. Re1 Kf8 2. Rg1 Ke8) 1... Kf8 2. Rg4 Ke8 3. Rg8#'
    )

})
