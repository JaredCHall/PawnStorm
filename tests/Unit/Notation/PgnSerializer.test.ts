import {assertEquals, assertThrows} from "@std/assert";
import {describe, it} from "@std/testing/bdd"
import {PgnParser} from "../../../src/Notation/PgnParser.ts";
import {PgnSerializer} from "../../../src/Notation/PgnSerializer.ts";


describe("PgnSerializer", () => {
    const game = new PgnParser().parse(`[Event "Repertoire as White: Scandinavian Defense"]
[Site "https://lichess.org/study/"]
[Result "*"]
[Variant "Standard"]
[ECO 'B01']
[Opening "Scandinavian Defense: Mieses-Kotroc Variation"]
[Annotator "BlunderingTactician"]
[UTCDate "2024.02.21"]
[UTCTime "23:24:07"]
[Date "2024.05.19"]

1. e4 { [%clk 0:05:00] } { Best by Test} d5 { [%clk 0:05:00] } 2. exd5 Qxd5 (2... Nf6!? 3. Be2 Nxd5 4. d4) (2... c6?! { Scandinavian Gambit. It's kind of like the Danish Gambit, but for Black. } 3. dxc6 Nxc6 4. Bc4 e5 5. d3 Nf6 6. Ne2 Bg4 7. Nbc3 Bc5 8. h3 Bh5 9. O-O) 3. Nf3 Bg4! { Played by masters. Black pins our knight to the queen. We will break the pin with the bishop then immediately go h3 to push the bishop back and prevent Qh5. } (3... e5?? 4. Nc3 Qa5 (4... Qe6 5. Bb5+ Nc6 6. O-O) 5. Bc4) (3... c5? 4. Nc3 Qd8 5. d4) (3... Nc6!? 4. Nc3 Qa5 5. d4) (3... Nf6! { Played by masters. } 4. d4 c6 5. c4) (3... Qe6+?? 4. Be2 Qg6 5. d4 Qxg2 6. Rg1) 4. Be2 Nc6 5. h3 Bh5 6. d4 O-O-O 7. c4 Qf5 8. g4 *

`)
    const serializer = new PgnSerializer(game)

    it('constructs with default options', () => {
        assertEquals(serializer.withGameTags, true)
        assertEquals(serializer.withGlyphs, true)
        assertEquals(serializer.withComments, true)
        assertEquals(serializer.withVariations, true)
        assertEquals(serializer.withClock, true)
        assertEquals(serializer.withEval, true)
    })

    it('it serializes with all options enabled', () => {

        assertEquals(
            serializer.serialize(),
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

1. e4 { [%clk 0:05:00] } { Best by Test } d5 { [%clk 0:05:00] } 2. exd5 Qxd5 (2... Nf6!? 3. Be2 Nxd5 4. d4) (2... c6?! { Scandinavian Gambit. It's kind of like the Danish Gambit, but for Black. } 3. dxc6 Nxc6 4. Bc4 e5 5. d3 Nf6 6. Ne2 Bg4 7. Nbc3 Bc5 8. h3 Bh5 9. O-O) 3. Nf3 Bg4! { Played by masters. Black pins our knight to the queen. We will break the pin with the bishop then immediately go h3 to push the bishop back and prevent Qh5. } (3... e5?? 4. Nc3 Qa5 (4... Qe6 5. Bb5+ Nc6 6. O-O) 5. Bc4) (3... c5? 4. Nc3 Qd8 5. d4) (3... Nc6!? 4. Nc3 Qa5 5. d4) (3... Nf6! { Played by masters. } 4. d4 c6 5. c4) (3... Qe6+?? 4. Be2 Qg6 5. d4 Qxg2 6. Rg1) 4. Be2 Nc6 5. h3 Bh5 6. d4 O-O-O 7. c4 Qf5 8. g4 *
`,
        )
    })

})
