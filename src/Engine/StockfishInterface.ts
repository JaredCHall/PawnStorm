import {EngineInterface} from "./EngineInterface.ts";

export class StockfishInterface implements EngineInterface{

    command: Deno.Command
    process: Deno.ChildProcess
    writer: WritableStreamDefaultWriter
    reader: ReadableStreamDefaultReader
    constructor() {
        this.command = new Deno.Command('stockfish', {
            stdin: "piped",
            stdout: "piped",
            stderr: "piped",
        })
        this.process = this.command.spawn()
        this.writer = this.process.stdin.getWriter()
        this.reader = this.process.stdout.getReader()
    }

    async setFen(fen: string): Promise<void> {
        await this.writer.write(new TextEncoder().encode('position + fen'))
        this.writer.releaseLock()

        const output = await this.reader.read()
        const decoded = new TextDecoder().decode(output.value)

    }

    getBestMove(): Promise<string> {
        return new Promise(() => 'a')
    }

    getEval(): Promise<number> {
        return new Promise(() => 0)
    }

    perft(depth: number): Promise<number> {
        return new Promise(() => 0)
    }

}