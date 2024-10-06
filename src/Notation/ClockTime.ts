export class ClockTime {
    constructor(readonly seconds: number) {
        if(this.seconds >= 10 * 3600){
            throw new Error('ClockTime cannot be set greater than 9:59:59')
        }
        if(this.seconds < 0){
            throw new Error('ClockTime cannot be set to a negative number')
        }
    }

    getTimeString(): string
    {
        const hours = Math.floor(this.seconds / 3600);
        const minutes = Math.floor((this.seconds % 3600) / 60);
        const remainingSeconds = this.seconds % 60;

        // Pad with leading zeros if needed
        const hoursString = hours.toString();
        const minutesString = minutes.toString().padStart(2, '0');
        const secondsString = remainingSeconds.toString().padStart(2, '0');

        return `${hoursString}:${minutesString}:${secondsString}`;
    }
}