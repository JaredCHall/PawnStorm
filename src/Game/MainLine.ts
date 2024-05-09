import {RecordedMove} from "./RecordedMove.ts";

export class MainLine {

    readonly moves: RecordedMove[] = []; // always only mainline moves

    private byCursor: RecordedMove[] = []; // all moves including within variations indexed by when they were added to the list

    private cursor: number = -1

    addMove(move: RecordedMove, isNewVariation: boolean = false): void
    {
        this.cursor++
        if(isNewVariation){
            const current = this.byCursor[this.cursor]
            move.setParent(current)
            current.addChild(move)
        }else{
            this.moves.push(move)
        }
        move.setCursorId(this.cursor)
        this.byCursor[this.cursor] = move
    }

    setCursor(id: number): void
    {
        const current = this.byCursor[this.cursor]
        if(!current){
            throw new Error(`Could not set MoveList cursor. "${id}" is not a valid move/cursor id.`)
        }
        this.cursor = id
    }
}