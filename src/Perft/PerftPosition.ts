export class PerftPosition {
    static namedPositions: Record<string, PerftPosition> = {
        'initial': new PerftPosition(
            'initial',
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            [1, 20, 400, 8902, 197281, 4865609, 119060324, 3195901860]
        ),
        'kiwipete': new PerftPosition(
            'kiwipete',
            'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -',
            [1, 48, 2039, 97862, 4085603, 193690690, 8031647685]
        ),
        'endgame': new PerftPosition(
            'endgame',
            '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -',
            [1, 14, 191, 2812, 43238, 674624, 11030083, 178633661, 3009794393]
        ),
        'composed': new PerftPosition(
            'composed',
            'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
            [1, 6, 264, 9467, 422333, 15833292, 706045033]
        ),
        'composed-mirrored': new PerftPosition(
            'composed-mirrored',
            'r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1',
            [1, 6, 264, 9467, 422333, 15833292, 706045033]
        )
    }

    constructor(
        public readonly name: string,
        public readonly fen: string,
        public readonly nodesByDepth: number[]
    ) {
    }
}