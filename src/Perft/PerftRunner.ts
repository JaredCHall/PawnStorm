import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
export class PerftRunner {

    readonly factory: MoveFactory
    readonly startFen: string

    private rootCounters: Record<string, number> = {}
    private runTime: number = 0// milliseconds

    constructor(startFen: string) {
        this.startFen = startFen
        this.factory = new MoveFactory()
        this.factory.setFromFenNumber(startFen)
        this.factory.evaluateCheckAndMate = false
    }

    getRootNodeCounts(): Record<string, number> {
        return this.rootCounters
    }

    getTotalNodes(): number
    {
        let total = 0
        for(const i in this.rootCounters){
            total += this.rootCounters[i]
        }
        return total
    }

    getRunTime(): number
    {
        return this.runTime
    }

    run(depth: number=0): number
    {
        const start = (new Date()).getTime()

        const n_moves = this.factory.getLegalMoves()
        n_moves.forEach((rootMove: BitMove) => {
            const notation = rootMove.serialize()
            this.rootCounters[notation] = 0
            this.factory.makeMove(rootMove)
            this.perft(depth - 1, notation)
            this.factory.unmakeMove(rootMove)
        })
        this.runTime = new Date().getTime() - start

        return this.getTotalNodes()
    }

    perft(depth: number = 0, rootMoveNotation: string): void
    {
        if(depth == 0){
            this.rootCounters[rootMoveNotation]++
            return
        }
        const n_moves = this.factory.getLegalMoves()
        n_moves.forEach((move: BitMove) => {
            this.factory.makeMove(move)
            this.perft(depth -1, rootMoveNotation)
            this.factory.unmakeMove(move)
        })

        return
    }
}