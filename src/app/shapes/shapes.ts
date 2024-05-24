export type matrix = number[][];

const squareBoy: matrix = [
  [1, 1],
  [1, 1],
];

const bigBoy: matrix = [[1], [1], [1], [1]];

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
  const rowsToColumns = piece[0].map((_, colIndex) =>
    piece.map((row) => row[colIndex])
  );
  const reversedRows = rowsToColumns.map((row) => row.reverse());

  return reversedRows;
}

export function pieceRotatorCounterClockwise(piece: matrix): matrix {
  const columnsToRows = piece[0].map((_, colIndex) =>
    piece.map((row) => row[colIndex])
  );
  const reversedColumns = columnsToRows.reverse();

  return reversedColumns;
}

export function assignNewRandomPieceShape(): matrix {
  const allShapes = [squareBoy, bigBoy, tBoy, lBoy, snakySnake, boomBomb];
  return allShapes[Math.floor(Math.random() * allShapes.length)];
}
