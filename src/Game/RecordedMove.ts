import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";

export class RecordedMove {

    private cursorId: number = -1 // a sentinel value of sorts

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

    setParent(parent: RecordedMove|null): void {
        this.parent = parent
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

}