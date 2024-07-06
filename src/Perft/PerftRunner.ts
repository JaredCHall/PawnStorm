import {MoveFactory} from "../MoveGen/MoveFactory.ts";
export class PerftRunner {

    readonly factory: MoveFactory

    private rootNodes: Record<string, number> = {}
    private runTime: number = 0// milliseconds

    constructor(
        readonly startFen: string,
    ) {
        this.factory = new MoveFactory()
        this.factory.setFromFenNumber(startFen)
        this.factory.evaluateCheckAndMate = false
    }

    getRootNodes(): Record<string, number> {
        return this.rootNodes
    }

    getTotalNodes(): number {
        let total = 0
        for(const i in this.rootNodes){
            total += this.rootNodes[i]
        }
        return total
    }

    getRunTime(): number {
        return this.runTime
    }

    async runAsync(depth: number=0): Promise<number> {

        console.log('running root nodes in parallel')

        const start = (new Date()).getTime();
        const n_moves = this.factory.getLegalMoves();

        const promises = n_moves.map((move) => {
            this.factory.makeMove(move)
            const fen = this.factory.getFenNumber().serialize()
            this.factory.unmakeMove(move)
            return this.spawnPerftWorker(fen, depth - 1)
        });

        const results = await Promise.all(promises);

        results.forEach( (count, i) => {
            const notation = n_moves[i].serialize();
            this.rootNodes[notation] = count;
        });

        this.runTime = new Date().getTime() - start;
        return this.getTotalNodes();
    }

    async spawnPerftWorker(fen: string, depth: number = 0): Promise<number> {
        const worker = new Worker(new URL("./perft.worker.ts", import.meta.url).href, { type: "module" });

        return new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                resolve(event.data);
                worker.terminate();
            };
            worker.onerror = (error) => {
                reject(error);
                worker.terminate();
            };
            worker.postMessage({ fen, depth });
        });
    }

    run(depth: number=0, eachRoot: boolean = true): number {

        if(depth == 0){
            return 1
        }

        if(!eachRoot){
            return this.perft(depth)
        }

        const start = (new Date()).getTime()
        const n_moves = this.factory.getLegalMoves()
        for(const i in n_moves){
            const move = n_moves[i]
            this.factory.makeMove(move)
            const runner = new PerftRunner(this.factory.getFenNumber().serialize())
            this.rootNodes[move.serialize()] = runner.run(depth - 1, false)
            this.factory.unmakeMove(move)
        }
        this.runTime = new Date().getTime() - start

        return this.getTotalNodes()
    }

    perft(depth: number = 0, currentCount: number = 0): number
    {
        const n_moves = this.factory.getLegalMoves()
        for(const i in n_moves){

            if(depth == 1){
                currentCount++
                continue
            }
            this.factory.makeMove(n_moves[i])
            currentCount = this.perft(depth -1, currentCount)
            this.factory.unmakeMove(n_moves[i])
        }

        return currentCount
    }
}