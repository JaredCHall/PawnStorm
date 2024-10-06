import {EngineInterface} from "./EngineInterface.ts";
import { UciEngine } from "./UciEngine.ts";

export class RusticInterface extends UciEngine implements EngineInterface {

    constructor() {
        super('rustic')
    }

    async setSkillLevel(elo: number): Promise<void> {
        return Promise.reject(new Error('Not supported'))
    }

    async getEval(): Promise<number> {
        await this.writeCommand('eval')
        return parseInt(await this.readResponse(/Evaluation:\s+[-]?(\d+)/, true)) / 100
    }

    async perft(depth: number): Promise<number> {
        return Promise.reject(new Error('Not supported in UCI mode'))
    }
}