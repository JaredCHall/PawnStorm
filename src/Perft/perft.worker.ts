import {PerftRunner} from "./PerftRunner.ts";

self.onmessage = (event: MessageEvent) => {
    const { fen, depth } = event.data

    const result = new PerftRunner(fen).run(depth, false)

    self.postMessage( result)
}