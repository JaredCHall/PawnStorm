import {assertEquals, assertThrows} from "@std/assert";
import {describe, it} from "@std/testing/bdd"
import {PgnParser} from "../../../src/Notation/PgnParser.ts";


describe("PgnParser", () => {

    describe('throws on invalid input', () => {

        const parser = new PgnParser()
        const dummyHeader = `[MyTag "custom"]\n\n`
        it('handles gibberish',() => {
            assertThrows(() => {parser.parse(`asdfdsaf`)})
        })

        it('handles malformed game tag', () => {
            assertThrows(() => {parser.parse(`[[Result "*"]`)})
        })

        it('handles RAV before move', () => {
            assertThrows(() => {parser.parse(dummyHeader + `(1. e4) 1. d4`)})
        })

        it('handles unclosed RAV', () => {
            assertThrows(() => {parser.parse(dummyHeader + `1. d4 (1.e4 d5`)})
        })

        it('handles unclosed comment', () => {
            assertThrows(() => {parser.parse(dummyHeader + `{An interesting puzzle. `)})
        })

        it('handles out-of-order NAG value', () => {
            assertThrows(() => {parser.parse(dummyHeader + `$255 1. e4`)})
        })

        it('handles illegal move', () => {
            assertThrows(() => {parser.parse(dummyHeader + `1. e4 e4`)})
        })
    })

    it('handles move list with no game tags', () => {
        const parser = new PgnParser()
        const game = parser.parse(`1. d4`)
        game.gotoMove(0)
        assertEquals(game.getFenNotation().serialize(), 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1')
    })

    it('handles move with multiple comments', () => {
        const parser = new PgnParser()
        const game = parser.parse(`1. e4 { best by test } {let's go!}`)

        assertEquals(game.getMoveNavigator().getFirstMove()?.getComments(),[
            'best by test',
            `let's go!`
        ])
    })


    it('handles game with alternative initial position', () => {

        const parser = new PgnParser()

        const inputString = `[Event "Mating Patterns #1: Balestra #4"]
[Site "?"]
[Date "????.??.??"]
[White "Example 4"]
[Result "*"]
[FEN "1r1k1b1r/1bqn2p1/p3Q2p/1p2P3/8/4B1PP/PPP3P1/3RRBK1 w - - 0 21"]

21. Rxd7+ (21. Bb6 Bc5+ 22. Bxc5 Qxc5+ 23. Kh2 Qe7) 21... Qxd7 22. Rd1 (22. Bb6+ Kc8) 22... Qxd1 23. Bb6# { 1-0 White wins by checkmate. } *

`
        const game = parser.parse(inputString)

        assertEquals(game.getMoveNavigator().getLast(), null, 'It sets game to start position')

        assertEquals(game.getTag('Site'), '?', 'Sets Site tag')
        assertEquals(game.getTag('Date'), '????.??.??', 'Sets Result tag')
        assertEquals(game.getTag('Result'), '*', 'Sets Result tag')
        assertEquals(game.getTag('White'), 'Example 4', 'Sets White tag')
        assertEquals(game.getTag('FEN'), '1r1k1b1r/1bqn2p1/p3Q2p/1p2P3/8/4B1PP/PPP3P1/3RRBK1 w - - 0 21', 'Sets FEN tag')
    })

    it('handles puzzle with initial comment and no moves', () => {

        const parser = new PgnParser()

        const inputString
            = `[Event "Various Puzzles: Queen + Bishop 26"]
[Result "*"]
[FEN "3r4/1p2RQ1p/p5p1/2q5/3r2kP/6P1/PP3P2/5BK1 w - - 0 36"]

{ Can you find the mate-in-2? }
 *`
        const game = parser.parse(inputString)

        assertEquals(game.getMoveNavigator().getLast(), null, 'It sets game to start position')
        assertEquals(game.getMoveNavigator().initialComment, 'Can you find the mate-in-2?')
        assertEquals(game.getTag('Event'), 'Various Puzzles: Queen + Bishop 26', 'Sets Site tag')
        assertEquals(game.getTag('Result'), '*', 'Sets Result tag')
        assertEquals(game.getTag('FEN'), '3r4/1p2RQ1p/p5p1/2q5/3r2kP/6P1/PP3P2/5BK1 w - - 0 36', 'Sets FEN tag')

    })

    it('handles puzzle with uncommon NAG values', () => {

        const parser = new PgnParser()

        const inputString
            = `[Event "Various Puzzles: Queen + Bishop 26"]
[Result "*"]
[FEN "3r4/1p2RQ1p/p5p1/2q5/3r2kP/6P1/PP3P2/5BK1 w - - 0 36"]

36. Qf3+ $40 Kxf3 $7 37. Be2# *
`
        const game = parser.parse(inputString)

        assertEquals(game.getMoveNavigator().getLast(), null, 'It sets game to start position')

        assertEquals(game.getTag('Event'), 'Various Puzzles: Queen + Bishop 26', 'Sets Site tag')
        assertEquals(game.getTag('Result'), '*', 'Sets Result tag')
        assertEquals(game.getTag('FEN'), '3r4/1p2RQ1p/p5p1/2q5/3r2kP/6P1/PP3P2/5BK1 w - - 0 36', 'Sets FEN tag')
        game.gotoMove(0)
        assertEquals(game.getMoveNavigator().getLast()?.annotation.value, 40)
        game.gotoMove(1)
        assertEquals(game.getMoveNavigator().getLast()?.annotation.value, 7)

    })

})


// chessgames.com formats moves without a space between the move count token and the move notation and additionally
// restricts total line size by adding line returns, making it a good variation to test
// Deno.test('it handles game from chessgames.com', () => {
//     const parser = new PgnParser()
//     const inputString = `[Event "Monte Carlo"]
// [Site "Monte Carlo MNC"]
// [Date "1968.04.10"]
// [EventDate "1968.04.03"]
// [Round "7"]
// [Result "1-0"]
// [White "Mikhail Botvinnik"]
// [Black "Lajos Portisch"]
// [ECO "A22"]
// [WhiteElo "?"]
// [BlackElo "?"]
// [PlyCount "51"]
//
// 1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Be6 6.Nf3 Nc6
// 7.O-O Nb6 8.d3 Be7 9.a3 a5 10.Be3 O-O 11.Na4 Nxa4 12.Qxa4 Bd5
// 13.Rfc1 Re8 14.Rc2 Bf8 15.Rac1 Nb8 16.Rxc7 Bc6 17.R1xc6 bxc6
// 18.Rxf7 h6 19.Rb7 Qc8 20.Qc4+ Kh8 21.Nh4 Qxb7 22.Ng6+ Kh7
// 23.Be4 Bd6 24.Nxe5 g6 25.Bxg6+ Kg7 26.Bxh6+ 1-0`
//
//     const game = parser.parse(inputString)
//
//     assertEquals(
//         parser.serialize(game),
//         `[Event "Monte Carlo"]
// [Site "Monte Carlo MNC"]
// [Round "7"]
// [White "Mikhail Botvinnik"]
// [Black "Lajos Portisch"]
// [Date "1968.04.10"]
// [EventDate "1968.04.03"]
// [Result "1-0"]
// [ECO "A22"]
// [WhiteElo "?"]
// [BlackElo "?"]
// [PlyCount "51"]
//
// 1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Be6 6. Nf3 Nc6 7. O-O Nb6 8. d3 Be7 9. a3 a5 10. Be3 O-O 11. Na4 Nxa4 12. Qxa4 Bd5 13. Rfc1 Re8 14. Rc2 Bf8 15. Rac1 Nb8 16. Rxc7 Bc6 17. R1xc6 bxc6 18. Rxf7 h6 19. Rb7 Qc8 20. Qc4+ Kh8 21. Nh4 Qxb7 22. Ng6+ Kh7 23. Be4 Bd6 24. Nxe5+ g6 25. Bxg6+ Kg7 26. Bxh6+ 1-0
// `
//     )
//
// })