"use client";
import { UseAppDispatch, useAppSelector } from "@/redux/hooks";
import styles from "./page.module.css";
import {
  startEndGame,
  nextTetra,
  tetraedrum,
  currentTetra,
} from "@/redux/actions/piecesSlice";
import { useEffect, useRef, useState } from "react";
import {
  changePieceIndicator,
  changePositionsAndUpdateBoard,
  collisionHappened,
  checkKeyboardCommands,
} from "./helpers/helpers";
import Board from "./components/board";
import {
  assignNewRandomPieceShape,
  matrix,
  pieceRotator,
} from "./shapes/shapes";

export default function Home() {
  const initialSpeed = 300;
  const isPlaying = useAppSelector((state) => state.playing);
  const dispatch = UseAppDispatch();
  var currentPiece = useAppSelector<tetraedrum | null>(
    (state) => state.currentTetraedrum
  );
  var nextPiece = useAppSelector<tetraedrum | null>(
    (state) => state.nextTetraedrum
  );
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
      dispatch(
        nextTetra({
          position: { x: 0, y: 1 },
          shape: assignNewRandomPieceShape(),
        })
      );
    }
    window.addEventListener("keydown", handleKeyboardCommands);
    function handleKeyboardCommands(event: KeyboardEvent) {
      if (event.code == "Enter") {
        dispatch(startEndGame(isPlaying));
      }
      if (disableKeyboardMovementsRef.current) {
        disableKeyboardMovementsRef.current = false;
        return;
      }
      if (event.code === "Space" && !busyMovementRef.current && copyPiece) {
        changeMovementRef.current = true;
        busyMovementRef.current = true;
        let copyMatrix: matrix = JSON.parse(JSON.stringify(boardMatrix));
        const changer: changePieceIndicator = {
          right: false,
          left: false,
          rotate: true,
        };
        const rotatedPiece: tetraedrum = {
          ...copyPiece,
          shape: pieceRotator(copyPiece.shape),
        };
        const [collisionHappened, boardToUpdate, newPiece] =
          checkKeyboardCommands(copyMatrix, rotatedPiece, changer);
        if (!collisionHappened.collision) {
          shooter(boardToUpdate, speed).then(() => {
            setcopyPiece(newPiece);
            setboardMatrix(boardToUpdate);
            let awaitFinishingCurrent = setTimeout(() => {
              changeMovementRef.current = !changeMovementRef.current;
              busyMovementRef.current = !busyMovementRef.current;
              const advanceNewPiece = {
                ...newPiece,
                position: {
                  ...newPiece.position,
                  x: newPiece.position.x + 1,
                },
              };
              setcopyPiece(advanceNewPiece);
              dispatch(currentTetra(advanceNewPiece));
              clearTimeout(awaitFinishingCurrent);
            }, speed);
          });
        } else if (collisionHappened.collision) {
          shooter(copyMatrix, speed, collisionHappened);
        }
      }
      // Piece right or left moving from keyboard
      if (event.code === "ArrowLeft" && !busyMovementRef.current && copyPiece) {
        // right side border reached
        if (copyPiece.position.y === 0) {
          return;
        }
        // moving the piece change references so shooter() won't thrigger twice
        changeMovementRef.current = true;
        busyMovementRef.current = true;
        let copyMatrix: matrix = JSON.parse(JSON.stringify(boardMatrix));
        const changer: changePieceIndicator = {
          right: false,
          left: true,
          rotate: false,
        };
        const [collisionHappened, boardToUpdate, newPiece] =
          checkKeyboardCommands(copyMatrix, copyPiece, changer);
        if (!collisionHappened.collision) {
          shooter(boardToUpdate, speed).then(() => {
            setcopyPiece(newPiece);
            setboardMatrix(boardToUpdate);
            let awaitFinishingCurrent = setTimeout(() => {
              changeMovementRef.current = !changeMovementRef.current;
              busyMovementRef.current = !busyMovementRef.current;
              const advanceNewPiece = {
                ...newPiece,
                position: {
                  ...newPiece.position,
                  x: newPiece.position.x + 1,
                },
              };
              setcopyPiece(advanceNewPiece);
              dispatch(currentTetra(advanceNewPiece));
              clearTimeout(awaitFinishingCurrent);
            }, speed);
          });
        } else if (collisionHappened.collision) {
          shooter(copyMatrix, speed, collisionHappened);
        }
      } else if (
        event.code === "ArrowRight" &&
        copyPiece &&
        !busyMovementRef.current
      ) {
        // right side border reached
        if (copyPiece.position.y === 9) {
          return;
        }
        // moving the piece change references so shooter() won't thrigger twice
        changeMovementRef.current = true;
        busyMovementRef.current = true;
        let copyMatrix: matrix = JSON.parse(JSON.stringify(boardMatrix));
        const changer: changePieceIndicator = {
          right: true,
          left: false,
          rotate: false,
        };
        const [collisionHappened, boardToUpdate, newPiece] =
          checkKeyboardCommands(copyMatrix, copyPiece, changer);
        if (!collisionHappened.collision) {
          shooter(boardToUpdate, speed).then(() => {
            setcopyPiece(newPiece);
            setboardMatrix(boardToUpdate);
            let awaitFinishingCurrent = setTimeout(() => {
              changeMovementRef.current = !changeMovementRef.current;
              busyMovementRef.current = !busyMovementRef.current;
              const advanceNewPiece = {
                ...newPiece,
                position: {
                  ...newPiece.position,
                  x: newPiece.position.x + 1,
                },
              };
              setcopyPiece(advanceNewPiece);
              dispatch(currentTetra(advanceNewPiece));
              clearTimeout(awaitFinishingCurrent);
            }, speed);
          });
        } else if (collisionHappened.collision) {
          shooter(copyMatrix, speed, collisionHappened);
        }
      }
    }

    // this will thrigger shooter each speed time for pieces to go down
    if (!changeMovementRef.current && isPlaying && currentPiece) {
      // deep copy, the array is nested, so a simple array slice won't work
      const copyMatrix: matrix = JSON.parse(JSON.stringify(boardMatrix));
      const [collisionHappened, boardToUpdate, newCopyPiece] =
        changePositionsAndUpdateBoard(copyMatrix, copyPiece ?? currentPiece);
      if (!collisionHappened.collision) {
        setcopyPiece(newCopyPiece);
        shooter(boardToUpdate, speed);
      } else if (collisionHappened.collision) {
        shooter(copyMatrix, speed, collisionHappened);
      }
    }
    return () => {
      window.removeEventListener("keydown", handleKeyboardCommands);
    };
  }, [currentPiece, isPlaying, boardMatrix]);

  async function shooter(
    boardToUpdate: matrix,
    speed: number,
    collisionHappened?: collisionHappened
  ) {
    moveLoop(boardToUpdate, speed, collisionHappened);
    setScore(score + 0.3);
  }

  async function moveLoop(
    boardToUpdate: matrix,
    speed: number,
    collisionHappened?: collisionHappened
  ) {
    let esperame = setTimeout(() => {
      // check colission for game over or new piece dispatch

      if (collisionHappened?.collision) {
        busyMovementRef.current
          ? (busyMovementRef.current = !busyMovementRef.current)
          : null;
        changeMovementRef.current
          ? (changeMovementRef.current = !changeMovementRef.current)
          : null;
        if (collisionHappened.gameOver) {
          setcopyPiece(null);
          alert("Game Over");
          return dispatch(startEndGame(isPlaying));
        }
        setcopyPiece(null);
        return dispatch(
          nextTetra({
            position: { x: 0, y: 2 },
            shape: assignNewRandomPieceShape(),
          })
        );
      }

      if (!changeMovementRef.current) {
        // we update the matrix board inside the timeout with our dynamic speed waiting
        setboardMatrix(() => {
          return boardToUpdate.slice();
        });
      }
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
