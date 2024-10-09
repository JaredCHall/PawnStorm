import { Game } from "src/Game/Game.ts";
import { RecordedMove } from "src/Game/RecordedMove.ts";
import {EngineInterface} from "../Engine/EngineInterface.ts";

export class GameAnalyzer {
    constructor(public readonly game: Game) {
    }

    async addEngineEvaluations(engine: EngineInterface): Promise<void> {
        for(const move of this.game.getMoveNavigator().allMoves()) {
            await engine.setFen(move.fen.serialize());
            move.evalValue = await engine.getEval();
        }
    }
}