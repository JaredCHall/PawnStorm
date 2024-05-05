import {MoveFactory} from "../MoveGen/MoveFactory.ts";
import {Square, SquareNameMap} from "../Board/Square.ts";
import {Move} from "./Move.ts";
import {BitMove, MoveFlag} from "../MoveGen/BitMove.ts";
import {Color, FenPieceMap, PieceType} from "../Board/Piece.ts";
import {CastlingMove} from "../MoveGen/CastlingMove.ts";
import {dumpBin} from "../Utils.ts";

export class Game {

    readonly moveFactory = new MoveFactory();

    protected notation: string = 'algebraic'

    constructor(fen: string|null = null) {
        fen ??= 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        this.moveFactory.setFromFenNumber(fen)
    }


    setNotation(type: 'algebraic'|'coordinate')
    {
        this.notation = type
    }

    makeMove(notation: string){
        const move = this.#parseNotation(notation)
        this.moveFactory.makeMove(move)
    }

    #parseCoordinateNotation(notation: string): BitMove{
        const parts = notation.match(/^([a-h][1-8])(\s)?([a-h][1-8])(\s)?(=)?([QBNR])?$/)
        if(parts === null){
            throw new Error(`Invalid Move: "${notation}". Invalid Coordinate Notation.`)
        }

        const fromName = parts[1]
        const from = SquareNameMap.indexByName[parts[1]] ?? null
        if(!from){
            throw new Error(`Invalid Move: "${notation}". Invalid origin square ${fromName}.`)
        }
        const toName = parts[3]
        const to = SquareNameMap.indexByName[toName] ?? null
        if(!to){
            throw new Error(`Invalid Move: "${notation}". Invalid destination square ${toName}.`)
        }

        const promoteType = parts[6] || null
        if(promoteType && ['R','B','N','Q'].indexOf(promoteType) == -1){
            throw new Error(`Invalid Move: "${notation}". Invalid promotion type: "${promoteType}".`)
        }

        const moving = this.moveFactory.squareList[from]
        if(moving == 0){
            throw new Error(`Invalid Move: "${notation}". There is no piece on ${fromName}.`)
        }

        const bitMoves = this.moveFactory.getMovesFromSquare(from, moving)
            .filter((bitMove) => {
                return bitMove.to == to && bitMove.getPromotesType() === promoteType
            })

        if(bitMoves.length !== 1){
            throw new Error(`Invalid Move: "${notation}". Not a legal move.`)
        }
        return bitMoves[0]
    }

    #parseAlgebraicNotation(notation: string): BitMove{

        const sideToMove = this.moveFactory.state.sideToMove
        let parts = notation.match(/^(O-O-O|O-O)([+#])?$/)
        if(parts){
            return CastlingMove.fromSanString(parts[1], sideToMove).move
        }

        parts = notation.match(/^([KQBNR])?([a-h])?([1-8])?(x)?([a-h][1-8])(=[QBNR])?([+#])?$/)
        if(parts === null){
            throw new Error(`Unreadable Algebraic notation: ${notation}`)
        }
        const pieceType =  parts[1] ? FenPieceMap.bitTypeByFen[parts[1]] >> 1 : (sideToMove ? PieceType.BPawn : PieceType.Pawn)
        const startFile = SquareNameMap.fileIndexes[parts[2]] || null
        const startRank = parts[3] ? parseInt(parts[3]) - 1 : null
        const isCapture = !!parts[4]
        const toSquare = SquareNameMap.indexByName[parts[5]]
        const promotionType = parts[6] ? FenPieceMap.bitTypeByFen[parts[6].replace(/=/,'')] >> 1 : null

        if(pieceType & (PieceType.Pawn | PieceType.BPawn)){
            if(isCapture){
                if(startRank){
                    throw new Error('Rank disambiguation not allowed for pawn captures. Move: ' + notation)
                }
                if(!startFile){
                    throw new Error('Must include file disambiguation when making a pawn capture. Move: ' + notation)
                }
            }
        }

        const moves: BitMove[] = []
        for(let i=0;i<64;i++){
            const from = this.moveFactory.square120Indexes[i]
            const piece = this.moveFactory.squareList[from]

            if(startRank && startRank != this.moveFactory.squareRanks[i]){
                continue
            }
            if(startFile && startFile != this.moveFactory.squareFiles[i]){
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
            throw new Error(`Invalid Algebraic notation: ${notation}. Not a legal move`)
        }

        if(moves.length > 1){
            throw new Error(`Invalid Algebraic notation: ${notation}. Move is ambiguous`)
        }

        return moves[0]

    }


    #parseNotation(notation: string): BitMove {

        if(this.notation === 'coordinate'){
            return this.#parseCoordinateNotation(notation)
        }else{
            return this.#parseAlgebraicNotation(notation)
        }
    }

    getSideToMove(): string
    {
        return this.moveFactory.state.sideToMove ? 'black' : 'white'
    }


    getLegalMoves(colorOrSquare: string)
    {
        let moves: BitMove[]

        if(colorOrSquare === 'white'){
            moves = this.moveFactory.getLegalMoves(Color.White)
        }else if(colorOrSquare === 'black'){
            moves = this.moveFactory.getLegalMoves(Color.Black)
        }else {
            const squareIndex = SquareNameMap.indexByName[colorOrSquare] ?? null
            if(squareIndex === null){
                throw new Error(`Invalid Square: ${colorOrSquare}. Not a real square.`)
            }
            const piece = this.moveFactory.squareList[squareIndex]
            if(piece == 0){
                throw new Error(`Invalid Square: ${colorOrSquare}. There is no piece on the square.`)
            }

            moves = this.moveFactory.getLegalMovesFromSquare(squareIndex, piece)
        }

        return moves.map((move) => new Move(move))
    }

    render(highlights: Square[] = [])
    {
        this.moveFactory.render(highlights)
    }

}