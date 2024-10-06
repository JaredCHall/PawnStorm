import {BasicTimer} from "./BasicTimer.ts";

export class IncrementTimer extends BasicTimer
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