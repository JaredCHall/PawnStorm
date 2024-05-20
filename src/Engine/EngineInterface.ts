export interface EngineInterface {
    command: Deno.Command
    process: Deno.ChildProcess
    writer: WritableStreamDefaultWriter
    reader: ReadableStreamDefaultReader

    setFen(fen: string): Promise<void>
    getBestMove(): Promise<string>
    getEval(): Promise<number>
    perft(depth: number): Promise<number>

}