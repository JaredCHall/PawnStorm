import {Game} from "../Game/Game.ts";
import {GameStatus} from "../Game/GameStatus.ts";

// http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm
export class PgnFile {

    private gameTags: {[key: string]: string} = {}

    private moveText: string = ''

    static fromGame(game: Game): PgnFile
    {
        const file = new PgnFile()
        file.moveText = game.getMoveNavigator().serialize()
        file.gameTags = game.allTags()

        return file
    }

    // throws
    toGame(): Game
    {
        const game = new Game(this.gameTags['FEN'] ?? null)

        // TODO: morph this into a game with all moves recorded and set to the initial position

        
        return game
    }

    serialize(): string{
        let serialized = ''

        for(const tagName in this.gameTags){
            const tagValue = this.gameTags[tagName]
            serialized += `[${tagName} "${tagValue}"]\n`
        }

        serialized += '\n'
        serialized += this.moveText
        serialized += '\n'

        return serialized
    }

    parseTag(line: string): [string, string] {
        const parts = line.match(/^\[([a-zA-Z0-9]+)\s["']([^"']+)["']]$/)
        if(parts === null){
            throw new Error("Could not parse header line: "+line)
        }
        const key = parts[1] ?? null
        const value = parts[2] ?? null

        this.gameTags[key] = value

        return [key, value]
    }

    static parse(fileContent: string): PgnFile {

        const lines = fileContent.replace('\r\n','\n').split('\n')

        const file = new PgnFile()

        let foundLastHeader = false
        lines.forEach((line: string) => {
            if(line.charAt(0) === '['){
               file.parseTag(line)
            }
            if(!foundLastHeader && line === ''){
                foundLastHeader = true
            }
            if(foundLastHeader && line !== ''){
                file.moveText += line + " "
            }
        })

        return file
    }

    static formatDateTag(date: Date): string
    {
        const pad2 = (val: number) => {
            return val.toString().padStart(2, '0')
        }

        const yyyy = date.getUTCFullYear()
        // increment month since index starts at zero for january
        const mm = pad2(date.getUTCMonth() + 1)
        const dd = pad2(date.getUTCDate())

        return `${yyyy}.${mm}.${dd}`
    }

    static formatResultTag(status: GameStatus): string
    {
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