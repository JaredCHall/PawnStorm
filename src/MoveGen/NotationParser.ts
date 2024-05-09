import {MoveFactory} from "./MoveFactory.ts";
import {BitMove} from "./BitMove.ts";
import {SquareNameMap} from "../Board/Square.ts";
import {CastlingMoveMap, CastlingRight} from "./CastlingMove.ts";
import {Color, FenPieceMap, PieceType} from "../Board/Piece.ts";

export type NotationType = 'coordinate'|'algebraic'

export class NotationParser {

    constructor(
        private readonly moveFactory: MoveFactory,
        private notationType: NotationType = 'algebraic'
    ) {}

    setNotationType(type: NotationType) {
        this.notationType = type
    }

    serializeMove(move: BitMove)
    {
        let notation = ''
        if(this.notationType == 'coordinate'){
            notation += SquareNameMap.nameByIndex[move.from] + SquareNameMap.nameByIndex[move.to]
        }else if(this.notationType == 'algebraic'){
            notation += FenPieceMap.fenByBitType[move.moving].toUpperCase() + SquareNameMap.nameByIndex[move.to]
        }
        // TODO: make it work correctly
        return notation
    }

    parse(notation: string): BitMove {
        if(this.notationType === 'coordinate'){
            return this.#parseCoordinateNotation(notation)
        }else{
            return this.#parseAlgebraicNotation(notation)
        }
    }

    #parseCoordinateNotation(notation: string): BitMove {
        const parts = notation.match(/^([a-h][1-8])(\s)?([a-h][1-8])(\s)?(=)?([QBNR])?$/)
        if(parts === null){
            throw new Error(`"${notation}" is not valid coordinate notation.`)
        }

        const fromName = parts[1]
        const from = SquareNameMap.indexByName[parts[1]]

        const toName = parts[3]
        const to = SquareNameMap.indexByName[toName]

        const promoteType = parts[6] || null
        const moving = this.moveFactory.squareList[from]
        if(moving == 0){
            throw new Error(`"${notation}" is not possible. There is no piece on the ${fromName} square.`)
        }

        const bitMoves = this.moveFactory.getMovesFromSquare(from, moving)
            .filter((bitMove) => {
                return bitMove.to == to && bitMove.getPromotesType() === promoteType
            })

        if(bitMoves.length !== 1){
            throw new Error(`"${notation}" is not a legal move.`)
        }
        return bitMoves[0]
    }

    #parseCastlingMove(notation: 'O-O-O'|'O-O', sideToMove: Color): BitMove {

        const map: Record<'O-O-O'|'O-O', CastlingRight[]> = {
            'O-O-O': [CastlingRight.Q, CastlingRight.q],
            'O-O': [CastlingRight.K, CastlingRight.k],
        }

        return CastlingMoveMap.byRight[map[notation][sideToMove]].move
    }

    #parseAlgebraicNotation(notation: string): BitMove{

        const sideToMove = this.moveFactory.state.sideToMove
        let parts = notation.match(/^(O-O-O|O-O)([+#])?$/)
        if(parts){
            // @ts-ignore - trust the regex
            return this.#parseCastlingMove(parts[1], sideToMove)
        }

        // somehow this regex ensures that destination square is always in part 5, even with pawn moves
        parts = notation.match(/^([KQBNR])?([a-h])?([1-8])?(x)?([a-h][1-8])(=)?([QBNR])?([+#])?$/)
        if(parts === null){
            throw new Error(`"${notation}" is not valid algebraic notation.`)
        }
        const pieceType =  parts[1] ? FenPieceMap.bitTypeByFen[parts[1]] >> 1 : (sideToMove ? PieceType.BPawn : PieceType.Pawn)
        const startFile = SquareNameMap.fileIndexes[parts[2]] || null
        const startRank = parts[3] ? parseInt(parts[3]) - 1 : null
        const toSquare = SquareNameMap.indexByName[parts[5]]
        const promotionType = parts[7] ? parts[7].replace(/=/,'') : null

        const moves: BitMove[] = []
        for(let i=0;i<64;i++){
            const from = this.moveFactory.square120Indexes[i]
            const piece = this.moveFactory.squareList[from]

            // strict equals because zero is a valid value
            if(startRank !== null && startRank != this.moveFactory.squareRanks[i]){
                continue
            }
            if(startFile !== null && startFile != this.moveFactory.squareFiles[i]){
                continue
            }

            if(piece != 0 && (piece >> 1) & pieceType && (piece & 1) == this.moveFactory.state.sideToMove) {
                const movesForSquare = this.moveFactory.getLegalMovesFromSquare(from, piece)
                for (let j = 0; j < movesForSquare.length; j++) {
                    const move = movesForSquare[j]
                    if (move.getPromotesType() === promotionType && toSquare === move.to) {
                        moves.push(move)
                    }
                }
            }
        }

        if(moves.length == 0){
            throw new Error(`"${notation}" is not a legal move.`)
        }

        if(moves.length > 1){
            throw new Error(`"${notation}" is ambiguous.`)
        }

        return moves[0]
    }
}