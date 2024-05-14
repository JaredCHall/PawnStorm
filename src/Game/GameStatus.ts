export type TerminationType = 'unterminated'|'normal'|'rules infraction'|'time forfeit'
export type DrawType = 'agreement'|'stalemate'|'three-fold-repetition'|'fifty-move-rule'|'insufficient-material'|null

export class GameStatus {

    constructor(
        readonly terminationType: TerminationType = 'unterminated',
        readonly winner: 'white'|'black'|null = null,
        readonly drawType: DrawType = null,
    ) {

    }
}