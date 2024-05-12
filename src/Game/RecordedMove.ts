import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";

export class RecordedMove {

    private id: number = -1 // a sentinel value of sorts

    private prev: RecordedMove|null = null

    private next: RecordedMove|null = null

    readonly move: BitMove

    constructor(
        move: BitMove,
        readonly fen: string,
        readonly notation: string,
        readonly moveCounter: number,
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

    removeChild(child: RecordedMove): void {
        this.children.splice(this.children.indexOf(child), 1)
    }

    getParent(): RecordedMove|null {
        return this.parent
    }

    setId(id: number): void {
        this.id = id
    }
    getId(): number
    {
        return this.id
    }

    getColor(): 'white' | 'black' {
        return this.move.moving & 1 ? 'black' : 'white'
    }

}