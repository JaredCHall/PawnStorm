import {Board, Color, PieceType, Square, SquareState} from "./Board.ts";
import {bgBrightBlue, bgBrightMagenta, black, bold, white} from "https://deno.land/std@0.219.1/fmt/colors.ts";


const pieceRenderMap: Record<PieceType, string> = {
    [PieceType.Pawn]: '♟ ',
    [PieceType.Knight]: '♞ ',
    [PieceType.Bishop]: '♝ ',
    [PieceType.Rook]: '♜ ',
    [PieceType.Queen]: '♛ ',
    [PieceType.King]: '♚ ',
}

enum SquareType {
    light, dark
}


export class Renderer {
    static render(board: Board)
    {
        const squaresByRank: Record<number, number[]> = {8: [], 7: [], 6: [], 5: [], 4: [], 3: [], 2: [], 1: []}
        for(let i=0;i<64;i++){
            const rank = Math.floor((i + 1) / -8) + 9;
            const index120 = (-1 * rank + 9) * 10 + i % 8 + 10 + 1
            const piece = board.squareList[index120]
            squaresByRank[rank].push(piece == SquareState.Empty ? 0 : board.pieceTypeList[piece])
        }

        for(let rank=8;rank>0;rank--) {
            let squareType = rank % 2 === 0 ? 0 : 1
            console.log(squaresByRank[rank].map((piece)=> {
                const formatted = this.formatSquare(squareType, piece)
                squareType ^= 1
                return formatted
            }).join(''))
        }
    }

    static formatSquare(squareType: SquareType, piece: number)
    {

        //@ts-ignore ok
        let formatted = pieceRenderMap[piece >> 1] ?? '  '
        formatted = squareType === 0 ? bgBrightMagenta(formatted) : bgBrightBlue(formatted)
        if(piece == 0){
            return formatted
        }

        return piece & 1 ? bold(black(formatted)) : bold(white(formatted))
    }
}