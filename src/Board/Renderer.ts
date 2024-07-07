import {
    bgBrightBlue,
    bgBrightGreen,
    bgBrightMagenta,
    black,
    bold,
    white
} from "std/fmt/colors.ts";
import {Square} from "./Square.ts";
import {PieceType} from "./Piece.ts";
import {Board} from "./Board.ts";
import {Game} from "src/Game/Game.ts";

export class Renderer {
    render(board: Board|Game, highlights: Square[] = [])
    {
        board = board instanceof Game ? board.getBoard() : board

        const squaresByRank: Record<number, number[]> = {7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: [], 0: []}
        for(let i=0;i<64;i++){
            const rank = board.squareRanks[i]
            const piece = board.squareList[board.square120Indexes[i]]
            squaresByRank[rank].push(piece)
        }

        let i = 20
        for(let rank=7;rank>=0;rank--) {
            let squareType = rank % 2 === 0 ? 1: 0
            console.log(squaresByRank[rank].map((piece)=> {
                i++
                const formatted = this.formatSquare(squareType, piece, highlights.includes(i))
                squareType ^= 1
                return formatted
            }).join(''))
            i+= 2
        }
    }

    formatSquare(squareType: number, moving: number, highlight:boolean)
    {
        const pieceRenderMap: Record<PieceType, string> = {
            [PieceType.Pawn]: '♟',
            [PieceType.Knight]: '♞',
            [PieceType.Bishop]: '♝',
            [PieceType.Rook]: '♜',
            [PieceType.Queen]: '♛',
            [PieceType.King]: '♚',
            [PieceType.BPawn]: '♟',
        }

        //@ts-ignore ok
        let formatted = (pieceRenderMap[moving >> 1] ?? ' ') + ' '

        if(highlight){
            formatted = bgBrightGreen(formatted)
        }else{
            formatted = squareType === 0 ? bgBrightMagenta(formatted) : bgBrightBlue(formatted)
        }

        if(moving == 0){
            return formatted
        }

        return moving & 1 ? bold(black(formatted)) : bold(white(formatted))
    }
}