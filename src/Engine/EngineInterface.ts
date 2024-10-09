export interface EngineInterface {
    isReady(): Promise<boolean>
    setFen(fen: string): Promise<void>
    getBestMove(moveTime: number): Promise<string>
    getEval(): Promise<number>
    perft(depth: number): Promise<number>
    close(): Promise<void>
}