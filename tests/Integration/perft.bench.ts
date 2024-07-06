import {PerftRunner} from "../../src/Perft/PerftRunner.ts";

/**
 * Decent benchmarks of move generation logic
 */

Deno.bench('Initial: d3', () => {
    new PerftRunner('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').run(3, false)
})
Deno.bench('Initial: d4', () => {
    new PerftRunner('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').run(4, false)
})
Deno.bench('Initial: d5', () => {
    new PerftRunner('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1').run(5, false)
})

Deno.bench('Kiwipete: d3', () => {
    new PerftRunner('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ').run(3, false)
})

Deno.bench('Kiwipete: d4', () => {
    new PerftRunner('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ').run(4, false)
})

Deno.bench('Position 5: d4', () => {
    new PerftRunner('rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8').run(4, false)
})