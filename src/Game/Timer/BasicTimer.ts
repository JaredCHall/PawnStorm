export class BasicTimer
{
    timeLimit: number // seconds

    timeRemaining: number // seconds

    intervalId: number|null = null

    turnStartTimestamp: number|null = null // timestamp of the last time the timer was started

    turnStartTimeRemaining: number // seconds remaining at start of current turn

    onTimeOutCallback: () => void = () => {}

    constructor(timeLimit: number)
    {
        this.timeLimit = timeLimit
        this.timeRemaining = timeLimit
        this.turnStartTimeRemaining = timeLimit
    }

    setTimeoutCallback(onTimeOutCallback: () => void)
    {
        this.onTimeOutCallback = onTimeOutCallback
    }

    outOfTime(): void
    {
        this.timeRemaining = 0
        this.stop()
        this.onTimeOutCallback()
    }

    start()
    {
        this.turnStartTimestamp = new Date().getTime()
        this.turnStartTimeRemaining = this.timeRemaining
        this.intervalId = setInterval(() => {this.decrementTime()}, 1000)
    }

    decrementTime(): void
    {
        if(this.turnStartTimestamp === null){
            throw new Error("Cannot decrement time when clock is not running.")
        }

        const elapsed = this.timeElapsed(this.turnStartTimestamp)
        if(elapsed > 0){
            this.timeRemaining = this.turnStartTimeRemaining - this.timeElapsed(this.turnStartTimestamp)
        }

        if(this.timeRemaining <= 0){
            this.outOfTime()
        }
    }

    timeElapsed(startTime: number): number
    {
        return Math.floor(((new Date().getTime()) - startTime) / 1000)
    }

    stop(): void
    {
        if(this.intervalId){
            clearInterval(this.intervalId)
            this.intervalId = null
        }
        this.turnStartTimestamp = null
    }
}