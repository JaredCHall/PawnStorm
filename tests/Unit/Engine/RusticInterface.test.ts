import {assertEquals, assertRejects, assertAlmostEquals} from "@std/assert";
import {RusticInterface} from "../../../src/Engine/RusticInterface.ts";

Deno.test('it consults engine on next best move', async () => {
    const engine = new RusticInterface()
    await engine.setFen('6k1/pp4pp/4p3/Pb1p4/1P2B3/RNP1q2P/4R1Pb/3QK3 b - - 0 29')

    assertEquals(await engine.isReady(), true)
    const move = await engine.getBestMove()
    assertEquals(move, 'h2g3')
    await engine.close()
})

Deno.test('it throws on perft', async () => {
    const engine = new RusticInterface()
    await engine.setFen('rn1qkbnr/1p3ppp/2p1p3/1p1pP3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8')

    assertEquals(await engine.isReady(), true)

    assertRejects(async () => {
        await engine.perft(5)
    })
    await engine.close()
})

Deno.test('it evaluates a position', async () => {
    const stockfish = new RusticInterface()
    await stockfish.setFen('rn1qkbnr/1p3ppp/2p1p3/1p1pP3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8')

    assertEquals(await stockfish.isReady(), true)
    const evalValue = await stockfish.getEval()
    assertAlmostEquals(evalValue, 0.70,0.1, 'Evaluates position as ~ +0.7') // this differs from stockfish's evaluation of the position
    await stockfish.close()
})