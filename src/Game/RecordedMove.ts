import {Move} from "./Move.ts";
import {BitMove} from "../MoveGen/BitMove.ts";
import {FenNumber} from "../Notation/FenNumber.ts";
import {AnnotationGlyph} from "../Notation/AnnotationGlyph.ts";

export type MoveAnnotation = '!'|'?'|'!!'|'!?'|'?!'|'??'

export class RecordedMove extends Move {
    get annotation(): AnnotationGlyph {
        return this._annotation;
    }

    set annotation(glyph: AnnotationGlyph|null) {
        this._annotation = glyph ?? new AnnotationGlyph( 0);
    }

    get comment(): string|null {
        return this._comment;
    }

    set comment(value: string|null) {
        this._comment = value
    }

    private id: number = -1 // a sentinel value of sorts

    private prev: RecordedMove|null = null

    private next: RecordedMove|null = null

    private _annotation: AnnotationGlyph = new AnnotationGlyph(0) // null annotation

    private _comment: string|null = null

    readonly bitMove: BitMove

    constructor(
        move: BitMove,
        readonly fen: FenNumber,
        readonly notation: string,
        readonly moveCounter: number,
        private parent: RecordedMove|null = null, // moves have a parent move, if they are the first move in a variation
        private children: RecordedMove[] = [], // child variations if they exist
    ) {
        super(move)
        this.bitMove = move
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
        return this.bitMove.moving & 1 ? 'black' : 'white'
    }

    serialize(includeMoveCounter: boolean = false): string
    {
        let serialized = ''
        if(includeMoveCounter){
            serialized = this.moveCounter.toString()
                + (this.getColor() == 'white' ? '.' : '...') + ' '
        }
        return serialized + this.notation + this.annotation.serialize()
    }

}