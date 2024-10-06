import {EngineInterface} from "./EngineInterface.ts";
import { UciEngine } from "./UciEngine.ts";

export class EtherealInterface extends UciEngine implements EngineInterface {

    constructor() {
        super('Ethereal')
    }

    async setSkillLevel(elo: number): Promise<void> {
        return Promise.reject(new Error('Not supported'))
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
        await this.writeCommand('go depth 10')
        return await this.readResponse(/^bestmove\s+([a-h0-8=NBRQ]+)/, true)
    }

    async getEval(): Promise<number> {
        return Promise.reject(new Error('Not supported'))
    }

    async perft(depth: number): Promise<number> {
        await this.writeCommand('perft ' + depth)
        return parseInt(await this.readResponse(/^(\d+)/, true))
    }
}