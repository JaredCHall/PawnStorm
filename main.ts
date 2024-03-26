import {Board} from "./MoveGen/Board.ts";
import {Renderer} from "./MoveGen/Renderer.ts";


const board = new Board()
board.setPieces('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
Renderer.renderBoard(board)