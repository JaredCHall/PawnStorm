import { Timer } from "src/Game/Timer/Timer.ts";

export class DelayTimer extends Timer
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
        this.intervalId = setInterval(() => {this.tick()}, 1000)
    }
}