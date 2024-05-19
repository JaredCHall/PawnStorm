import {Game} from "../Game/Game.ts";
import {RecordedMove} from "../Game/RecordedMove.ts";
import {PgnTagFormatter} from "./PgnTagFormatter.ts";

export class PgnParser {

    parse(input: string): Game {
        const game = new Game()
        const lines = input.replace(/\r\n/g,'\n').split('\n')

        let originalResultTag = null

        // parse game tags
        let foundLastHeader = false
        let moveText = ''
        lines.forEach((line: string) => {
            if(line.charAt(0) === '['){
                const [tagName,tagValue] = this.#parseTag(line)
                game.setTag(tagName, tagValue)
                if(tagName == 'FEN'){
                    game.setBoard(tagValue)
                }
                if(tagName == 'Result'){
                    originalResultTag = tagValue
                }
            }
            if(!foundLastHeader && line === ''){
                foundLastHeader = true
            }
            if(foundLastHeader && line !== ''){
                moveText += line + " "
            }
        })

        this.#parseMoveText(game, moveText)
        game.gotoMove(-1)

        const result = originalResultTag ?? PgnTagFormatter.formatResult(game.getStatus())
        game.setTag('Result', result)

        return game
    }

    #parseTag(line: string): [string, string] {
        const parts = line.match(/^\[([a-zA-Z0-9]+)\s["']([^"']+)["']]$/)
        if(parts === null){
            throw new Error("Could not parse header line: "+line)
        }
        const key = parts[1] ?? null
        const value = parts[2] ?? null

        return [key, value]
    }

    #parseMoveText(game: Game, moveText: string, depth: number = 0): void {
        let lastMove: RecordedMove|null = game.getMoveNavigator().getLast()
        let content = moveText
        let contentRemaining = moveText
        let position: number = 0
        let char = ''

        const error = (msg: string): void => {
            throw new Error(msg + ` (r: ${depth}) at position ${position}: ${char}${contentRemaining}`)
        }

        const seek = (len: number): string => {
            if(contentRemaining.length < len){
                error('reached EOF. Cannot seek.')
            }

            content = contentRemaining.substring(0, len)
            contentRemaining = contentRemaining.substring(len)
            position += len
            return content
        }

        const seekToCommentEnd = (): string => {
            const commentEndIndex = contentRemaining.indexOf('}')
            if(commentEndIndex === -1){
                error(`Expected ending comment token '}'`)
            }
            if(commentEndIndex === 0){
                return ''
            }

            const someText = seek(commentEndIndex + 1)
            return someText.substring(0, someText.length - 1)
        }

        const seekToVariationEnd = (): string => {
            let variationContent = ''
            let variationOpenTokenCount = 1
            const variationStartPosition = position

            do {
                char = seek(1)
                if(char === ')'){
                    variationOpenTokenCount--
                } else if(char === '('){
                    variationOpenTokenCount++
                }
                if(variationOpenTokenCount !== 0){
                    variationContent += char
                }
            }while(variationOpenTokenCount > 0 && contentRemaining.length > 0)

            if(variationOpenTokenCount > 0){
                error(`Expected variation end token ')' but none found for variation starting at ${variationStartPosition}`)
            }

            return variationContent
        }

        let token = ''

        do {
            //console.log(`r: ${depth}, position: ${position}, token: ${token} remaining: ${contentRemaining}`)
            char = seek(1)
            if(char === '{'){
                const commentText = seekToCommentEnd()
                if(!lastMove){
                    error('Cannot add comment without a move')
                    return
                }
                lastMove.comment = commentText
                continue
            }
            if(char === '('){
                const variationContent = seekToVariationEnd()
                if(!lastMove){
                    error('Cannot add variation without a move')
                    return
                }
                game.gotoMove(lastMove.getPrev()?.getId() ?? -1) // move before variation parent
                this.#parseMoveText(game, variationContent, depth + 1)
                game.gotoMove(lastMove.getId()) // back to move that started the variation
                continue
            }

            if(char === ' ' || contentRemaining.length === 0){

                if(token === ''){
                    continue
                }

                // end on result type tokens
                if(token === '*' || token === '1-0' || token === '0-1' || token === '1/2-1/2'){
                    game.setTag('Result', token)
                    break;
                }

                // filter out move counters, ex: '1.' '12...'
                if(token.match(/^[0-9]+\.+$/)){
                    token = ''
                    continue;
                }

                if(contentRemaining.length === 0){
                    token += char
                }

                const parts = token.match(/^([0-9]+\.+)?([^?!]+)([?!]{1,2})?$/)

                if(!parts){
                    error(`Unrecognized token: ` + token)
                    return
                }

                const notation = parts[2]
                const annotation = parts[3] ?? null

                try{
                    //console.log(moveNotation)
                    lastMove = game.makeMove(notation)
                    // @ts-ignore - regex ensures type compliance
                    lastMove.annotation = annotation
                }catch (e){
                    //console.log(new PgnParser().serializeMoves(game.getMoveNavigator().getMove(0)))
                    let msg = 'Unknown Error'
                    if(e instanceof Error){
                        msg = e.message
                    }
                    error(msg)
                }

                token = ''
                continue
            }
            token += char

        }while(contentRemaining.length > 0)
    }

    serialize(game: Game): string {

        let serialized = ''
        const tags = game.allTags()

        for(const tagName in tags){
            const tagValue = tags[tagName].replace('"','')
            serialized += `[${tagName} "${tagValue}"]\n`
        }

        serialized += '\n'
        serialized += this.serializeMoves(game.getMoveNavigator().getMove(0))
        serialized += ' ' + game.getTag('Result') ?? PgnTagFormatter.formatResult(game.getStatus())
        serialized += '\n'

        return serialized
    }

    serializeMoves(firstMove: RecordedMove): string {
        const renderLine = (move: RecordedMove|null): string => {
            let outLine = ''
            let isFirst = true
            let prevHadChild = false
            while(move != null){
                const includeMoveCounter = isFirst || prevHadChild || move.color == 'white'
                isFirst = false
                prevHadChild = false
                outLine += move.serialize(includeMoveCounter) + ' '
                if(move.comment){
                    outLine += '{' + move.comment + '} '
                }
                move.getChildren().forEach((move: RecordedMove) => {
                    prevHadChild = true
                    outLine += '(' + renderLine(move) + ') '
                })
                move = move.getNext()
            }
            return outLine.trimEnd()
        }
        return renderLine(firstMove)
    }
}