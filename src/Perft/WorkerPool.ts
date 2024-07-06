interface Task {
    fen: string
    depth: number
    resolve: (result: number) => void
    reject: (error: any) => void
}


export class WorkerPool
{
    private workers: Worker[] = []
    private activeWorkers = new Map<Worker, number>()
    private queuedTasks: Task[] = []
    private processedTasks: Task[] = []

    private readonly maxWorkers: number
    private readonly workerScript = './worker.ts'

    constructor(maxWorkers: number) {
        this.maxWorkers = maxWorkers
        for (let i = 0; i < this.maxWorkers; i++) {
            this.createWorker()
        }
    }

    private createWorker(): Worker {
        const worker = new Worker(import.meta.resolve('./worker.ts'), { type: "module" })

        worker.onmessage = (event) => {
            const { fen, count } = event.data
            const task = this.processedTasks.find(t => t.fen == fen)

           // console.log(`task with fen: ${fen} complete. ${count} nodes found.`)

            if (task) {
                task.resolve(count)
            }else{
                throw new Error(`Could not find task with fen: ${fen}`)
            }
            this.activeWorkers.set(worker, 0)
            this.processQueue()
        };

        worker.onerror = (error) => {
            console.error("Worker error:", error)
            this.activeWorkers.set(worker, 0)
            this.processQueue()
        };
        this.workers.push(worker)
        this.activeWorkers.set(worker, 0)

        return worker
    }

    private processQueue() {
        if (this.queuedTasks.length > 0) {
            const availableWorker = this.workers.find(worker => this.activeWorkers.get(worker) === 0)

            if (availableWorker) {
                const task = this.queuedTasks.shift()
                if(!task){
                    console.error("No task found for worker")
                }else{
                    this.processedTasks.push(task)
                    this.activeWorkers.set(availableWorker, 1) // Set active tasks to 1 when assigning a task
                    availableWorker.postMessage({ fen: task.fen, depth: task.depth })
                   // console.log(`Running worker for fen: ${task.fen} and depth: ${task.depth}`)
                }
            }
        }
    }

    runTask(fen: string, depth: number): Promise<number> {
        return new Promise((resolve , reject) => {
            this.queuedTasks.push({ fen, depth, resolve , reject })
            this.processQueue()
        });
    }

    terminate() {
        this.workers.forEach(worker => worker.terminate())
    }
}