export class FenNumber
{
    constructor(
        public readonly piecePositions: string,
        public readonly sideToMove: 'w'|'b',
        public readonly castleRights: string,
        public readonly enPassantTarget: string,
        public readonly halfMoveClock: number,
        public readonly fullMoveCounter: number,
    ) {
    }

    serialize(): string
    {
        return this.piecePositions
            + ' ' + this.sideToMove
            + ' ' + this.castleRights
            + ' ' + this.enPassantTarget
            + ' ' + this.halfMoveClock.toString()
            + ' ' + this.fullMoveCounter.toString()
    }

    serializeAsPosition(): string
    {
        return this.piecePositions
            + ' ' + this.castleRights
            + ' ' + this.enPassantTarget
    }
}