import {PerftRunner} from "../src/Perft/PerftRunner.ts";
import {StockfishInterface} from "../src/Engine/StockfishInterface.ts";
import {buildStandardBoard as build_deno_chess_board} from "https://deno.land/x/chess@0.6.0/src/core/logic/boardLayouts/buildStandardBoard.ts";
import {perft as deno_chess_perft} from "https://deno.land/x/chess@0.6.0/src/core/logic/perft.ts"
import {Chess as ChessJS} from "https://raw.githubusercontent.com/jhlywa/chess.js/52f7579e927fb4bd2d51f3d3f07e7d2200770ddd/src/chess.ts"
import { EtherealInterface } from "src/Engine/EtherealInterface.ts";

/**
 * How fast is it compared to other engines?
 */

const perftRunner = new PerftRunner('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
Deno.bench('PawnStorm Perft5', {group: 'perft5', baseline: true}, () => {
    perftRunner.run(5, false)
})

const denoChessBoard = build_deno_chess_board()
Deno.bench('DenoChess Perft5', {group: 'perft5'},  () => {
    deno_chess_perft(denoChessBoard, 5)
})

const chessJSBoard = new ChessJS
Deno.bench('ChessJS Perft5', {group: 'perft5'},  () => {
    chessJSBoard.perft(5)
})

const stockfish = new StockfishInterface()
Deno.bench('Stockfish Perft5', {group: 'perft5'}, async () => {
    await stockfish.perft(5)
})

const ethereal = new EtherealInterface()
Deno.bench('Ethereal Perft5', {group: 'perft5'}, async () => {
    await ethereal.perft(5)
})