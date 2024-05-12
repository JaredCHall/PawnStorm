import {parseArgs} from "https://deno.land/std@0.219.0/cli/parse_args.ts";
import {format} from "https://deno.land/std@0.220.1/fmt/duration.ts";
import {green} from "https://deno.land/std@0.219.1/fmt/colors.ts";
import { PerftRunner } from "./src/Perft/PerftRunner.ts";
import {PerftPosition} from "./src/Perft/PerftPosition.ts";


const args = parseArgs(Deno.args, {
    string: ['depth','fen','position']
})
const depth = parseInt(args.depth ?? '1')
const fen = args.fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
const position = args.position ?? null

const getRunner = (): PerftRunner => {
    if(!position){
        return new PerftRunner(fen)
    }
    switch(position){
        case 'initial': return new PerftRunner(PerftPosition.initialPosition().fen)
        case 'kiwipete': return new PerftRunner(PerftPosition.kiwiPete().fen)
        case 'endgame': return new PerftRunner(PerftPosition.endgamePosition().fen)
        case 'composed': return new PerftRunner(PerftPosition.composedPosition().fen)
        case 'composed-mirror': return new PerftRunner(PerftPosition.composedPositionMirrored().fen)
        default: throw new Error(`Unknown perft position: ${position}`)
    }
}

const runner = getRunner()
const counters = runner.run(depth)
const elapsed = format(runner.runTime, {ignoreZero: true})
console.table(counters)
console.log(green(`RunTime: ${elapsed}`))