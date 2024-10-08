import {UciUnexpectedOutputError} from "./Errors/UciUnexpectedOutputError.ts";
import {UciTimeoutError} from "./Errors/UciTimeoutError.ts";

export class UciEngine
{
    command: Deno.Command
    process: Deno.ChildProcess

    constructor(command: string) {
        this.command = new Deno.Command(command, {
            stdin: "piped",
            stdout: "piped",
        })
        this.process = this.command.spawn()
    }

    timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            // Create a timeout promise that rejects after a certain time
            const timeoutId = setTimeout(() => reject(new UciTimeoutError(`Timed out awaiting expected UCI response after ${ms} ms`)), ms)

            promise
                .then((result) => {
                    clearTimeout(timeoutId); // Clear the timeout if the promise resolves
                    resolve(result);
                })
                .catch((error) => {
                    clearTimeout(timeoutId); // Clear the timeout if the promise errors
                    reject(error);
                });
        });
    }

    async close()
    {
        await this.writeCommand('quit')
        await this.process.stdin.close()
        await this.process.stdout.cancel()
        await this.process.status
    }

    async writeCommand(command: string): Promise<void> {
        const writer = this.process.stdin.getWriter()

        await writer.ready
        await writer.write(new TextEncoder().encode(command + '\n'))
        writer.releaseLock()
    }
    async readResponse(regex: RegExp, firstMatchOnly: boolean = false, msTimeout: number = 500): Promise<string> {

        let decoded = ''
        let output

        const reader = this.process.stdout.getReader()
        const decoder = new TextDecoder();

        const lines: Array<string> = []

        readLoop:
        while(true){
            output = await this.timeoutPromise(reader.read(), msTimeout)
            if(output.done){
                break
            }
            const chunk = decoder.decode(output.value);
            decoded += chunk

            const decodedLines = decoded.trim().split('\n')
            for(const i in decodedLines){
                lines.push(decodedLines[i]);
                if(decodedLines[i].match(regex) !== null){
                    break readLoop;
                }

            }
        }
        reader.releaseLock()

        if(firstMatchOnly){
            const parts = lines.pop()?.match(regex)
            if(!parts){
                throw new UciUnexpectedOutputError(decoded, regex)
            }

            return parts[1]
        }

        return decoded
    }


    async isReady(): Promise<boolean> {
        await this.writeCommand('isready')
        await this.readResponse(/^(readyok)/, true)
        return true
    }

    async setFen(fen: string): Promise<void> {
        await this.writeCommand('ucinewgame')
        await this.writeCommand('position fen ' + fen)
    }

    async getBestMove(moveTime:number=500): Promise<string> {
        await this.writeCommand(`go movetime ${moveTime}`)
        return await this.readResponse(/^bestmove\s+([a-h0-8=nNbBrRqQ]+)/, true, moveTime + 100)
    }
}