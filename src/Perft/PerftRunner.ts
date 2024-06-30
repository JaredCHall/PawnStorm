import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {DetailedCounter} from "./Counters/DetailedCounter.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {CounterInterface} from "./Counters/CounterInterface.ts";
import {NodeCounter} from "./Counters/NodeCounter.ts";
export class PerftRunner {

    factory: MoveFactory
    counter: CounterInterface
    runTime: number = 0// milliseconds
    rootCounters: Record<string, CounterInterface> = {}
    readonly startFen: string
    readonly nodesOnly: boolean

    constructor(startFen: string, nodesOnly: boolean = false) {
        this.startFen = startFen
        this.nodesOnly = nodesOnly
        this.factory = new MoveFactory()
        this.factory.setFromFenNumber(startFen)
        this.counter = this.newCounter()
    }

    getRootNodeCounts(): Record<string, number> {
        const mappedCounters: Record<string, number> = {}
        for(const i in this.rootCounters) {
            mappedCounters[i] = this.rootCounters[i].nodes
        }
        return mappedCounters
    }

    newCounter(): CounterInterface {
        return this.nodesOnly ? new NodeCounter() : new DetailedCounter()
    }

    run(depth: number=0): CounterInterface
    {
        const start = (new Date()).getTime()

        const n_moves = this.factory.getLegalMoves()
        n_moves.forEach((move: BitMove) => {
            const rootCounter = this.newCounter()
            this.rootCounters[move.serialize()] = rootCounter
            this.factory.makeMove(move)
            this.perft(depth - 1, rootCounter, move)
            this.factory.unmakeMove(move)
        })
        this.runTime = new Date().getTime() - start

        let counter: CounterInterface = this.newCounter()
        for(const i in this.rootCounters) {
            counter = counter.merge(this.rootCounters[i])
        }
        this.counter = counter

        return counter
    }

    perft(depth: number = 0, counter: CounterInterface, lastMove: null|BitMove = null): void
    {
        if(depth == 0 && lastMove){
            counter.update(lastMove)
            return
        }
        const n_moves = this.factory.getLegalMoves()
        n_moves.forEach((move: BitMove) => {
            this.factory.makeMove(move)
            this.perft(depth -1, counter, move)
            this.factory.unmakeMove(move)
        })

        return
    }
}