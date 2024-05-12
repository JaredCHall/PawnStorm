import {RecordedMove} from "./RecordedMove.ts";

export class MoveNavigator {

    readonly moves: RecordedMove[] = []; // always only mainline moves

    private idMap: (RecordedMove|null)[] = []; // all moves including within variations indexed by when they were added to the list

    private cursor: number = -1

    constructor(readonly startFen: string) {}

    addMove(move: RecordedMove, isNewVariation: boolean = false): void {
        const current = this.cursor == -1 ? null : this.getMove(this.cursor)
        const id = this.idMap.length
        if(isNewVariation){
            move.setParent(current)
            if(!current){
                throw new Error(`Cannot create new variation when there are no moves in the mainline.`)
            }
            current.addChild(move)
        }else{
            current?.setNext(move)
        }
        move.setId(id)
        move.setPrev(current)
        if(!move.getParent()){
            this.moves.push(move)
        }

        this.idMap[id] = move
        this.cursor = id
    }

    getLast(): RecordedMove|null {
        return this.idMap[this.cursor] ?? null
    }

    deleteFrom(id: number): void {
        const move = this.getMove(id)
        const parent = move.getParent()

        const getDescendantIds = (startMove: RecordedMove): number[] => {
            let current: RecordedMove | null = startMove;
            const ids: number[] = []
            do {
                ids.push(current.getId())
                current.getChildren().forEach((move: RecordedMove) => {
                    ids.concat(getDescendantIds(move))
                })

                current = current.getNext()
            } while (current != null)
            return ids
        }
        const descendantIds = getDescendantIds(move)
        descendantIds.forEach(id => {this.idMap[id] = null})

        // break the link from previous / parent move
        if(parent){
            parent.removeChild(move)
            return
        }else{
            move.getPrev()?.setNext(null)
        }
        this.#removeMainLineMove(move)
    }

    setCursor(id: number): void {
        this.getMove(id) // to trigger error if move does not exist
        this.cursor = id
    }

    getMove(id: number): RecordedMove {
        const move = this.idMap[id] ?? null
        if(!move){
            throw new Error(`Could not find move with id ${id}. Move does not exist.`)
        }
        return move
    }

    getFenBeforeMove(id: number): string {
        if(id === 0){
            return this.startFen
        }
        const move = this.getMove(id)
        const parent = move.getParent()
        if(parent != null){
            return this.getFenBeforeMove(parent.getId())
        }

        return this.getMove(id - 1).fen
    }

    serialize(): string {
        const renderMoveCountAnnotation = (move: RecordedMove): string => {
            return move.moveCounter.toString()
                + (move.getColor() == 'white' ? '.' : '...')
                + ' '
        }
        const renderLine = (startMove: RecordedMove): string => {
            let movesStr = ''
            let current: RecordedMove | null = startMove;
            let prevHadChild = false
            do {
                if (current === startMove || prevHadChild || current.getColor() == 'white') {
                    movesStr += renderMoveCountAnnotation(current)
                }
                movesStr += current.notation + ' '

                prevHadChild = false
                current.getChildren().forEach((move: RecordedMove) => {
                    prevHadChild = true
                    movesStr += '(' + renderLine(move) + ') '
                })

                current = current.getNext()
            } while (current != null)

            return movesStr.trimEnd()
        }
        return renderLine(this.getMove(0))
    }

    #removeMainLineMove(move: RecordedMove): void {
        this.moves.splice(this.moves.indexOf(move), 1)
    }

}