export class ClockTime {
    constructor(readonly seconds: number) {}

    getTimeString(): string
    {
        const hours = Math.floor(this.seconds / 3600);
        const minutes = Math.floor((this.seconds % 3600) / 60);
        const remainingSeconds = this.seconds % 60;

        // Pad with leading zeros if needed
        const hoursString = hours.toString().padStart(2, '0');
        const minutesString = minutes.toString().padStart(2, '0');
        const secondsString = remainingSeconds.toString().padStart(2, '0');

        return `${hoursString}:${minutesString}:${secondsString}`;
    }
}