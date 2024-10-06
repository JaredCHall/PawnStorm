import { BasicTimer } from "src/Game/Timer/BasicTimer.ts";

export class DelayTimer extends BasicTimer
{
    delay: number //seconds

    constructor(timeLimit: number, delay: number)
    {
        super(timeLimit);
        this.delay = delay
    }

    start()
    {
        this.turnStartTimeRemaining = this.timeRemaining
        this.turnStartTimestamp = new Date().getTime() + this.delay * 1000
        this.intervalId = setInterval(() => {this.decrementTime()}, 1000)
    }
}