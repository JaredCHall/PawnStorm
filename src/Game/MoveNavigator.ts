import {RecordedMove} from "./RecordedMove.ts";

/**
 *  MoveNavigator
 *
 *  Moves are stored as a linked list in which each move may have the following relations:
 *
 *  previous/next - reference the next or previous move in list. Always available unless move
 *                  is the first or last move in a line. Traversing this relationship will let you
 *                  walk from the first to last move in a line.
 *  parent/child - a child move references an alternative move or the start of a variation line. Moves
 *                 may have multiple children, but only one parent. Traversing this tree will allow moving
 *                 between the mainline and variations.
 *
 */
export class MoveNavigator {

    readonly moves: RecordedMove[] = []; // the mainline moves

    private idMap: (RecordedMove|null)[] = []; // all moves indexed by id

    private cursor: number = -1 // id of the currently selected move

    constructor(readonly startFen: string) {}

    addMove(move: RecordedMove): void {

        const prev = this.getLast()
        const next = prev?.getNext() ?? null
        const isNewVariation = (this.cursor == -1 && this.moves.length > 0) || (next != null && this.cursor > -1)

        if(isNewVariation){
            const parent = next ?? this.getMove(0)
            move.setParent(parent)
            parent.addChild(move)
        }else{
            move.setPrev(prev)
            prev?.setNext(move)
        }

        const id = this.idMap.length
        move.setId(id)
        this.idMap[id] = move
        this.cursor = id

        // add to mainline if there is no parent
        if(!move.getParent()){
            this.moves.push(move)
        }
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

    setCursor(id: number, setBefore: boolean = false): void {
        if(id == -1){
            this.cursor = -1
            return
        }

        const move =  this.getMove(id)
        if(setBefore){
            id = move.getPrev()?.getId() ?? -1
        }
        this.cursor = id
    }

    getMove(id: number): RecordedMove {
        const move = this.idMap[id] ?? null
        if(!move){
            throw new Error(`Could not find move with id ${id}. Move does not exist.`)
        }
        return move
    }

    getFenBefore(id: number): string {
        if(id === 0){
            return this.startFen
        }
        const move = this.getMove(id)
        const parent = move.getParent()
        if(parent != null){
            return this.getFenBefore(parent.getId())
        }

        return this.getMove(id - 1).fen
    }

    serialize(): string {
        const renderLine = (startMove: RecordedMove): string => {
            let movesStr = ''
            let current: RecordedMove | null = startMove;
            let prevHadChild = false
            do {
                const includeMoveCounter = current === startMove || prevHadChild || current.getColor() == 'white'
                movesStr += current.serialize(includeMoveCounter) + ' '
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

    dumpRelations(): void
    {
        const rows: {
            id: number,
            notation: string,
            prev: number|null,
            next: number|null,
            parent: number|null,
        }[] = []

        const makeRows = (move: RecordedMove|null) => {
            while(move != null){
                const row = {
                    id: move.getId(),
                    notation: move.serialize(true),
                    prev: move.getPrev()?.getId() ?? null,
                    next: move.getNext()?.getId() ?? null,
                    parent: move.getParent()?.getId() ?? null,
                }
                rows.push(row)

                move.getChildren().forEach((child: RecordedMove) => {
                    makeRows(child)
                })

                move = move.getNext()
            }
        }

        makeRows(this.getMove(0))

        console.table(rows)

    }

    #removeMainLineMove(move: RecordedMove): void {
        this.moves.splice(this.moves.indexOf(move), 1)
    }

}