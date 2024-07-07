# PawnStorm

<img alt="Pawns in attack formation buffeted by a blue flame. Like a fiery storm, they leave destruction in their wake." src="./pawn-storm-logo.webp" title="PawnStorm Logo" width="180px" />

PawnStorm is a robust, headless chess game engine designed for seamless integration with user interfaces and game api servers. Whether you're developing a visually appealing desktop application or a responsive web interface, PawnStorm provides a solid foundation with its comprehensive game representation and manipulation capabilities.

While the primary goal of PawnStorm is to offer a dependable backend for chess applications, a significant part of the project's joy comes from its performance optimization. The engine is fine-tuned to excel in performance tests, particularly in calculating perft benchmarks. While it cannot compete with compiled engines, in this hobbyist's opinion, it is pretty darn fast for Javascript. [Benchmarking](/benchmarks/benchmark-results.txt) shows that PawnStorm generates legal moves 3x faster than Deno Chess and 4x faster than Chess.js.

Features:
- Game Engine
  - Legal move generation
  - checkmate and draw detection
  - FEN/PGN parsing and generation
  - Variation navigation
  - Game Clock with Increment and Delay ___*TODO\*___
- Interfaces with popular chess engines:
  - Stockfish
  - Leela ___*TODO\*___
  - Ethereal ___*TODO\*___
  - Rustic Chess ___*TODO\*___
- Console Application
  - Play against your favorite engine
  - Watch engines battle other engines  ___*TODO\*___
  - Add engine evaluations to PGN ___*TODO\*___

## Documentation
 - [Game Api](docs/GameApi.md) - For wiring up a UI
 - [Console Interface](docs/ConsoleInterface.md) - Example Console Implementation
 - [Performance Tests](docs/PerformanceTesting.md) - All about Performance Testing

## Usage
- `deno task battle` - Watch battle between two chess engines
- `deno task play` - Play against an AI engine in the console
- `deno task perft` - Calculate number of possible moves from given position at depth `n`


## Installation - (Development and Testing)

1. Install Deno
2. Clone the repo
3. Run `deno task postinstall`

## Dev Tasks

- `deno task postinstall` - installs git-hooks to run unit tests and generate test coverage reports.
- `deno task benchmark` - runs benchmarking comparing perft speed with other engines
- `deno task stats` - displays test coverage and benchmarking statistics
- `deno task test` - runs all tests
- `deno task test-unit` - runs unit tests
- `deno task test-integration` - runs integration tests
- `deno task test-coverage` - runs unit tests and updates test coverage
- `deno task test-coverage-html` - launches browser window displaying Deno-generated static HTML page with test coverage details

## CI Pipeline Rules

- `pre.commit` (all branches) - must pass unit tests and update test coverage