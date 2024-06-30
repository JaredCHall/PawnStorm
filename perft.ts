import {parseArgs} from "https://deno.land/std@0.219.0/cli/parse_args.ts";
import {format} from "https://deno.land/std@0.220.1/fmt/duration.ts";
import {green} from "https://deno.land/std@0.219.1/fmt/colors.ts";
import { PerftRunner } from "./src/Perft/PerftRunner.ts";
import {PerftPosition} from "./src/Perft/PerftPosition.ts";

const args = parseArgs(Deno.args, {
    string: ['depth','fen','position'],
    boolean: ['help']
})

if (args.help) {
    console.log(`
Usage: perft [options]

Options:
  --depth <number>       Set the depth for the perft run (default: 1)
  --fen <string>         Specify the FEN string for the starting position
  --position <name>      Specify a named position (initial, kiwipete, endgame, composed, composed-mirror)

Examples:
  perft --depth 3 --fen "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  perft --position initial --depth 2
  `);
    Deno.exit(0);
}

const depth = parseInt(args.depth ?? '1')
const fen = args.fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const position = args.position ?? null

const getRunner = (): PerftRunner => {
    if(!position){
        return new PerftRunner(fen, true)
    }
    switch(position){
        case 'initial': return new PerftRunner(PerftPosition.initialPosition().fen, true)
        case 'kiwipete': return new PerftRunner(PerftPosition.kiwiPete().fen, true)
        case 'endgame': return new PerftRunner(PerftPosition.endgamePosition().fen, true)
        case 'composed': return new PerftRunner(PerftPosition.composedPosition().fen, true)
        case 'composed-mirror': return new PerftRunner(PerftPosition.composedPositionMirrored().fen, true)
        default: throw new Error(`Unknown perft position: ${position}`)
    }
}

const runner = getRunner()
const counters = runner.run(depth)
const elapsed = format(runner.runTime, {ignoreZero: true})

console.table(runner.getRootNodeCounts())
console.log(`Total Nodes: ${counters.nodes}`)
console.log(green(`RunTime: ${elapsed}`))