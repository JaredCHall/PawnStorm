import {PerftRunner} from "./PerftRunner.ts";

//@ts-ignore - this is actually a worker
const worker: Worker = self

worker.onmessage = (event: MessageEvent) => {
    const { fen, depth } = event.data
    const count = new PerftRunner(fen).run(depth, false)
    worker.postMessage( {fen, count})
}