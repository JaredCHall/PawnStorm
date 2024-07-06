# BitChess
BitChess is a robust, headless chess game engine designed for seamless integration with various user interfaces. Whether you're developing a visually appealing desktop application or a responsive web interface, BitChess provides a solid foundation with its comprehensive game representation and manipulation capabilities.

While the primary goal of BitChess is to offer a dependable backend for chess applications, a significant part of the project's joy comes from its performance optimization. The engine is fine-tuned to excel in performance tests, particularly in calculating perft benchmarks. While it cannot compete with established engines, in this hobbyist's opinion, it is pretty darn fast for Javascript.

Features:
- Game API which can be wired up to a UI
- Interfaces with popular chess engines:
  - Stockfish
  - Leela (pending)
  - Ethereal (pending)
  - Rustic Chess (pending)
- Support for FEN numbers and PGN files
- Local position database powered by sqlite (pending)
- Basic console interface to play against Engines
- Accuracy and Performance testing

## Documentation:
 - [Game Api](docs/GameApi.md) - For wiring up a UI
 - [Console Interface](docs/ConsoleInterface.md) - Example Console Implementation
 - [Performance Tests](docs/PerformanceTesting.md) - All about Performance Testing

