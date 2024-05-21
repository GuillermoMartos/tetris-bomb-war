export type matrix = number[][];

const squareBoy: matrix = [
  [1, 1],
  [1, 1],
];

const bigBoy: matrix = [
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
];

const tBoy: matrix = [
  [0, 1, 0],
  [1, 1, 1],
];

const lBoy: matrix = [
  [1, 0],
  [1, 0],
  [1, 1],
];

const snakySnake: matrix = [
  [1, 1, 0],
  [0, 1, 1],
];

const boomBomb: matrix = [
  [2, 2],
  [2, 2],
];

export function pieceRotator(piece: matrix): matrix {
  let rowsToColumns = piece[0].map((_, colIndex) =>
    piece.map((row) => row[colIndex])
  );
  let reversedRows = rowsToColumns.map((row) => row.reverse());

  return reversedRows;
}

export function assignNewRandomPieceShape() {
  const allShapes = [squareBoy, bigBoy, tBoy, lBoy, snakySnake, boomBomb];
  return allShapes[Math.floor(Math.random() * allShapes.length)];
}
