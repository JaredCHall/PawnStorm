import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {PerftRunner} from "../../src/Perft/PerftRunner.ts";
import {PerftPosition} from "../../src/Perft/PerftPosition.ts";

const position = PerftPosition.composedPositionMirrored()

const maxDepth = 5
for(let depth=1;depth <= maxDepth; depth++){
    Deno.test(`it passes composed position (mirrored): ${depth}`, () => {
        const runner = new PerftRunner(position.fen)
        const result = runner.run(depth)

        console.table(result)
        assertEquals(result, position.results[depth])
    })
}
