import {Move, MoveFlag, MoveType} from "../MoveGen/Move.ts";

export class PerftCounter {
    nodes: number
    captures: number
    passants: number
    castles: number
    promotions: number
    checks: number
    discoveredChecks: number
    doubleChecks: number
    checkMates: number

    constructor(
        nodes: number = 0,
        captures: number = 0,
        passants: number = 0,
        castles: number = 0,
        promotions: number = 0,
        checks: number =  0,
        discoveredChecks: number = 0,
        doubleChecks: number = 0,
        checkMates: number = 0,
    ) {
        this.nodes = nodes
        this.captures = captures
        this.passants = passants
        this.castles = castles
        this.promotions = promotions
        this.checks = checks
        this.discoveredChecks = discoveredChecks
        this.doubleChecks = doubleChecks
        this.checkMates = checkMates
    }

    update(move: Move): void
    {
        this.nodes++
        if(move.flag & MoveFlag.Capture){
            this.captures++
            if(move.flag == MoveType.EnPassant){
                this.passants++
            }
        }

        if(move.flag & MoveFlag.Promotion) {
            this.promotions++
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