import {RecordedMove} from "./RecordedMove.ts";

export class MainLine {

    readonly moves: RecordedMove[] = []; // always only mainline moves

    private byCursor: RecordedMove[] = []; // all moves including within variations indexed by when they were added to the list

    private cursor: number = -1

    constructor(readonly startFen: string) {
    }

    addMove(move: RecordedMove, isNewVariation: boolean = false): void
    {
        const current = this.byCursor[this.cursor] ?? null
        const id = this.moves.length
        if(isNewVariation){
            move.setParent(current)
            current.addChild(move)
        }else{
            current?.setNext(move)
        }
        move.setCursorId(id)
        move.setPrev(current)
        this.moves.push(move)
        this.byCursor[id] = move
        this.cursor = id
    }

    setCursor(id: number): void
    {
        const current = this.byCursor[this.cursor]
        if(!current){
            throw new Error(`Could not set MoveList cursor. "${id}" is not a valid move/cursor id.`)
        }
        this.cursor = id
    }

    getMove(id: number): RecordedMove
    {
        return this.byCursor[id]
    }

    getFenBeforeMove(id: number): string
    {
        if(id === 0){
            return this.startFen
        }
        const move = this.getMove(id)
        const parent = move.getParent()
        if(parent != null){
            return this.getFenBeforeMove(parent.getCursorId())
        }

        return this.byCursor[id - 1].fen
    }

    serialize(): string
    {
        const renderLine = (startMove: RecordedMove): string => {
            let movesStr = ''
            let current: RecordedMove | null = startMove;
            do {
                if (current.getColor() == 'white') {
                    movesStr += current.getFullMoveCounter().toString() + '. '
                }
                movesStr += current.notation + ' '

                current.getChildren().forEach((move: RecordedMove) => {
                    movesStr += '(' + renderLine(move) + ') '
                })
                current = current.getNext()
            } while (current != null)

            return movesStr.trimEnd()
        }
        return renderLine(this.getMove(0))
    }
}