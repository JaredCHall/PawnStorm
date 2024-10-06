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
            this.printRank(squaresByRank[rank].map((piece)=> {
                i++
                const formatted = this.formatSquare(squareType, piece, highlights.includes(i))
                squareType ^= 1
                return formatted
            }))
            i+= 2
        }
    }

    printRank(squares: SquareOutput[]): void
    {
        console.log(
            `%c${squares[0].text}%c${squares[1].text}%c${squares[2].text}%c${squares[3].text}%c${squares[4].text}%c${squares[5].text}%c${squares[6].text}%c${squares[7].text}`,
            squares[0].style,squares[1].style,squares[2].style,squares[3].style,squares[4].style,squares[5].style,squares[6].style,squares[7].style,
        )
    }

    formatSquare(squareType: number, moving: number, highlight:boolean): SquareOutput
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

        // @ts-ignore - it's fine
        const text: string = (pieceRenderMap[moving >> 1] ?? ' ') + ' '
        let style = ''

        if(highlight){
            style += 'background-color: green; '
        }else{
            style += squareType === 0 ? 'background-color: magenta; ' : 'background-color: blue; '
            //formatted = squareType === 0 ? bgBrightMagenta(formatted) : bgBrightBlue(formatted)
        }

        if(moving == 0){
            return new SquareOutput(text, style)
        }

        if(moving & 1){
            style += 'font-weight: bold; color: black; '
        }else{
            style += 'font-weight:bold; color: white; '
        }


        return new SquareOutput(text, style)
    }
}

class SquareOutput {
    text: string
    style: string

    constructor(text: string, style: string) {
        this.text = text
        this.style = style
    }
}