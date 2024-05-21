import {EngineInterface} from "./EngineInterface.ts";

export class StockfishInterface implements EngineInterface{

    command: Deno.Command
    process: Deno.ChildProcess

    constructor() {
        this.command = new Deno.Command('stockfish', {
            stdin: "piped",
            stdout: "piped",
        })
        this.process = this.command.spawn()


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

        const maxNoDataLoops = 5
        let countNoDataLoops = 0

        while(true){
            output = await reader.read()
            if(output.done){
                break
            }
            const chunk = decoder.decode(output.value);
            decoded += chunk
            if(decoded.includes(expected)) break;

            if(chunk.length === 0){
                countNoDataLoops++
                if(countNoDataLoops >= maxNoDataLoops){
                    console.log('no new data. must be end of response')
                    break;
                }
            }else{
                countNoDataLoops = 0
            }
            // Small delay to prevent tight loop
            await new Promise(resolve => setTimeout(resolve, 50));

        }

        reader.releaseLock()

        return decoded
    }

    async isReady(): Promise<boolean> {
        await this.writeCommand('isready')

        const response = await this.readResponse('readyok')

        return response.includes('readyok')
    }

    async setFen(fen: string): Promise<void> {
        await this.writeCommand('ucinewgame')
        await this.writeCommand('position fen ' + fen)
    }

    async getBestMove(): Promise<string> {
        await this.writeCommand('go depth 6')
        const response = await this.readResponse('bestmove ')


        const lines = response.trim().split('\n')
        const lastLine = lines.pop()
        if(!lastLine){
            throw new Error(`Unexpected output from stockfish: "${response}"`)
        }

        const parts = lastLine.split(' ')
        return parts[1]
    }

    async getEval(): Promise<number> {
        await this.writeCommand('eval')
        return parseInt(await this.readResponse('eval'))
    }

    async perft(depth: number): Promise<number> {
        await this.writeCommand('go perft ' + depth)
        return parseInt(await this.readResponse('nodes'))
    }

}