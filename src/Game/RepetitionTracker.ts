import {RecordedMove} from "./RecordedMove.ts";

export class RepetitionTracker {

    positions: {[key: string]: number} = {}
    repetitionCount: number = 0

    buildFromMove(move: RecordedMove|null): void {
        this.positions = {}
        this.repetitionCount = 0
        while(move != null){

            const position = move.fen.serializeAsPosition()
            this.positions[position] ??= 0
            this.positions[position]++

            move = move.getPrev()
        }
    }

    addMove(move: RecordedMove): void {
        const position = move.fen.serializeAsPosition()
        this.positions[position] ??= 0
        this.positions[position]++

        this.#setRepetitions(this.positions[position])
    }

    #setRepetitions(count: number)
    {
        if(count > this.repetitionCount){
            this.repetitionCount = count
        }
    }
}