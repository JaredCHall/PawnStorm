import {BitMove, MoveFlag} from "../MoveGen/BitMove.ts";

export class PerftCounter {
    nodes: number
    captures: number
    passants: number
    castles: number
    promotions: number
    checks: number
    checkMates: number

    constructor(
        nodes: number = 0,
        captures: number = 0,
        passants: number = 0,
        castles: number = 0,
        promotions: number = 0,
        checks: number =  0,
        checkMates: number = 0,
    ) {
        this.nodes = nodes
        this.captures = captures
        this.passants = passants
        this.castles = castles
        this.promotions = promotions
        this.checks = checks
        this.checkMates = checkMates
    }

    update(move: BitMove): void
    {
        this.nodes++
        if(move.flag & MoveFlag.Promotion) {
            this.promotions++
            if(move.flag & MoveFlag.Capture){
                this.captures++
            }
        }else if(move.flag & MoveFlag.Capture){
            this.captures++
            if(move.flag & MoveFlag.Flag1){
                this.passants++
            }
        }else if(move.flag & MoveFlag.Flag2){
            this.castles++
        }

        if(move.isCheck){
            this.checks++
            if(move.isMate){
                this.checkMates++
            }
        }
    }
}