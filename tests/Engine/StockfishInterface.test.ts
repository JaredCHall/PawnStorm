import {StockfishInterface} from "../../src/Engine/StockfishInterface.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";
import {assertAlmostEquals} from "https://deno.land/std@0.219.0/assert/assert_almost_equals.ts";

Deno.test('it consults engine on next best move', async () => {
    const stockfish = new StockfishInterface()
    await stockfish.setFen('6k1/pp4pp/4p3/Pb1p4/1P2B3/RNP1q2P/4R1Pb/3QK3 b - - 0 29')

    assertEquals(await stockfish.isReady(), true)
    const move = await stockfish.getBestMove()
    assertEquals(move, 'h2g3')
    await stockfish.close()
})

Deno.test('it evaluates a position', async () => {
    const stockfish = new StockfishInterface()
    await stockfish.setFen('rn1qkbnr/1p3ppp/2p1p3/1p1pP3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8')

    assertEquals(await stockfish.isReady(), true)
    const evalValue = await stockfish.getEval()
    assertAlmostEquals(evalValue, 0.51,0.1, 'Evaluates position as ~ +0.5')
    await stockfish.close()
})

Deno.test('it runs perft for a position', async () => {
    const stockfish = new StockfishInterface()
    await stockfish.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

    assertEquals(await stockfish.isReady(), true)
    const perftNodes = await stockfish.perft(5)

    assertEquals(perftNodes, 4865909, 'Calculates perft5 correct')

    console.log(perftNodes)

    await stockfish.close()
})