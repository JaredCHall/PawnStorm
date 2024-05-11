# Game API

The Game API is where to start if you are wiring a UI. The following documents the most useful and common methods needed for the task.

## Creating the Game object

```typescript
import {Game} from "BitChess/Game/Game.ts"

// create a new game with the normal starting position
let game = new Game()

// or create from a FEN string
game = new Game('r4r2/1p3pkp/p5p1/4p2q/P2p4/1P4Pb/5Q1P/4RRK1 w - - 3 36')

// or from a PGN file
const fileContents = `
[Event "Paris"]
[Date "1858.??.??"]
[Result "1-0"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]

1.e4 e5 2.Nf3 d6 3.d4 Bg4 {This is a weak move
already.--Fischer} 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7
8.Nc3 c6 9.Bg5 {Black is in what's like a zugzwang position
here. He can't develop the [Queen's] knight because the pawn
is hanging, the bishop is blocked because of the
Queen.--Fischer} b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8
13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0
`
game = Game.fromPGN(fileContents)
```

## Game Notation
By default, BitChess will represent moves in algebraic notation, but coordinate notation is also supported.

```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
// use coordinate notation
game.setNotation('coordinate')
// use algebraic notation
game.setNotation('algebriac')

```

## Get Legal Moves

You may need a list legal moves in a position, or from a square. This is particular useful for user prompts such as move indicators when selecting a piece to move.

```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
// get all legal moves for player
let moves = game.getLegalMoves('white')
// get legal moves from a specific square
moves = game.getLegalMoves('e4')
console.table(moves)
```
The above might have the following output, as an example:
```text
┌───────┬───────┬──────┬──────┬──────────┐
│ (idx) │ piece │ from │ to   │ promotes │
├───────┼───────┼──────┼──────┼──────────┤
│     0 │ "P"   │ "e2" │ "e3" │ null     │
│     1 │ "P"   │ "e2" │ "e4" │ null     │
└───────┴───────┴──────┴──────┴──────────┘
```

The `piece` property is a fen or algebraic notation character representing both piece type and color. For example 'K' is the white king, and 'r' is a black rook. The `from` and `to` properties are the names of the origin and destination squares. The `promotes` property is usually null, but if a pawn is promoting, it is either 'N', 'B', 'R' or 'Q' (always upper-case).

## Making Moves
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
// make moves in algebraic notation (the default)
game.makeMove('e4')
game.makeMove('e5')

// or make them in coordinate notation
game.setNotation('coordinate')
game.makeMove('e1e2')
game.makeMove('e8e7')
```

## Undo the Last Move
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
game.makeMove('e4')
game.makeMove('e5')

game.undoMove()
game.undoMove()
// game is back at starting position
```

## Rendering the Board
```typescript

import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
game.getSquares().forEach((square) => {
    // use the following methods from the square object to control rendering
    square.getType() // 'light' or 'dark'
    square.isEmpty() // no piece is on the square
    square.getPieceType() // 'pawn','knight','bishop','rook','queen', or 'king'
    square.getPieceColor() // 'white' or 'black'
    
    // coordinates are [0,0] to [7,7] representing the square's row/column location
    // on the 8x8 grid. The argument is the board's orientation
    square.getCoordinates('white') // if viewing the board from white's perspective
    square.getCoordinates('black') // if viewing the board from black's perspective
})

// can also access a single square at a time
const a1 = game.getSquare('a1')

```

## Rendering the MoveNavigator

The `MoveNavigator` contains all the moves for the current game, as well as any variations that have been loaded via PGN. It is common in chess UIs to display the full list of moves, and in studies to additionally display variations.

```typescript
import {Game} from "BitChess/Game/Game.ts"
import {MoveNavigator} from "BitChess/Game/MoveNavigator.ts"
import {RecordedMove} from "BitChess/Game/RecordedMove.ts"

const moveList = game.getMoveList()

const mainLine: RecordedMove[] = moveList.getMainLine();

console.table(mainLine)
```

```text
id | notation | variations
```

```typescript
import {Game} from "BitChess/Game/Game.ts"
import {MoveNavigator} from "BitChess/Game/MoveNavigator.ts"
import {RecordedMove} from "BitChess/Game/RecordedMove.ts"

const moveList = game.getMoveList()

const mainLine: RecordedMove[] = moveList.getMainLine();


// variations can be deeply nested, so recursion is best
const renderMoveList = (moveList: MoveNavigator, depth: number = 0): string => {
    let html = ''
    moveList.forEach((move: RecordedMove) => {
        
        if(move.color == 'white'){
            html += '<div class="full-move">'
            html += `<strong>${move.fullMoveCount}.</strong>`
        }
        html += ${move.notation} + ' '
        
        move.getVariations().forEach((variation: MoveNavigator) => {
            html += '<div class="variation">'
            renderMoveList(moveList, depth + 1)
            html += '</div>'
        })
        html += '</div>'
    })
    return html
}

const html = renderMoveList()

mainLine.forEach((move: RecordedMove) => {
    move.getVariations().forEach((variation: MoveNavigator) => {
        move.get
    })
})

console.table(mainLine)
```




## Checking Game State
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
// which player's turn is it?
game.getSideToMove() // 'white' or 'black'
// is the game over (player to move has no legal moves)?
game.isGameOver()
// is the king in check
game.isCheck()
// is there a checkmate on the board?
game.isCheckMate()
// what about a stalemate?
game.isStaleMate()
// do we have 3-fold repetition?
game.is3FoldRepetitionDraw()
// what about 50-move rule
game.is50MoveRuleDraw()
```

## Resigns or Draw by Agreement
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
game.setResigns('white')
game.setResigns('black')
game.setDrawByAgreement()

```

## Export PGN
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
const pgnFileContents = game.exportPgnFile()

```

## Get the FEN string
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
const fenString = game.getFenString()

```