export class AnnotationGlyph {


    constructor(public readonly value: number) {
    }

    static fromString(input: string): AnnotationGlyph {
        switch(input){
            case '': return new AnnotationGlyph(0);
            case '!': return new AnnotationGlyph(1);
            case '?': return new AnnotationGlyph(2);
            case '!!': return new AnnotationGlyph(3);
            case '??': return new AnnotationGlyph(4);
            case '!?': return new AnnotationGlyph(5);
            case '?!': return new AnnotationGlyph(6);
        }
        if(input.charAt(0) != '$'){
            throw new Error(`Non-standard NAG values must start with $. Cannot parse: "${input}"`)
        }
        const nagNumber = input.substring(1)
        if(!nagNumber.match(/^[0-9]+$/)){
            throw new Error(`NAG value must be numeric after "$". Cannot parse: "${input}"`)
        }

        const nagIntVal = parseInt(nagNumber)
        if(nagIntVal < 0 || nagIntVal > 255){
            throw new Error(`NAG integer value must be between 0 and 255. Cannot parse: "${input}"`)
        }

        return new AnnotationGlyph(nagIntVal)
    }

    serialize(): string
    {
        switch(this.value){
            case 0: return ''
            case 1: return '!' // good move
            case 2: return '?' // poor move
            case 3: return '!!' // excellent move
            case 4: return '??' // blunder
            case 5: return '!?' // speculative move
            case 6: return '?!' // questionable move
            default:
                return ' $' + this.value.toString()
        }
    }

}