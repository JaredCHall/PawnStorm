import {EngineInterface} from "./EngineInterface.ts";
import { UciEngine } from "./UciEngine.ts";

export class StockfishInterface extends UciEngine implements EngineInterface {

    constructor() {
        super('stockfish')
    }

    async isReady(): Promise<boolean> {
        await this.writeCommand('isready')

        const response = await this.readResponse('readyok')

        return response.includes('readyok')
    }

    async setFen(fen: string): Promise<void> {
        await this.writeCommand('ucinewgame')
        await this.writeCommand('position fen ' + fen)
    }

    async getBestMove(): Promise<string> {
        await this.writeCommand('go depth 6')

        return await this.readValueFromExpectedLine('bestmove ', /^bestmove\s+([a-h0-8=NBRQ]+)/)
    }

    async getEval(): Promise<number> {
        await this.writeCommand('eval')
        const evalValue = await this.readValueFromExpectedLine('Final evaluation', /^Final evaluation\s+([-+][0-9.]+)/)
        return parseFloat(evalValue)
    }

    async perft(depth: number): Promise<number> {
        await this.writeCommand('go perft ' + depth)
        const response = await this.readValueFromExpectedLine('Nodes searched: ',/^Nodes searched:\s+([0-9]+)/)
        return parseInt(response)
    }
}