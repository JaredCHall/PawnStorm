import {EngineInterface} from "./EngineInterface.ts";
import { UciEngine } from "./UciEngine.ts";

export class StockfishInterface extends UciEngine implements EngineInterface {

    constructor() {
        super('stockfish')
    }

    async isReady(): Promise<boolean> {
        await this.writeCommand('isready')
        await this.readResponse(/^(readyok)/, true)
        return true
    }

    async setFen(fen: string): Promise<void> {
        await this.writeCommand('ucinewgame')
        await this.writeCommand('position fen ' + fen)
    }

    async getBestMove(): Promise<string> {
        await this.writeCommand('go depth 6')
        return await this.readResponse(/^bestmove\s+([a-h0-8=NBRQ]+)/, true)
    }

    async getEval(): Promise<number> {
        await this.writeCommand('eval')
        return parseFloat(await this.readResponse(/^Final evaluation\s+([-+][0-9.]+)/, true))
    }

    async perft(depth: number): Promise<number> {
        await this.writeCommand('go perft ' + depth)
        return parseInt(await this.readResponse(/^Nodes searched:\s+([0-9]+)/, true))
    }
}