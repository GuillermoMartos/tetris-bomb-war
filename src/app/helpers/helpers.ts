import { tetraedrum, tetraedrumPosition } from "@/redux/actions/piecesSlice";
import { matrix } from "../shapes/shapes";

export interface changeY {
  right: boolean;
  left: boolean;
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
  let newPiece: tetraedrum = {
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
            originalCopyBoard,
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

export function checkGameOver(copyMatrix: matrix): boolean {
  return copyMatrix[0].some((el) => el === 1);
}

//pide currentPiece nueva cuando la anterior ya cayó
/* if (
        copyPiece.position.x == 20 ||
        boardToUpdate[copyPiece.position.x][copyPiece.position.y] == 1
      ) {
        disableKeyboardMovementsRef.current = true;
        // check linea completa para borrado
        setboardMatrix((prev) => {
          let copyMatrix = prev.slice();
          for (let index = 0; index < copyMatrix.length; index++) {
            if (!copyMatrix[index].some((el) => el === 0)) {
              copyMatrix.splice(index, 1);
              copyMatrix.unshift(Array(10).fill(0));
              setScore((prev) => {
                return prev + 50;
              });
              setSpeed((prev) => {
                return prev * 0.95;
              });
            }
          }
          return prev.slice();
        });
        dispatch(
          nextTetra({
            position: { x: 0, y: 5  },
            shape: assignNewRandomPieceShape(),
          })
        );
        setcopyPiece(null);
        disableKeyboardMovementsRef.current = false;
        return;
      } */
