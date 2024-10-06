export class Timer
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
        if(this.timeRemaining <= 0){
            throw new Error("Cannot start timer. Time expired.")
        }

        this.turnStartTimestamp = new Date().getTime()
        this.turnStartTimeRemaining = this.timeRemaining
        this.intervalId = setInterval(() => {this.tick()}, 1000)
    }

    tick(): void
    {
        if(this.turnStartTimestamp === null){
            throw new Error("Cannot decrement timer. Timer is stopped.")
        }

        const elapsed = Math.floor(((new Date().getTime()) - this.turnStartTimestamp) / 1000)
        if(elapsed > 0){
            this.timeRemaining = this.turnStartTimeRemaining - elapsed
        }

        if(this.timeRemaining <= 0){
            this.outOfTime()
        }
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