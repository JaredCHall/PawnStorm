# BitChess
BitChess is a robust, headless chess game engine designed for seamless integration with various user interfaces. Whether you're developing a visually appealing desktop application or a responsive web interface, BitChess provides a solid foundation with its comprehensive game representation and manipulation capabilities.

While the primary goal of BitChess is to offer a dependable backend for chess applications, a significant part of the project's joy comes from its performance optimization. The engine is fine-tuned to excel in performance tests, particularly in calculating perft benchmarks. Although achieving a fast perft is not essential for the engine's core functionality, it represents a delightful challenge and a testament to the efficiency of the code. This aspect of BitChess might be particularly appealing to fellow programmers and enthusiasts who appreciate the art of optimization in software development.

Features:
- Game API which can be wired up to a UI
- Basic console interface
- Support for coordinate and algebraic notation
- Support for FEN numbers and PGN files

Internal Features:
- Mailbox board representation: 120-item array of 8-bit unsigned integers
- Legal move generation
- Perft and kiwipete performance tests

## Documentation:
 - [Game Api](docs/GameApi.md) - For wiring up a UI
 - [Console Interface](docs/ConsoleInterface.md) - Example Console Implementation
 - [Performance Tests](docs/PerformanceTesting.md) - All about Performance Testing

