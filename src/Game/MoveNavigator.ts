import {RecordedMove} from "./RecordedMove.ts";
import {PgnParser} from "../Notation/PgnParser.ts";

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