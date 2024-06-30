import {BitMove} from "../../MoveGen/BitMove.ts";
import {CounterInterface} from "./CounterInterface.ts";

export class NodeCounter implements CounterInterface{
    nodes: number

    constructor(nodes: number = 0,) {
        this.nodes = nodes
    }

    update(move: BitMove): void {
        this.nodes++
    }

    merge(counter: NodeCounter): NodeCounter {
        const newCounter = new NodeCounter()
        newCounter.nodes = this.nodes + counter.nodes
        return newCounter
    }
}