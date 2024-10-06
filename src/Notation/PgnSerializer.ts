import {Game} from "../Game/Game.ts";
import {RecordedMove} from "../Game/RecordedMove.ts";
import {PgnTagFormatter} from "./PgnTagFormatter.ts";

export class PgnSerializer {

    withGameTags: boolean = true
    withGlyphs: boolean = true
    withClock: boolean = true
    withEval: boolean = true
    withComments: boolean = true
    withVariations: boolean = true


    constructor(
        private readonly game: Game
    ) {}


    serialize(): string {

        let serialized = ''

        if(this.withGameTags){
            const tags = this.game.allTags()

            for(const tagName in tags){
                const tagValue = tags[tagName].replace('"','')
                serialized += `[${tagName} "${tagValue}"]\n`
            }
            serialized += '\n'
        }

        const navigator = this.game.getMoveNavigator()
        if(navigator.initialComment.length > 0){
            serialized += `{ ${navigator.initialComment} }\n`
        }

        const firstMove = navigator.getFirstMove()
        if(firstMove){
            serialized += this.serializeMoves(firstMove)
        }

        serialized += ' ' + this.game.getTag('Result') ?? PgnTagFormatter.formatResult(this.game.getStatus())
        serialized += '\n'

        return serialized
    }


    serializeMoves(
        firstMove: RecordedMove,
    ): string {
        const renderLine = (move: RecordedMove|null): string => {
            let outLine = ''
            let isFirst = true
            let prevHadChild = false
            while(move != null){
                const includeMoveCounter = isFirst || prevHadChild || move.color == 'white'
                isFirst = false
                prevHadChild = false
                outLine += move.serialize(includeMoveCounter, this.withGlyphs) + ' '
                if(this.withComments){
                    const comments = move.getComments()

                    if(this.withClock && move.clockTime){
                        comments.unshift(`[%clk ${move.clockTime}]`)
                    }

                    if(comments.length > 0){
                        outLine += '{ ' + comments.join(' } { ') + ' } '
                    }
                }
                if(this.withVariations){
                    move.getChildren().forEach((move: RecordedMove) => {
                        prevHadChild = true
                        outLine += '(' + renderLine(move) + ') '
                    })
                }
                move = move.getNext()
            }
            return outLine.trimEnd()
        }
        return renderLine(firstMove)
    }


}