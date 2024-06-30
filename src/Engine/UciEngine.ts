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
    async readResponse(expected: string): Promise<string> {

        let decoded = ''
        let output

        const reader = this.process.stdout.getReader()
        const decoder = new TextDecoder();

        while(true){
            output = await this.timeoutPromise(reader.read(), 500)
            if(output.done){
                break
            }
            const chunk = decoder.decode(output.value);
            decoded += chunk
            if(decoded.includes(expected)) break;
        }

        reader.releaseLock()

        return decoded
    }

    async readValueFromExpectedLine(expected: string, regex: RegExp): Promise<string> {
        const response = await this.readResponse(expected)
        const lastLine = response.trim().split('\n').pop()
        if(!lastLine){
            throw new UciUnexpectedOutputError(response, regex)
        }

        const parts = lastLine.match(regex)
        if(!parts){
            throw new UciUnexpectedOutputError(response, regex)
        }

        return parts[1]
    }

}