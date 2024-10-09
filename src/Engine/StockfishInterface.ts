import {EngineInterface} from "./EngineInterface.ts";
import { UciEngine } from "./UciEngine.ts";

export class StockfishInterface extends UciEngine implements EngineInterface {

    constructor() {
        super('stockfish')
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