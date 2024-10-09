import {RecordedMove} from "./RecordedMove.ts";

/**
 *  MoveNavigator
 *
 *  Moves are stored as a linked list in which each move may have the following relations:
 *
 *  previous/next - reference the next or previous move in list.Traversing this relationship will let you
 *                  walk from the first to last move in a line.
 *  parent/child - a child move references an alternative move or the start of a variation line. Moves
 *                 may have multiple children, but only one parent. Traversing this tree will allow moving
 *                 between the mainline and variations.
 *
 */
export class MoveNavigator {
    get initialComment(): string {
        return this._initialComment;
    }

    set initialComment(value: string) {
        this._initialComment = value;
    }

    readonly moves: RecordedMove[] = []; // the mainline moves

    private idMap: (RecordedMove|null)[] = []; // all moves indexed by id

    private cursor: number = -1 // id of the currently selected move

    private _initialComment: string = '' // a PGN-style comment on the initial position

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
            prev?.setNext(move)
        }

        move.setPrev(prev)

        const id = this.idMap.length
        move.setId(id)
        this.idMap[id] = move
        this.cursor = id

        // add to mainline if there is no parent
        if(!move.getParent()){
            this.moves.push(move)
        }
    }

    allMoves(): RecordedMove[] {
        const moves: RecordedMove[] = [];
        this.walkAll((move) => moves.push(move))
        return moves
    }

    getFirstMove(): RecordedMove|null
    {
        return this.idMap[0] ?? null
    }


    walk(cb: (move: RecordedMove) => void, move: RecordedMove|null = null)
    {
        move ??= this.getFirstMove()
        if(move === null){
            return
        }

        while(move != null){
            cb(move)
            move = move.getNext()
        }
    }

    walkAll(cb: (move: RecordedMove, isFirst: boolean, isLast: boolean, depth: number) => void, move: RecordedMove|null = null, depth: number = 0)
    {
        move ??= this.getFirstMove()
        if(move === null){
            return
        }

        let isFirst = true
        let isLast = true
        while(move != null){

            const next: RecordedMove|null = move.getNext()
            isLast = next === null

            cb(move, isFirst, isLast, depth)
            move.getChildren().forEach((move: RecordedMove) => {
                this.walkAll(cb, move, depth + 1)
            })
            move = next
            isFirst = false
        }
    }

    getLast(): RecordedMove|null {
        return this.idMap[this.cursor] ?? null
    }

    deleteFrom(id: number): void {
        const move = this.getMove(id)
        const parent = move.getParent()
        const prev = move.getPrev()

        const getDescendantIds = (startMove: RecordedMove): number[] => {
            let current: RecordedMove | null = startMove;
            let ids: number[] = []
            do {
                ids.push(current.getId())
                current.getChildren().forEach((move: RecordedMove) => {
                    ids = ids.concat(getDescendantIds(move))
                })

                current = current.getNext()
            } while (current != null)
            return ids
        }
        const descendantIds = getDescendantIds(move)
        descendantIds.forEach(id => {
            this.idMap[id] = null
            this.#removeMainLineMove(move)
        })

        // break the link from previous / parent move
        if(parent){
            parent.removeChild(move)
            return
        }else{
            prev?.setNext(null)
        }

        // if cursor is part of the deleted line, set it to something else
        if(!this.idMap[this.cursor]){
            this.cursor = prev?.getId() ?? -1
        }
    }

    goto(id: number): void {
        if(id == -1){
            this.cursor = -1
            return
        }

        this.getMove(id) // throws if move does not exist
        this.cursor = id
    }

    getMove(id: number): RecordedMove {
        const move = this.idMap[id] ?? null
        if(!move){
            throw new Error(`Could not find move with id ${id}. Move does not exist.`)
        }
        return move
    }

    #removeMainLineMove(move: RecordedMove): void {
        this.moves.splice(this.moves.indexOf(move), 1)
    }

}