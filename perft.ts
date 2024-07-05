import {parseArgs} from "https://deno.land/std@0.219.0/cli/parse_args.ts";
import {format} from "https://deno.land/std@0.220.1/fmt/duration.ts";
import {brightRed, green} from "https://deno.land/std@0.219.1/fmt/colors.ts";
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
const fen = args.fen ?? null
const position = args.position ?? null

let expectedNodes: number|null = null // for named positions, we have a list of expectations

const getRunner = (): PerftRunner => {
    if(fen){
        return new PerftRunner(fen)
    }

    const namedPosition = PerftPosition.namedPositions[position ?? 'initial'] ?? null
    if(!namedPosition){
        throw new Error(`Unknown named position: ${position}`)
    }
    expectedNodes = namedPosition.nodesByDepth[depth] ?? null
    return new PerftRunner(namedPosition.fen)
}

const runner = getRunner()
const totalNodes = runner.run(depth)
const elapsed = format(runner.getRunTime(), {ignoreZero: true})

console.table(runner.getRootNodeCounts()) // print a table of node counts by root moves, useful for debugging
console.log(`Total Nodes: ${totalNodes}`)
if(expectedNodes){
    console.log(expectedNodes == totalNodes ? green(`Matches expectation`) : brightRed(`Does not match expectation`))
}
console.log(green(`RunTime: ${elapsed}`))
