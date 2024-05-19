import {NotationType, ParserInterface} from "./ParserInterface.ts";
import {BitMove, MoveType} from "../../MoveGen/BitMove.ts";
import {SquareNameMap} from "../../Board/Square.ts";
import {MoveFactory} from "../../MoveGen/MoveFactory.ts";
import {Color, FenPieceMap, PieceType} from "../../Board/Piece.ts";
import {CastlingMoveMap, CastlingRight} from "../../MoveGen/CastlingMove.ts";

export class AlgebraicNotationParser implements ParserInterface{


    constructor(public moveFactory: MoveFactory) {}

    getType(): NotationType {
        return 'algebraic'
    }

    parse(notation: string): BitMove {
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
        const startFile = SquareNameMap.fileIndexes[parts[2]] ?? null
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

    serialize(move: BitMove): string {
        let notation = ''
        if(move.flag == MoveType.CastleShort){
            notation = 'O-O'
        }else if(move.flag == MoveType.CastleLong){
            notation = 'O-O-O'
        }else{
            const isPawn = move.moving >> 1 & (PieceType.BPawn | PieceType.Pawn)
            if(!isPawn){
                notation += FenPieceMap.fenByBitType[move.moving].toUpperCase()
            }
            notation += this.#getMoveDisambiguation(move)
            if(move.captured != 0){
                notation += 'x'
            }
            notation += SquareNameMap.nameByIndex[move.to]
            if(move.getPromotesType() !== null){
                notation += '='+move.getPromotesType()
            }
        }
        return notation
    }

    getCheckOrMateIndicator(move: BitMove): string {
        if(!move.isCheck){
            return ''
        }
        return move.isMate ? '#' : '+'
    }

    #parseCastlingMove(notation: 'O-O-O'|'O-O', sideToMove: Color): BitMove {

        const map: Record<'O-O-O'|'O-O', CastlingRight[]> = {
            'O-O-O': [CastlingRight.Q, CastlingRight.q],
            'O-O': [CastlingRight.K, CastlingRight.k],
        }

        return CastlingMoveMap.byRight[map[notation][sideToMove]].move
    }

    #getMoveDisambiguation(move: BitMove): string {

        const square64Index = this.moveFactory.square64Indexes[move.from]
        const startFile = this.moveFactory.squareFiles[square64Index]
        const startRank = this.moveFactory.squareRanks[square64Index]

        const pieceType = move.moving >> 1
        const color = move.moving & 1

        if(pieceType & (PieceType.BPawn | PieceType.Pawn)){
            return move.captured != 0 ? SquareNameMap.files[startFile] : ''
        }

        if(pieceType & PieceType.King){
            return ''
        }

        let requiresRank = false
        let requiresFile = false


        for(let i=0;i<64;i++){
            const from = this.moveFactory.square120Indexes[i]
            const piece = this.moveFactory.squareList[from]
            const file =  this.moveFactory.squareFiles[i]

            if(i == square64Index){
                continue
            }

            if(piece != 0 && (piece >> 1) & pieceType && (piece & 1) == color) {
                const movesForSquare = this.moveFactory.getLegalMovesFromSquare(from, piece)
                for (let j = 0; j < movesForSquare.length; j++) {
                    const otherMove = movesForSquare[j]
                    if(move.to == otherMove.to){
                        if(startFile == file){
                            requiresRank = true
                        }else{
                            requiresFile = true
                        }
                    }
                }
            }
        }

        if(requiresFile){
            if(requiresRank){
                return SquareNameMap.files[startFile] + SquareNameMap.ranks[startRank]
            }
            return SquareNameMap.files[startFile]
        }else if(requiresRank){
            return SquareNameMap.ranks[startRank]
        }

        return ''
    }
}