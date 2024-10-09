import {assertEquals,assertAlmostEquals, assertRejects} from "@std/assert";
import {describe, it} from "@std/testing/bdd"
import { EtherealInterface } from "../../src/Engine/EtherealInterface.ts";
import {Game} from "../../src/Game/Game.ts";
import { StockfishInterface } from "../../src/Engine/StockfishInterface.ts";
import {GameAnalyzer} from "../../src/Game/GameAnalyzer.ts";
import {RusticInterface} from "../../src/Engine/RusticInterface.ts";

describe("Engines", () => {

    describe('EtherealInterface', () => {
        it('it consults engine on next best move', async () => {
            const engine = new EtherealInterface()
            await engine.setFen('6k1/pp4pp/4p3/Pb1p4/1P2B3/RNP1q2P/4R1Pb/3QK3 b - - 0 29')

            assertEquals(await engine.isReady(), true)
            assertEquals(await engine.getBestMove(), 'h2g3')
            await engine.close()
        })

        it('it throws on evaluates a position', async () => {
            const engine = new EtherealInterface()
            await engine.setFen('rn1qkbnr/1p3ppp/2p1p3/1p1pP3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8')

            assertEquals(await engine.isReady(), true)
            assertRejects(async () => {
                await engine.getEval()
            })
            await engine.close()
        })

        it('it runs perft for a position', async () => {
            const engine = new EtherealInterface()
            await engine.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

            assertEquals(await engine.isReady(), true)
            assertEquals(await engine.perft(5), 4865609, 'Calculates perft5 correct')
            await engine.close()
        })
    })

    describe('Rustic', () => {

        it('it consults engine on next best move', async () => {
            const engine = new RusticInterface()
            await engine.setFen('6k1/pp4pp/4p3/Pb1p4/1P2B3/RNP1q2P/4R1Pb/3QK3 b - - 0 29')

            assertEquals(await engine.isReady(), true)
            const move = await engine.getBestMove()
            assertEquals(move, 'h2g3')
            await engine.close()
        })

        it('it throws on perft', async () => {
            const engine = new RusticInterface()
            await engine.setFen('rn1qkbnr/1p3ppp/2p1p3/1p1pP3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8')

            assertEquals(await engine.isReady(), true)

            assertRejects(async () => {
                await engine.perft(5)
            })
            await engine.close()
        })

        it('it evaluates a position', async () => {
            const engine = new RusticInterface()
            await engine.setFen('rn1qkbnr/1p3ppp/2p1p3/1p1pP3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8')

            assertEquals(await engine.isReady(), true)
            const evalValue = await engine.getEval()
            assertAlmostEquals(evalValue, 0.70,0.1, 'Evaluates position as ~ +0.7') // this differs from stockfish's evaluation of the position
            await engine.close()
        })


    })

    describe('Stockfish', () => {
        it('it consults engine on next best move', async () => {
            const engine = new StockfishInterface()
            await engine.setFen('6k1/pp4pp/4p3/Pb1p4/1P2B3/RNP1q2P/4R1Pb/3QK3 b - - 0 29')

            assertEquals(await engine.isReady(), true)
            const move = await engine.getBestMove()
            assertEquals(move, 'h2g3')
            await engine.close()
        })

        it('it evaluates a position', async () => {
            const engine = new StockfishInterface()
            await engine.setFen('rn1qkbnr/1p3ppp/2p1p3/1p1pP3/3P4/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 8')

            assertEquals(await engine.isReady(), true)
            const evalValue = await engine.getEval()
            assertAlmostEquals(evalValue, 0.51,0.1, 'Evaluates position as ~ +0.5')
            await engine.close()
        })

        it('it runs perft for a position', async () => {
            const engine = new StockfishInterface()
            await engine.setFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

            assertEquals(await engine.isReady(), true)
            const perftNodes = await engine.perft(5)
            assertEquals(perftNodes, 4865609, 'Calculates perft5 correct')
            await engine.close()
        })
    })

    it('adds evaluations', async () => {

        const game = new Game()
        const engine = new StockfishInterface()

        game.makeMove('e4')
        const variationStart =game.makeMove('e5')
        game.makeMove('Nf3')
        game.makeMove('Nf6')
        game.gotoMove(variationStart.getId())
        game.makeMove('d4')
        game.makeMove('exd4')
        game.makeMove('c3')

        const analyzer = new GameAnalyzer(game)

        await analyzer.addEngineEvaluations(engine)
        await engine.close()

        const moves = game.getMoveNavigator().allMoves()

        assertAlmostEquals(moves[0].evalValue ?? 0,0.34, 0.02, '1. e4 has expected eval')
        assertAlmostEquals(moves[1].evalValue ?? 0,0.13, 0.02, '1... e5 has expected eval')
        assertAlmostEquals(moves[2].evalValue ?? 0,0.21, 0.02, '2. Nf3 has expected eval')
        assertAlmostEquals(moves[3].evalValue ?? 0,0.31, 0.02, '2. d4 has expected eval')
        assertAlmostEquals(moves[4].evalValue ?? 0,-0.04, 0.02, '2... exd4 has expected eval')
        assertAlmostEquals(moves[5].evalValue ?? 0,-0.04, 0.02, '3. c3 has expected eval')
        assertAlmostEquals(moves[6].evalValue ?? 0,0.16, 0.02, '2... Nf6 has expected eval')

    })


})