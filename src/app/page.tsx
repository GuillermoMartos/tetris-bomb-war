"use client";
import { UseAppDispatch, useAppSelector } from "@/redux/hooks";
import styles from "./page.module.css";
import {
  startEndGame,
  nextTetra,
  tetraedrum,
} from "@/redux/actions/piecesSlice";
import { useEffect, useRef, useState } from "react";
import {
  changeY,
  changePositionsAndUpdateBoard,
  checkGameOver,
  collisionHappened,
} from "./helpers/helpers";
import Board from "./components/board";
import {
  assignNewRandomPieceShape,
  matrix,
  pieceRotator,
} from "./shapes/shapes";

export default function Home() {
  const initialSpeed = 150;
  const isPlaying = useAppSelector((state) => state.playing);
  const dispatch = UseAppDispatch();
  var currentPiece = useAppSelector((s) => s.currentTetraedrum);
  var nextPiece = useAppSelector((s) => s.nextTetraedrum);
  const [copyPiece, setcopyPiece] = useState<null | tetraedrum>(null);
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [boardMatrix, setboardMatrix] = useState<matrix>(
    Array(20)
      .fill(0)
      .map(() => Array(10).fill(0))
  );
  let changeMovementRef = useRef(false);
  let busyMovementRef = useRef(false);
  let disableKeyboardMovementsRef = useRef(false);

  // read every speed time to set matrixBoard each time
  useEffect(() => {
    if (!currentPiece && isPlaying) {
      console.log("queee!");
      dispatch(
        nextTetra({
          position: { x: 0, y: 5 },
          shape: assignNewRandomPieceShape(),
        })
      );
      return;
    }
    function handleKeyboardCommands(event: KeyboardEvent) {
      if (event.code == "Enter") {
        dispatch(startEndGame(isPlaying));
      }
      if (disableKeyboardMovementsRef.current) {
        disableKeyboardMovementsRef.current = false;
        return;
      }
      // currentPiece right or left moving from keyboard
      if (event.code === "ArrowLeft" && copyPiece && !busyMovementRef.current) {
        // moving the piece change references so shooter() won't thrigger twice
        changeMovementRef.current = !changeMovementRef.current;
        busyMovementRef.current = !busyMovementRef.current;
        if (currentPiece && isPlaying) {
          const changer: changeY = { right: false, left: true };
          shooter(boardMatrix, changer);
        }
      } else if (
        event.code === "ArrowRight" &&
        copyPiece &&
        !busyMovementRef.current
      ) {
        busyMovementRef.current = !busyMovementRef.current;
        changeMovementRef.current = !changeMovementRef.current;
        const changer: changeY = { right: true, left: false };
        shooter(boardMatrix, changer);
      }
    }
    window.addEventListener("keydown", handleKeyboardCommands);

    // this will thrigger shooter each speed time for pieces to go down
    if (currentPiece && isPlaying && !changeMovementRef.current) {
      // deep copy, the array is nested, so a simple array slice won't work
      const copyMatrix: matrix = JSON.parse(JSON.stringify(boardMatrix));
      const [collisionHappened, boardToUpdate, newCopyPiece] =
        changePositionsAndUpdateBoard(copyMatrix, copyPiece ?? currentPiece);
      if (!collisionHappened.collision) {
        setcopyPiece(newCopyPiece);
        shooter(boardToUpdate);
      } else if (collisionHappened.collision) {
        shooter(copyMatrix, undefined, collisionHappened);
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyboardCommands);
    };
  }, [currentPiece, isPlaying, boardMatrix]);

  async function shooter(
    boardToUpdate: matrix,
    changeY?: changeY,
    collisionHappened?: collisionHappened
  ) {
    await moveLoop(boardToUpdate, speed, changeY, collisionHappened);
    setScore(score + 0.3);
    return;
  }

  async function moveLoop(
    boardToUpdate: matrix,
    speed: number,
    changeY?: changeY,
    collisionHappened?: collisionHappened
  ) {
    let esperame = setTimeout(() => {
      // check colission for game over or new piece dispatch
      if (collisionHappened?.collision) {
        if (collisionHappened.gameOver) {
          setcopyPiece(null);
          alert("Game Over");
          return dispatch(startEndGame(isPlaying));
        }
        setcopyPiece(null);
        return dispatch(
          nextTetra({
            position: { x: 0, y: 5 },
            shape: assignNewRandomPieceShape(),
          })
        );
      }
      // la currentPieceCopy con que manejamos la dinamica de movimiento para abajo lee primero si tiene que moverse izq/der
      if (changeMovementRef.current && copyPiece && changeY) {
        // no permite moverse fuera de los límites
        if (
          (copyPiece.position.y === 0 && changeY.left) ||
          (copyPiece.position.y === 9 && changeY.right)
        ) {
          changeMovementRef.current = !changeMovementRef.current;
          busyMovementRef.current = false;
          return setboardMatrix((prev) => {
            return prev.slice();
          });
        }
        if (copyPiece.position.x < 18) {
          if (
            boardToUpdate[copyPiece.position.x + 1][copyPiece.position.y] !== 0
          ) {
            return setboardMatrix((prev) => prev);
          }
        }
        if (
          copyPiece &&
          boardToUpdate[copyPiece.position.x][
            changeY.left ? copyPiece.position.y - 1 : copyPiece.position.y + 1
          ] == 0
        ) {
          const secondCopyPiece = { ...copyPiece };
          setcopyPiece((prev) => {
            if (prev)
              return {
                ...prev,
                position: {
                  y: changeY.left ? prev.position.y - 1 : prev.position.y + 1,
                  x: prev.position.x,
                },
              };
            return prev;
          });

          setboardMatrix((prev) => {
            let copyMatrix = prev.slice();
            if (
              (copyMatrix[secondCopyPiece.position.x][
                secondCopyPiece.position.y
              ] = 1)
            ) {
            }
            // borrado del anterior casillero ocupado
            copyMatrix[secondCopyPiece.position.x][
              secondCopyPiece.position.y
            ] = 0;
            // pintado del nuevo casillero ojo, acá vamos a mirar también que no estemos en el borde ya del eje Y
            copyMatrix[secondCopyPiece.position.x][
              changeY.left
                ? secondCopyPiece.position.y - 1
                : secondCopyPiece.position.y + 1
            ] = 1;
            return copyMatrix.slice();
          });
          busyMovementRef.current = false;
          changeMovementRef.current = !changeMovementRef.current;

          return;
        }
        busyMovementRef.current = false;
        changeMovementRef.current = !changeMovementRef.current;
        return dispatch(
          nextTetra({
            position: {
              x: copyPiece.position.x,
              y: copyPiece.position.y,
            },
            shape: assignNewRandomPieceShape(),
          })
        );
      }

      // we update the matrix board inside the timeout with our dynamic speed waiting
      setboardMatrix(() => {
        return boardToUpdate.slice();
      });
      clearTimeout(esperame);
    }, speed);
  }

  return (
    <div>
      {!isPlaying ? (
        <h1
          id="event-start"
          className={styles["starter-text"]}
          onClick={(e) => {
            dispatch(startEndGame(isPlaying));
          }}
        >
          Press Enter or click here to play/pause
          <br />
          Your score: {score.toFixed(0)}
        </h1>
      ) : (
        <div>
          <h1
            id="event-start"
            className={styles["starter-text"]}
            onClick={(e) => {
              dispatch(startEndGame(isPlaying));
            }}
          >
            Press Enter or click here to play/pause
          </h1>
          <h1>Your score: {score.toFixed(0)}</h1>
          {maxScore ? <h1>Max score: {maxScore.toFixed(0)}</h1> : null}
        </div>
      )}
      {boardMatrix ? <Board boardMatrix={boardMatrix}></Board> : null}
    </div>
  );
}
