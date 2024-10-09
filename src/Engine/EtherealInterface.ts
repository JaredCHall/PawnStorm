import {EngineInterface} from "./EngineInterface.ts";
import { UciEngine } from "./UciEngine.ts";

export class EtherealInterface extends UciEngine implements EngineInterface {

    constructor() {
        super('Ethereal')
    }

    async getEval(): Promise<number> {
        return Promise.reject(new Error('Not supported'))
    }

    async perft(depth: number): Promise<number> {
        await this.writeCommand('perft ' + depth)
        return parseInt(await this.readResponse(/^(\d+)/, true))
    }
}