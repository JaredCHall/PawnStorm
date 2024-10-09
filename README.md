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
  - Game Clock with Increment and Delay
- Interfaces with popular chess engines:
  - Stockfish
  - Ethereal
  - Rustic Chess
- Console Application
  - Play against your favorite engine
  - Watch engines battle other engines
  - Add engine evaluations to PGN

## Road to 1.0

- Polish Game API

## Documentation
 - [Game Engine](docs/GameEngine) - For UI or Game Server
 - [Engine Interfaces](docs/EngineInterfaces.md) - Communicating with locally compiled engines
 - [Console Applications](docs/ConsoleApplications) - Included console applications. Can be used for fun or as an example of how to use the API.
 - [Tests and Benchmarks](docs/TestsAndBenchmarks) - How the engine is tested and benchmarked

## Usage
- `deno task play` - Play against an AI engine or watch engines battle each other

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