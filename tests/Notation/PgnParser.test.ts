import { assertEquals } from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {PgnParser} from "../../src/Notation/PgnParser.ts";


Deno.test('it parses and re-serializes an opening study', () => {

    const parser = new PgnParser()

    const inputString = `[Event "Repertoire as White: Scandinavian Defense"]
[Site "https://lichess.org/study/"]
[Result "*"]
[Variant "Standard"]
[ECO "B01"]
[Opening "Scandinavian Defense: Mieses-Kotroc Variation"]
[Annotator "BlunderingTactician"]
[UTCDate "2024.02.21"]
[UTCTime "23:24:07"]

1. e4 d5 2. exd5 Qxd5 (2... Nf6!? 3. Be2 Nxd5 4. d4) (2... c6?! { Scandinavian Gambit. It's kind of like the Danish Gambit, but for Black. } 3. dxc6 Nxc6 4. Bc4 e5 5. d3 Nf6 6. Ne2 Bg4 7. Nbc3 Bc5 8. h3 Bh5 9. O-O) 3. Nf3 Bg4! { Played by masters. Black pins our knight to the queen. We will break the pin with the bishop then immediately go h3 to push the bishop back and prevent Qh5. } (3... e5?? 4. Nc3 Qa5 (4... Qe6 5. Bb5+ Nc6 6. O-O) 5. Bc4) (3... c5? 4. Nc3 Qd8 5. d4) (3... Nc6!? 4. Nc3 Qa5 5. d4) (3... Nf6! { Played by masters. } 4. d4 c6 5. c4) (3... Qe6+?? 4. Be2 Qg6 5. d4 Qxg2 6. Rg1) 4. Be2 Nc6 5. h3 Bh5 6. d4 O-O-O 7. c4 Qf5 8. g4 *

`
    const game = parser.parse(inputString)

    assertEquals(game.getMoveNavigator().getLast(), null, 'It sets game to start position')

    assertEquals(game.getTag('Site'), 'https://lichess.org/study/', 'Sets Site tag')
    assertEquals(game.getTag('Result'), '*', 'Sets Result tag')
    assertEquals(game.getTag('Variant'), 'Standard', 'Sets Variant tag')
    assertEquals(game.getTag('ECO'), 'B01', 'Sets ECO tag')
    assertEquals(game.getTag('Opening'), 'Scandinavian Defense: Mieses-Kotroc Variation', 'Sets Opening tag')
    assertEquals(game.getTag('Annotator'), 'BlunderingTactician', 'Sets Annotator tag')
    assertEquals(game.getTag('UTCDate'), '2024.02.21', 'Sets UTCDate tag')
    assertEquals(game.getTag('UTCTime'), '23:24:07', 'Sets UTCTime tag')


    console.log(parser.serialize(game))

    assertEquals(
        parser.serialize(game),
        `[Event "Repertoire as White: Scandinavian Defense"]
[Site "https://lichess.org/study/"]
[Round "1"]
[White "?"]
[Black "?"]
[Result "*"]
[Variant "Standard"]
[ECO "B01"]
[Opening "Scandinavian Defense: Mieses-Kotroc Variation"]
[Annotator "BlunderingTactician"]
[UTCDate "2024.02.21"]
[UTCTime "23:24:07"]
[Date "2024.05.19"]

1. e4 d5 2. exd5 Qxd5 (2... Nf6!? 3. Be2 Nxd5 4. d4) (2... c6?! { Scandinavian Gambit. It's kind of like the Danish Gambit, but for Black. } 3. dxc6 Nxc6 4. Bc4 e5 5. d3 Nf6 6. Ne2 Bg4 7. Nbc3 Bc5 8. h3 Bh5 9. O-O) 3. Nf3 Bg4! { Played by masters. Black pins our knight to the queen. We will break the pin with the bishop then immediately go h3 to push the bishop back and prevent Qh5. } (3... e5?? 4. Nc3 Qa5 (4... Qe6 5. Bb5+ Nc6 6. O-O) 5. Bc4) (3... c5? 4. Nc3 Qd8 5. d4) (3... Nc6!? 4. Nc3 Qa5 5. d4) (3... Nf6! { Played by masters. } 4. d4 c6 5. c4) (3... Qe6+?? 4. Be2 Qg6 5. d4 Qxg2 6. Rg1) 4. Be2 Nc6 5. h3 Bh5 6. d4 O-O-O 7. c4 Qf5 8. g4 *
`,
        'serializes game as expected PGN file'
    )

})


Deno.test('it handles game with alternative initial position', () => {

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

    console.log(parser.serialize(game))

    assertEquals(
        parser.serialize(game),
        `[Event "Mating Patterns #1: Balestra #4"]
[Site "?"]
[Round "1"]
[White "Example 4"]
[Black "?"]
[Date "????.??.??"]
[Result "*"]
[FEN "1r1k1b1r/1bqn2p1/p3Q2p/1p2P3/8/4B1PP/PPP3P1/3RRBK1 w - - 0 21"]

21. Rxd7+ (21. Bb6 Bc5+ 22. Bxc5 Qxc5+ 23. Kh2 Qe7) 21... Qxd7 22. Rd1 (22. Bb6+ Kc8) 22... Qxd1 23. Bb6# { 1-0 White wins by checkmate. } *
`,
        'serializes game as expected PGN file'
    )

})


Deno.test('it handles puzzle with initial comment and no moves', () => {

    const parser = new PgnParser()

    const inputString
        = `[Event "Various Puzzles: Queen + Bishop 26"]
[Result "*"]
[FEN "3r4/1p2RQ1p/p5p1/2q5/3r2kP/6P1/PP3P2/5BK1 w - - 0 36"]

{ Can you find the mate-in-2? }
 *`
    const game = parser.parse(inputString)

    assertEquals(game.getMoveNavigator().getLast(), null, 'It sets game to start position')

    assertEquals(game.getTag('Event'), 'Various Puzzles: Queen + Bishop 26', 'Sets Site tag')
    assertEquals(game.getTag('Result'), '*', 'Sets Result tag')
    assertEquals(game.getTag('FEN'), '3r4/1p2RQ1p/p5p1/2q5/3r2kP/6P1/PP3P2/5BK1 w - - 0 36', 'Sets FEN tag')

    console.log(parser.serialize(game))

    assertEquals(
        parser.serialize(game),
        `[Event "Various Puzzles: Queen + Bishop 26"]
[Site "?"]
[Round "1"]
[White "?"]
[Black "?"]
[Result "*"]
[FEN "3r4/1p2RQ1p/p5p1/2q5/3r2kP/6P1/PP3P2/5BK1 w - - 0 36"]

{  Can you find the mate-in-2?  }
 *
`,
        'serializes game as expected PGN file'
    )

})


// chessgames.com formats moves without a space between the move count token and the move notation and additionally
// restricts total line size by adding line returns, making it a good variation to test
Deno.test('it handles game from chessgames.com', () => {
    const parser = new PgnParser()
    const inputString = `[Event "Monte Carlo"]
[Site "Monte Carlo MNC"]
[Date "1968.04.10"]
[EventDate "1968.04.03"]
[Round "7"]
[Result "1-0"]
[White "Mikhail Botvinnik"]
[Black "Lajos Portisch"]
[ECO "A22"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "51"]

1.c4 e5 2.Nc3 Nf6 3.g3 d5 4.cxd5 Nxd5 5.Bg2 Be6 6.Nf3 Nc6
7.O-O Nb6 8.d3 Be7 9.a3 a5 10.Be3 O-O 11.Na4 Nxa4 12.Qxa4 Bd5
13.Rfc1 Re8 14.Rc2 Bf8 15.Rac1 Nb8 16.Rxc7 Bc6 17.R1xc6 bxc6
18.Rxf7 h6 19.Rb7 Qc8 20.Qc4+ Kh8 21.Nh4 Qxb7 22.Ng6+ Kh7
23.Be4 Bd6 24.Nxe5 g6 25.Bxg6+ Kg7 26.Bxh6+ 1-0`

    const game = parser.parse(inputString)

    assertEquals(
        parser.serialize(game),
        `[Event "Monte Carlo"]
[Site "Monte Carlo MNC"]
[Round "7"]
[White "Mikhail Botvinnik"]
[Black "Lajos Portisch"]
[Date "1968.04.10"]
[EventDate "1968.04.03"]
[Result "1-0"]
[ECO "A22"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "51"]

1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Be6 6. Nf3 Nc6 7. O-O Nb6 8. d3 Be7 9. a3 a5 10. Be3 O-O 11. Na4 Nxa4 12. Qxa4 Bd5 13. Rfc1 Re8 14. Rc2 Bf8 15. Rac1 Nb8 16. Rxc7 Bc6 17. R1xc6 bxc6 18. Rxf7 h6 19. Rb7 Qc8 20. Qc4+ Kh8 21. Nh4 Qxb7 22. Ng6+ Kh7 23. Be4 Bd6 24. Nxe5+ g6 25. Bxg6+ Kg7 26. Bxh6+ 1-0
`
    )
    console.log(parser.serialize(game))

})