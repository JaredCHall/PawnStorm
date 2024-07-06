import {parseArgs} from "https://deno.land/std@0.219.0/cli/parse_args.ts";
import {format} from "https://deno.land/std@0.220.1/fmt/duration.ts";
import {green} from "https://deno.land/std@0.219.1/fmt/colors.ts";
import { PerftRunner } from "./src/Perft/PerftRunner.ts";

const args = parseArgs(Deno.args, {
    string: ['depth','fen','parallel'],
    boolean: ['help']
})

if (args.help) {
    console.log(`
Usage: perft [options]

Options:
  --depth <number>       Set the depth for the perft run (default: 1)
  --fen <string>         Specify the FEN string for the starting position
  --parallel <count>     Run in parallel threads. <count> (optional) sets the maximum concurrency

Examples:
  perft --depth 3 --fen "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  perft --position initial --depth 2
  `);
    Deno.exit(0);
}

const depth = parseInt(args.depth ?? '1')
const fen = args.fen ?? null
const parallel: boolean = args.parallel !== undefined
let maxThreads: number|null = typeof args.parallel == 'string' ? parseInt(args.parallel) : null

if(parallel && !maxThreads){
    maxThreads = 4
}

const runner = new PerftRunner(fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
const totalNodes = parallel ? await runner.runAsync(depth, maxThreads) : runner.run(depth)
const elapsed = format(runner.getRunTime(), {ignoreZero: true})

console.table(runner.getRootNodes()) // print a table of node counts by root moves, useful for debugging
console.log(`Total Nodes: ${totalNodes}`)
console.log(green(`RunTime: ${elapsed}`))
