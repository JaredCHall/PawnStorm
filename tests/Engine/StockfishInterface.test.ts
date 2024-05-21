import {StockfishInterface} from "../../src/Engine/StockfishInterface.ts";
import {assertEquals} from "https://deno.land/std@0.219.0/assert/assert_equals.ts";

Deno.test('it consults engine on next best move', async () => {

    const stockfish = new StockfishInterface()
    await stockfish.setFen('6k1/pp4pp/4p3/Pb1p4/1P2B3/RNP1q2P/4R1Pb/3QK3 b - - 0 29')

    assertEquals(await stockfish.isReady(), true)
    const move = await stockfish.getBestMove()
    assertEquals(move, 'h2g3')
    await stockfish.close()
})