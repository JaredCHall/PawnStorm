import {PerftCounter} from "./PerftCounter.ts";

export class PerftPosition {


    // results by depth
    readonly results: PerftCounter[] = [
        new PerftCounter(1) // all perft positions have a single node at depth 0
    ]

    constructor(public readonly fen: string) {}

    addResult(result: PerftCounter) {
        this.results.push(result)
    }

    // https://www.chessprogramming.org/Perft_Results#Initial_Position
    static initialPosition(): PerftPosition {
        const position = new PerftPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

        position.addResult(new PerftCounter(20))
        position.addResult(new PerftCounter(400))
        position.addResult(new PerftCounter(8902,34,0,0,0,12))
        position.addResult(new PerftCounter(197281, 1576,0,0,0,469,8))
        position.addResult(new PerftCounter(4865609,82719,258,0,0,27351,347))
        position.addResult(new PerftCounter(119060324,2812008,5248,0,0,809099,10828))
        position.addResult(new PerftCounter(3195901860, 108329926, 319617, 883453, 0, 33103848, 435767))

        return position
    }

    static kiwiPete(): PerftPosition {
        const position = new PerftPosition('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -')

        position.addResult(new PerftCounter(48,8,0,2,0,0,0))
        position.addResult(new PerftCounter(2039,351,1,91,0,3,0))
        position.addResult(new PerftCounter(97862,17102,45,3162,0,993,1))
        position.addResult(new PerftCounter(4085603, 757163,1929,128013,15172,25523,43))
        position.addResult(new PerftCounter(193690690,35043416,73365,4993637,8392,3309887,30171))
        position.addResult(new PerftCounter(8031647685,1558445089,3577504,184513607,56627920,92238050,360003))

        return position
    }

}