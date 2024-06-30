import {DetailedCounter} from "./Counters/DetailedCounter.ts";

export class PerftPosition {


    // results by depth
    readonly results: DetailedCounter[] = [
        new DetailedCounter(1) // all perft positions have a single node at depth 0
    ]

    constructor(public readonly fen: string) {}

    addResult(result: DetailedCounter) {
        this.results.push(result)
    }

    // https://www.chessprogramming.org/Perft_Results#Initial_Position
    static initialPosition(): PerftPosition {
        const position = new PerftPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

        position.addResult(new DetailedCounter(20))
        position.addResult(new DetailedCounter(400))
        position.addResult(new DetailedCounter(8902,34,0,0,0,12))
        position.addResult(new DetailedCounter(197281, 1576,0,0,0,469,8))
        position.addResult(new DetailedCounter(4865609,82719,258,0,0,27351,347))
        position.addResult(new DetailedCounter(119060324,2812008,5248,0,0,809099,10828))
        position.addResult(new DetailedCounter(3195901860, 108329926, 319617, 883453, 0, 33103848, 435767))

        return position
    }

    static kiwiPete(): PerftPosition {
        const position = new PerftPosition('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -')

        position.addResult(new DetailedCounter(48,8,0,2,0,0,0))
        position.addResult(new DetailedCounter(2039,351,1,91,0,3,0))
        position.addResult(new DetailedCounter(97862,17102,45,3162,0,993,1))
        position.addResult(new DetailedCounter(4085603, 757163,1929,128013,15172,25523,43))
        position.addResult(new DetailedCounter(193690690,35043416,73365,4993637,8392,3309887,30171))
        position.addResult(new DetailedCounter(8031647685,1558445089,3577504,184513607,56627920,92238050,360003))

        return position
    }

    static endgamePosition(): PerftPosition {
        const position = new PerftPosition('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -')

        position.addResult(new DetailedCounter(14, 1, 0 , 0, 0, 2))
        position.addResult(new DetailedCounter(191, 14, 0,0,0, 10))
        position.addResult(new DetailedCounter(2812,209,2,0,0,267,0))
        position.addResult(new DetailedCounter(43238, 3348, 123, 0,0,1680, 17))
        position.addResult(new DetailedCounter(674624, 52051, 1165, 0,0,52950, 0))
        position.addResult(new DetailedCounter(11030083, 940350, 33325, 0, 7552, 452473, 2733))
        position.addResult(new DetailedCounter(178633661, 14519036, 294874, 0, 140024, 12797406, 87))
        position.addResult(new DetailedCounter(3009794393, 267586558, 8009239, 0, 6578076, 135626805, 450410))

        return position
    }

    static composedPosition(): PerftPosition {
        const position = new PerftPosition('r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1')

        position.addResult(new DetailedCounter(6))
        position.addResult(new DetailedCounter( 264, 87,0,6,48,10,0))
        position.addResult(new DetailedCounter(9467,1021,4,0,120,38,22))
        position.addResult(new DetailedCounter(422333,131393,0,7795,60032,15492,5))
        position.addResult(new DetailedCounter(15833292,2046173,6512,0,329464,200568,50562))
        position.addResult(new DetailedCounter(706045033,270369132,212,10882006,81102984,26973664,81076))

        return position
    }

    // This is the mirrored image of position 4
    static composedPositionMirrored(): PerftPosition {
        const position = new PerftPosition('r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1')

        position.addResult(new DetailedCounter(6))
        position.addResult(new DetailedCounter( 264, 87,0,6,48,10,0))
        position.addResult(new DetailedCounter(9467,1021,4,0,120,38,22))
        position.addResult(new DetailedCounter(422333,131393,0,7795,60032,15492,5))
        position.addResult(new DetailedCounter(15833292,2046173,6512,0,329464,200568,50562))
        position.addResult(new DetailedCounter(706045033,270369132,212,10882006,81102984,26973664,81076))

        return position
    }

}