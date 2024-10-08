import {EngineInterface} from "./EngineInterface.ts";
import {StockfishInterface} from "./StockfishInterface.ts";
import {EtherealInterface} from "./EtherealInterface.ts";
import {RusticInterface} from "./RusticInterface.ts";

export enum EngineType {
    Stockfish,
    Ethereal,
    Rustic
}

export class EngineRegistry
{


    private engines: Record<string, EngineInterface> = {}


    get(name: string): EngineInterface {
        return this.engines[name]
    }

    list(): string[] {
        return Object.keys(this.engines)
    }

    add(name: string, type: EngineType) {
        switch(type){
            case EngineType.Stockfish:
                this.engines[name] = new StockfishInterface()
                break
            case EngineType.Ethereal:
                this.engines[name] = new EtherealInterface()
                break
            case EngineType.Rustic:
                this.engines[name] = new RusticInterface()
                break
        }
    }

}