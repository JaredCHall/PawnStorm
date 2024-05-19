import {GameStatus} from "../Game/GameStatus.ts";

export class PgnTagFormatter {

    static formatDate(date: Date): string {
        const pad2 = (val: number) => {
            return val.toString().padStart(2, '0')
        }

        const yyyy = date.getUTCFullYear()
        // increment month since index starts at zero for january
        const mm = pad2(date.getUTCMonth() + 1)
        const dd = pad2(date.getUTCDate())

        return `${yyyy}.${mm}.${dd}`
    }

    static formatResult(status: GameStatus): string {
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