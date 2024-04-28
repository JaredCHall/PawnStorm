# BitChess
Chess in Deno using (minimal) Bitwise logic

Features:
- Game API which can be wired up to a UI
- Basic console UI
- Support for coordinate and algebraic notation
- Support for FEN numbers and PGN files

Internal Features:
- Mailbox board representation: 120-item array of 8-bit unsigned integers
- Legal move generation
- Passes perft6 and kiwipete performance tests

## Game API:

### Creating the Game object

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
 
### Game Notation
By default, BitChess will represent moves in algebraic notation, but coordinate notation is also supported.

```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
// use coordinate notation
game.setNotation('coordinate')
// use algebraic notation
game.setNotation('algebriac')

```

### Get Moves List
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
// get all legal moves for player
let moves = game.getLegalMoves('white')
// get legal moves from a specific square
moves = game.getLegalMoves('black','e4')
moves.forEach((move) => {
    console.log(`-- ${move.notation} --`)
    console.log(`Piece: ${move.piece}`)
    console.log(`Color: ${move.color}`)
    console.log(`From: ${move.from}`)
    console.log(`To: ${move.to}`)
    console.log(`Promotion: ${move.promotes}`)
})
```
The above might have the following output, as an example:
```text
-- e5 --
Piece: pawn
Color: white
From: e4
To: e5
Promotion:
-- exd5 --
Piece: pawn
Color: white
From: e4
To: d5
Promotion:
```

### Making Moves
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

### Undo the Last Move
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
game.makeMove('e4')
game.makeMove('e5')

game.undoMove()
game.undoMove()
// game is back at starting position
```

### Rendering the Board
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
    square.getCoordinates('black') // is viewing the board from black's perspective
})

// can also access a single square at a time
game.getSquare('a1')

```

### Checking Game State
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
// is the game over (player to move has no legal moves)?
game.isGameOver()
// is the king in check
game.state.isCheck()
// is there a checkmate on the board?
game.state.isCheckMate()
// what about a stalemate?
game.state.isStaleMate()
// do we have 3-fold repetition?
game.state.is3FoldRepetitionDraw()
// what about 50-move rule
game.state.is50MoveRuleDraw()
```

### Resigns or Draw by Agreement
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
game.setResigns('white')
game.setResigns('black')
game.setDrawByAgreement()

```

### Export PGN
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
const pgnFileContents = game.exportPgnFile()

```

### Get the FEN string
```typescript
import {Game} from "BitChess/Game/Game.ts"

const game = new Game()
const fenString = game.getFenString()

```
