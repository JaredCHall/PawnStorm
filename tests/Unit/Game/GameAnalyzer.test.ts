import {assertEquals} from "@std/assert";
import {describe, it} from "@std/testing/bdd"
import {Game} from "../../../src/Game/Game.ts";
import {GameAnalyzer} from "../../../src/Game/GameAnalyzer.ts";


class MockEngine {
    async isReady() {return true}
    async setFen(fen: string){return}
    async getBestMove(moveTime: number){return 'e4'}
    async getEval(){return 0}
    async perft(depth: number){return 0}
    async close() { return}
}


describe("GameAnalyzer", () => {

    it('adds engine evals', async () => {

        const game = new Game()
        const engine = new MockEngine()

        game.makeMove('e4')
        const variationStart =game.makeMove('e5')
        game.makeMove('Nf3')
        game.makeMove('Nf6')
        game.gotoMove(variationStart.getId())
        game.makeMove('d4')
        game.makeMove('exd4')
        game.makeMove('c3')

        const analyzer = new GameAnalyzer(game)

        let cnt = 0
        const values = [0,0.1,0.15,0.25,-.12, -.15, .03]

        engine.getEval = async (): Promise<number> => {
            const evalValue = values[cnt]
            cnt++
            return evalValue
        }

        await analyzer.addEngineEvaluations(engine)
        await engine.close()

        const moves = game.getMoveNavigator().allMoves()
        assertEquals(moves[0].evalValue ?? 0,0, '1. e4 has expected eval')
        assertEquals(moves[1].evalValue ?? 0,0.1, '1... e5 has expected eval')
        assertEquals(moves[2].evalValue ?? 0,0.15, '2. Nf3 has expected eval')
        assertEquals(moves[3].evalValue ?? 0,0.25, '2. d4 has expected eval')
        assertEquals(moves[4].evalValue ?? 0,-0.12, '2... exd4 has expected eval')
        assertEquals(moves[5].evalValue ?? 0,-0.15, '3. c3 has expected eval')
        assertEquals(moves[6].evalValue ?? 0,0.03, '2... Nf6 has expected eval')

    })
})