import {Game} from "../Game/Game.ts";
import {GameStatus} from "../Game/GameStatus.ts";
import {RecordedMove} from "../Game/RecordedMove.ts";
import {MoveNavigator} from "../Game/MoveNavigator.ts";

export class PgnParser {


    parse(input: string): Game {
        const lines = input.replace('\r\n','\n').split('\n')

        const game = new Game()
        let foundLastHeader = false
        let moveText = ''
        lines.forEach((line: string) => {
            if(line.charAt(0) === '['){
                const [tagName,tagValue] = this.parseTag(line)
                game.setTag(tagName, tagValue)
                if(tagName == 'FEN'){
                    game.setBoard(tagValue)
                }
            }
            if(!foundLastHeader && line === ''){
                foundLastHeader = true
            }
            if(foundLastHeader && line !== ''){
                moveText += line + " "
            }
        })

        // TODO: Parse move text
        return game

    }


    serialize(game: Game): string {

        let serialized = ''
        const tags = game.allTags()

        for(const tagName in tags){
            const tagValue = tags[tagName].replace('"','')
            serialized += `[${tagName} "${tagValue}"]\n`
        }

        serialized += '\n'
        serialized += this.serializeMoves(game.getMoveNavigator())
        serialized += '\n'

        return serialized
    }


    serializeMoves(moveNavigator: MoveNavigator): string
    {
        const renderLine = (move: RecordedMove|null): string => {
            let outLine = ''
            let isFirst = true
            let prevHadChild = false
            while(move != null){
                const includeMoveCounter = isFirst || prevHadChild || move.color == 'white'
                isFirst = false
                prevHadChild = false
                outLine += move.serialize(includeMoveCounter) + ' '
                move.getChildren().forEach((move: RecordedMove) => {
                    prevHadChild = true
                    outLine += '(' + renderLine(move) + ') '
                })
                move = move.getNext()
            }
            return outLine.trimEnd()
        }
        return renderLine(moveNavigator.getMove(0))
    }


    parseTag(line: string): [string, string] {
        const parts = line.match(/^\[([a-zA-Z0-9]+)\s["']([^"']+)["']]$/)
        if(parts === null){
            throw new Error("Could not parse header line: "+line)
        }
        const key = parts[1] ?? null
        const value = parts[2] ?? null

        return [key, value]
    }

    static formatDateTag(date: Date): string {
        const pad2 = (val: number) => {
            return val.toString().padStart(2, '0')
        }

        const yyyy = date.getUTCFullYear()
        // increment month since index starts at zero for january
        const mm = pad2(date.getUTCMonth() + 1)
        const dd = pad2(date.getUTCDate())

        return `${yyyy}.${mm}.${dd}`
    }

    static formatResultTag(status: GameStatus): string {
        if(status.winner == 'white'){
            return '1-0'
        }
        if(status.winner == 'black'){
            return '0-1'
        }
        if(status.terminationType != 'unterminated'){
            return '1/2-1/2'
        }
        return '*'
    }

}