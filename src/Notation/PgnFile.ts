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
        file.gameTags = {
            Event: 'Casual Game',
            Site: '?',
            Date: file.#formatDateHeader(new Date()),
            Round: '1',
            White: '?',
            Black: '?',
            Result: file.#formatResultHeader(game.getStatus())
        }

        return file
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

    parse(fileContent: string): PgnFile {
        return new PgnFile()
    }

    #formatDateHeader(date: Date): string
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

    #formatResultHeader(status: GameStatus): string
    {
        if(status.winner === 'white'){
            return '1-0'
        }
        if(status.winner === 'black'){
            return '0-1'
        }
        if(status.terminationType != 'unterminated'){
            return '1/2-1/2'
        }
        return '*'
    }

}