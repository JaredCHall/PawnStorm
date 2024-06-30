import {BitMove} from "../../MoveGen/BitMove.ts";

export interface CounterInterface {
    nodes: number
    update(move: BitMove): void;
    merge(counter: CounterInterface): CounterInterface;
}