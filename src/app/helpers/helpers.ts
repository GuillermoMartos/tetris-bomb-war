import { tetraedrum, tetraedrumPosition } from "@/redux/actions/piecesSlice";
import { matrix, pieceRotatorCounterClockwise } from "../shapes/shapes";

export interface changePieceIndicator {
  right: boolean;
  left: boolean;
  rotate: boolean;
}
export type collisionHappened = {
  collision: boolean;
  gameOver: boolean;
  askNewPiece: boolean;
};

export function changePositionsAndUpdateBoard(
  copyBoard: matrix,
  piece: tetraedrum
): [collisionHappened, matrix, tetraedrum] {
  const newPiece: tetraedrum = {
    position: { ...piece.position, x: piece.position.x + 1 },
    shape: piece.shape.slice(),
  };
  // deep copy, the array is nested, so a simple array slice won't work
  const originalCopyBoard: matrix = JSON.parse(JSON.stringify(copyBoard));
  for (let xIndex = piece.shape.length - 1; xIndex !== -1; xIndex--) {
    for (let [yindex, pieceOccupation] of piece.shape[xIndex].entries()) {
      // check bottom line collision and ask for new piece
      if (xIndex + piece.position.x === 20) {
        return [
          { collision: true, askNewPiece: true, gameOver: false },
          copyBoard,
          piece,
        ];
      }
      // check collision with other piece
      if (
        pieceOccupation !== 0 &&
        copyBoard[xIndex + piece.position.x][piece.position.y + yindex] !== 0
      ) {
        // if with hit other piece in piece position 0, it's game over
        if (piece.position.x === 0) {
          return [
            { collision: true, askNewPiece: false, gameOver: true },
            copyBoard,
            piece,
          ];
        }
        // if we hit other piece, we ask for a new piece
        return [
          { collision: true, askNewPiece: true, gameOver: false },
          originalCopyBoard,
          piece,
        ];
      }
      if (
        pieceOccupation !== 0 &&
        copyBoard[xIndex + piece.position.x][piece.position.y + yindex] === 0
      ) {
        copyBoard[xIndex + piece.position.x][piece.position.y + yindex] =
          pieceOccupation;
      }
      if (piece.position.x !== 0 && pieceOccupation !== 0) {
        copyBoard[xIndex + piece.position.x - 1][piece.position.y + yindex] = 0;
      }
    }
  }
  return [
    { collision: false, askNewPiece: false, gameOver: false },
    copyBoard,
    newPiece,
  ];
}

export function checkKeyboardCommands(
  board: matrix,
  piece: tetraedrum,
  changer: changePieceIndicator
): [collisionHappened, matrix, tetraedrum] {
  const newPiece: tetraedrum = {
    position: {
      x: piece.position.x - 1,
      y: changer.rotate
        ? piece.position.y
        : changer.left
        ? piece.position.y - 1
        : piece.position.y + 1,
    },
    shape: piece.shape,
  };
  // deep copy, the array is nested, so a simple array slice won't work
  const copyBoard: matrix = JSON.parse(JSON.stringify(board));
  if (changer.left) {
    for (let [xIndex, row] of piece.shape.entries()) {
      for (let [yindex, pieceOccupation] of row.entries()) {
        // check collision with other piece
        if (
          pieceOccupation !== 0 &&
          board[newPiece.position.x + xIndex][newPiece.position.y + yindex] !==
            0
        ) {
          // if we hit other piece, we ask for a new piece
          return [
            { collision: true, askNewPiece: true, gameOver: false },
            copyBoard,
            piece,
          ];
        }
        // set new y position in the matrix and clean the past y position
        if (pieceOccupation !== 0) {
          board[newPiece.position.x + xIndex][newPiece.position.y + yindex] =
            pieceOccupation;
          board[newPiece.position.x + xIndex][
            newPiece.position.y + yindex + 1
          ] = 0;
        }
      }
    }
  } else if (changer.right) {
    for (let [xIndex, row] of piece.shape.entries()) {
      //for (let xIndex = piece.shape.length - 1; xIndex !== -1; xIndex--) {
      for (let yindex = row.length - 1; yindex !== -1; yindex--) {
        const pieceOccupation = row[yindex];
        // check collision with other piece
        if (
          pieceOccupation !== 0 &&
          board[newPiece.position.x + xIndex][newPiece.position.y + yindex] !==
            0
        ) {
          // if we hit other piece, we ask for a new piece
          return [
            { collision: true, askNewPiece: true, gameOver: false },
            copyBoard,
            piece,
          ];
        }
        // set new y position in the matrix and clean the past y position
        if (pieceOccupation !== 0) {
          board[newPiece.position.x + xIndex][newPiece.position.y + yindex] =
            pieceOccupation;
          board[newPiece.position.x + xIndex][
            newPiece.position.y + yindex - 1
          ] = 0;
        }
      }
    }
  } else if (changer.rotate) {
    let pieceBeforeRotation: tetraedrum = {
      position: { x: piece.position.x - 1, y: piece.position.y },
      shape: pieceRotatorCounterClockwise(piece.shape),
    };
    let pieceRotatedCleanFromMatrix: matrix = JSON.parse(JSON.stringify(board));
    for (let [xIndex, row] of pieceBeforeRotation.shape.entries()) {
      for (let [yindex, pieceOccupation] of row.entries()) {
        // clean the piece as it was before, so if we check no collision, we print the new rotated over this cleaned matrix
        if (pieceOccupation !== 0) {
          pieceRotatedCleanFromMatrix[pieceBeforeRotation.position.x + xIndex][
            pieceBeforeRotation.position.y + yindex
          ] = 0;
        }
      }
    }

    try {
      for (let [xIndex, row] of newPiece.shape.entries()) {
        for (let [yindex, pieceOccupation] of row.entries()) {
          // check collision with other piece
          if (
            pieceOccupation !== 0 &&
            pieceRotatedCleanFromMatrix[piece.position.x + xIndex][
              piece.position.y + yindex
            ] !== 0
          ) {
            // if we hit other piece, we don't allow the rotation
            return [
              { collision: false, askNewPiece: true, gameOver: false },
              copyBoard,
              pieceBeforeRotation,
            ];
          }
          // set new y position in the previous cleaned matrix
          if (pieceOccupation !== 0) {
            pieceRotatedCleanFromMatrix[newPiece.position.x + xIndex][
              newPiece.position.y + yindex
            ] = pieceOccupation;
            pieceRotatedCleanFromMatrix[newPiece.position.x + xIndex][
              newPiece.position.y + yindex + 1
            ] = 0;
          }
        }
      }
    } catch (err) {
      console.log("error", err);
    }
    return [
      { collision: false, askNewPiece: false, gameOver: false },
      pieceRotatedCleanFromMatrix,
      newPiece,
    ];
  }
  return [
    { collision: false, askNewPiece: false, gameOver: false },
    board,
    newPiece,
  ];
}
