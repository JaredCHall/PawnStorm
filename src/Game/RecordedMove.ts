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

    private id: number = -1 // a sentinel value of sorts

    private prev: RecordedMove|null = null

    private next: RecordedMove|null = null

    private _annotation: AnnotationGlyph = new AnnotationGlyph(0) // null annotation

    private comments: string[] = []

    readonly bitMove: BitMove

    constructor(
        move: BitMove,
        readonly fen: FenNumber,
        readonly notation: string,
        readonly moveCounter: number,
        readonly clockTime: string|null = null, // remaining clock for player after move
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

    addComment(text: string): void
    {
        this.comments.push(text)
    }

    getComments(): string[]
    {
        return this.comments
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

    serialize(includeMoveCounter: boolean = false, includeAnnotation: boolean = true): string
    {
        let serialized = ''
        if(includeMoveCounter){
            serialized = this.moveCounter.toString()
                + (this.getColor() == 'white' ? '.' : '...') + ' '
        }
        return serialized + this.notation + (includeAnnotation ? this.annotation.serialize() : '')
    }

}