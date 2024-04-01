import {MoveFactory} from "../MoveFactory.ts";
import {PerftCounter} from "./PerftCounter.ts";
import {Move} from "../Move.ts";

export class PerftRunner {

    factory: MoveFactory
    counter: PerftCounter
    runTime: number = 0// milliseconds

    constructor(startFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        this.factory = new MoveFactory()
        this.factory.setFromFenNumber(startFen)
        this.factory.options.evaluateChecksAndMates = true
        this.counter = new PerftCounter()
    }

    run(depth: number=0): PerftCounter
    {
        if(depth === 0){
            this.counter.nodes++
            return this.counter
        }
        const start = (new Date()).getTime()
        this.perft(depth)
        this.runTime = new Date().getTime() - start

        return this.counter
    }

    perft(depth: number = 0, lastMove: null|Move = null): void
    {
        if(depth === 0 && lastMove){
            this.counter.update(lastMove)
            return
        }
        const n_moves = this.factory.getLegalMoves()

        n_moves.forEach((move: Move) => {
            this.factory.makeMove(move)
            this.perft(depth -1, move)
            this.factory.unmakeMove(move)
        })

        return
    }
}