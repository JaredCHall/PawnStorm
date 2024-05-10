import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";

export class RecordedMove {

    private cursorId: number = -1 // a sentinel value of sorts

    private prev: RecordedMove|null = null

    private next: RecordedMove|null = null

    readonly move: BitMove

    constructor(
        move: BitMove,
        readonly fen: string,
        readonly notation: string,
        private parent: RecordedMove|null = null, // moves have a parent move, if they are the first move in a variation
        private children: RecordedMove[] = [], // child variations if they exist
    ) {
        this.move = move
    }

    setPrev(move: RecordedMove|null): void{
        this.prev = move
    }
    setNext(move: RecordedMove|null): void{
        this.next = move
    }

    getPrev(): RecordedMove|null{
        return this.prev
    }

    getNext(): RecordedMove|null{
        return this.next
    }

    setParent(parent: RecordedMove|null): void {
        this.parent = parent
    }

    getChildren(): RecordedMove[] {
        return this.children
    }

    addChild(child: RecordedMove): void {
        this.children.push(child)
    }

    getParent(): RecordedMove|null {
        return this.parent
    }

    setCursorId(id: number): void {
        this.cursorId = id
    }
    getCursorId(): number
    {
        return this.cursorId
    }

    getColor(): 'white' | 'black' {
        return this.move.moving & 1 ? 'black' : 'white'
    }

    getFullMoveCounter(): number
    {
        return parseInt(this.fen.substring(this.fen.lastIndexOf(' ') + 1))
    }

}