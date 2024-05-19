import { assertEquals } from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {GameStatus} from "../../src/Game/GameStatus.ts";
import {PgnParser} from "../../src/Notation/PgnParser.ts";

Deno.test('it formats result tag', () => {
    let status

    status = new GameStatus('normal', 'white', null)
    assertEquals(PgnParser.formatResultTag(status),'1-0')

    status = new GameStatus('normal', 'black', null)
    assertEquals(PgnParser.formatResultTag(status),'0-1')

    status = new GameStatus('normal', null, null)
    assertEquals(PgnParser.formatResultTag(status),'1/2-1/2')

    status = new GameStatus('unterminated', null, null)
    assertEquals(PgnParser.formatResultTag(status),'*')
})

Deno.test('it formats date tag', () => {
    assertEquals(PgnParser.formatDateTag(new Date('2024-01-04')),'2024.01.04')
})

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

1. e4 d5 2. exd5 Qxd5 (2... Nf6!? 3. Be2 Nxd5 4. d4) (2... c6?! { Scandinavian Gambit. It's kind of like the Danish Gambit, but for Black. } 3. dxc6 Nxc6 4. Bc4 e5 5. d3 Nf6 6. Ne2 Bg4 7. Nbc3 Bc5 8. h3 Bh5 9. O-O) 3. Nf3 Bg4! { Played by masters. Black pins our knight to the queen. We will break the pin with the bishop then immediately go h3 to push the bishop back and prevent Qh5. } (3... e5?? 4. Nc3 Qa5 (4... Qe6 5. Bb5+ Nc6 6. O-O) 5. Bc4) (3... c5? 4. Nc3 Qd8 5. d4) (3... Nc6!? 4. Nc3 Qa5 5. d4) (3... Nf6! { Played by masters. } 4. d4 c6 5. c4) (3... Qe6+?? 4. Be2 Qg6 5. d4 Qxg2 6. Rg1) 4. Be2 Nc6 5. h3 Bh5 6. d4 O-O-O 7. c4 Qf5 8. g4
`,
        'serializes game as expected PGN file'
    )

})