import {PerftRunner} from "../../src/Perft/PerftRunner.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {PerftPosition} from "../../src/Perft/PerftPosition.ts";

const testPosition = (fen: string, depth: number, expectedNodes: number): void => {
    Deno.test(`it finds ${expectedNodes} nodes in position: "${fen}" position at depth ${depth}`, () => {
        assertEquals(
            new PerftRunner(fen).run(depth),
            expectedNodes
        )
    })
}

const testNamedPosition = (positionName: string, depth: number): void => {
    const position = PerftPosition.namedPositions[positionName]
    const expectedNodes = position.nodesByDepth[depth]
    Deno.test(`it finds ${expectedNodes} nodes in position: "${position.name}" position at depth ${depth}`, () => {
        assertEquals(
            new PerftRunner(position.fen).run(depth),
            expectedNodes
        )
    })
}

testNamedPosition('initial', 5)
testNamedPosition('kiwipete', 4)
testNamedPosition('endgame', 6)
testNamedPosition('composed', 5)
testNamedPosition('composed-mirrored', 5)
