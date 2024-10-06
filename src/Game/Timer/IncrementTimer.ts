import {Timer} from "./Timer.ts";

export class IncrementTimer extends Timer
{
    increment: number //seconds

    constructor(timeLimit: number, increment: number) {
        super(timeLimit);
        this.increment = increment
    }

    stop() {
        if(this.timeRemaining > 0) {
            this.timeRemaining += this.increment
        }
        super.stop();
    }

}