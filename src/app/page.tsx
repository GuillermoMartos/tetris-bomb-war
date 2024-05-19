"use client";
import { UseAppDispatch, useAppSelector } from "@/redux/hooks";
import styles from "./page.module.css";
import { startEndGame, nextTetra, tetras } from "@/redux/actions/piecesSlice";
import { useEffect, useRef, useState } from "react";
import {
  bucketIndex,
  randomEmptySpacesChanger,
  removeBuckets,
} from "./helpers/helpers";

interface changeY {
  right: boolean;
  left: boolean;
}

export default function Home() {
  const initialSpeed = 100;
  const isPlaying = useAppSelector((state) => state.playing);
  const dispatch = UseAppDispatch();
  var actualPiece = useAppSelector((s) => s.nextTetraedrum);
  const [copyPiece, setcopyPiece] = useState<null | tetras>(null);
  const [score, setScore] = useState(0);
  const [specialClock, setSpecialClock] = useState(0);
  const [bucketsIndexs, setBucketsIndexs] = useState<bucketIndex>();
  const [maxScore, setMaxScore] = useState(0);
  const [speed, setSpeed] = useState(initialSpeed);
  const [boardMatrix, setboardMatrix] = useState(
    Array(20)
      .fill(0)
      .map(() => Array(10).fill(0))
  );
  let changeMovementRef = useRef(false);
  let busyMovementRef = useRef(false);
  let cleanBucketsRef = useRef(false);
  let disableKeyboardMovementsRef = useRef(false);

  // special buckets clock appear/disapear
  useEffect(() => {
    if (cleanBucketsRef.current) {
      const intervalId = setInterval(() => {
        setSpecialClock((prevClock) => {
          if (prevClock > 0) {
            return prevClock - 1;
          } else {
            cleanBucketsRef.current = false;
            clearInterval(intervalId);
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [specialClock]);

  // read every speed time to set matrixBoard each time
  useEffect(() => {
    if (!actualPiece && isPlaying) {
      dispatch(
        nextTetra({
          playing: true,
          currentTetraedrum: { x: 0, y: 0 },
          nextTetraedrum: { x: 0, y: 4 },
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
      // actualPiece right or left moving from keyboard
      if (event.code === "ArrowLeft" && copyPiece && !busyMovementRef.current) {
        // moving the piece change references so shooter() won't thrigger twice
        changeMovementRef.current = !changeMovementRef.current;
        busyMovementRef.current = !busyMovementRef.current;
        if (actualPiece && isPlaying) {
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
    if (actualPiece && isPlaying && !changeMovementRef.current) {
      setcopyPiece((prev) => {
        if (!prev) {
          return actualPiece;
        }
        return prev;
      });
      shooter(boardMatrix);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyboardCommands);
    };
  }, [actualPiece, isPlaying, boardMatrix]);

  async function shooter(tablas: number[][], changeY?: changeY) {
    await goDown(tablas, speed, changeY);
    setScore(score + 0.3);
    return;
  }

  async function goDown(tablas: number[][], speed: number, changeY?: changeY) {
    if (tablas[0].some((el) => el === 1)) {
      const index1 = tablas[0].indexOf(1);
      if (tablas[1][index1] === 1) {
        dispatch(startEndGame(isPlaying));
        setboardMatrix(
          Array(20)
            .fill(0)
            .map(() => Array(10).fill(0))
        );
        if (score > maxScore) {
          setMaxScore(score);
        }
        actualPiece = null;
        setSpeed(initialSpeed);
        return alert("GAME OVER");
      }
    }
    let esperame = setTimeout(() => {
      if (!copyPiece) {
        return setboardMatrix((prev) => prev.slice());
      }

      // la actualPieceCopy con que manejamos la dinamica de movimiento para abajo lee primero si tiene que moverse izq/der
      if (changeMovementRef.current && copyPiece && changeY) {
        // no permite moverse fuera de los límites
        if (
          (copyPiece.y === 0 && changeY.left) ||
          (copyPiece.y === 9 && changeY.right)
        ) {
          changeMovementRef.current = !changeMovementRef.current;
          busyMovementRef.current = false;
          return setboardMatrix((prev) => {
            if (!cleanBucketsRef.current && bucketsIndexs) {
              setBucketsIndexs(undefined);
              return removeBuckets(prev, bucketsIndexs).slice();
            }
            return prev.slice();
          });
        }
        if (copyPiece.x < 18) {
          if (tablas[copyPiece.x + 1][copyPiece.y] !== 0) {
            return setboardMatrix((prev) => prev);
          }
        }
        if (
          copyPiece &&
          tablas[copyPiece.x][
            changeY.left ? copyPiece.y - 1 : copyPiece.y + 1
          ] == 0
        ) {
          const secondCopyPiece = { ...copyPiece };
          setcopyPiece((prev) => {
            if (prev)
              return { y: changeY.left ? prev.y - 1 : prev.y + 1, x: prev.x };
            return prev;
          });

          setboardMatrix((prev) => {
            let copyMatrix = prev.slice();
            if ((copyMatrix[secondCopyPiece.x][secondCopyPiece.y] = 1)) {
            }
            // borrado del anterior casillero ocupado
            copyMatrix[secondCopyPiece.x][secondCopyPiece.y] = 0;
            // pintado del nuevo casillero ojo, acá vamos a mirar también que no estemos en el borde ya del eje Y
            copyMatrix[secondCopyPiece.x][
              changeY.left ? secondCopyPiece.y - 1 : secondCopyPiece.y + 1
            ] = 1;
            if (!cleanBucketsRef.current && bucketsIndexs) {
              setBucketsIndexs(undefined);
              return removeBuckets(copyMatrix, bucketsIndexs).slice();
            }
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
            playing: isPlaying,
            currentTetraedrum: { x: copyPiece.x, y: copyPiece.y },
            nextTetraedrum: { x: copyPiece.x, y: copyPiece.y },
          })
        );
      }

      if (copyPiece.x < 19) {
        setcopyPiece((prevState) => {
          if (!prevState) return null;
          return { ...prevState, x: prevState.x + 1 };
        });
      }

      //pide actualPiece nueva cuando la anterior ya cayó
      if (copyPiece.x == 20 || tablas[copyPiece.x][copyPiece.y] == 1) {
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
              const [result, indexs] = randomEmptySpacesChanger(copyMatrix);
              if (result && indexs) {
                setBucketsIndexs(indexs);
                setSpecialClock(10);
                cleanBucketsRef.current = true;
                return result.slice();
              }
            }
          }
          return prev.slice();
        });
        dispatch(
          nextTetra({
            playing: isPlaying,
            currentTetraedrum: { x: 1, y: 1 },
            nextTetraedrum: { x: 0, y: Math.floor(Math.random() * 10) },
          })
        );
        setcopyPiece(null);
        disableKeyboardMovementsRef.current = false;
        return;
      }

      if (copyPiece.x < 18 && tablas[copyPiece.x + 2][copyPiece.y] == 1) {
        disableKeyboardMovementsRef.current = true;
      }

      //lógica de vaciar o llenar cuadros del tablero en bajada
      if (copyPiece && tablas[copyPiece.x][copyPiece.y] == 0) {
        setboardMatrix((prev) => {
          if (!actualPiece) {
            return prev;
          }
          const copyMatrix = prev.slice();

          // limpia los casilleros donde estuvo el bloque, ya que avanza hacia abajo
          if (copyPiece.x !== 0) {
            copyMatrix[copyPiece.x - 1][copyPiece.y] = 0;
          }

          // pinta los casilleros que ocupa la actualPiece en su movimiento
          copyMatrix[copyPiece.x][copyPiece.y] = 1;
          if (!cleanBucketsRef.current && bucketsIndexs) {
            setBucketsIndexs(undefined);
            return removeBuckets(copyMatrix, bucketsIndexs).slice();
          }
          return copyMatrix.slice();
        });
      }

      if (copyPiece && tablas[copyPiece.x][copyPiece.y] == 2) {
        setScore(score + 20);
        setboardMatrix((prev) => {
          if (!actualPiece) {
            return prev;
          }
          const copyMatrix = prev.slice();
          // limpia los casilleros donde estuvo el bloque, ya que avanza hacia abajo
          if (copyPiece.x !== 0) {
            copyMatrix[copyPiece.x - 1][copyPiece.y] = 0;
          }
          // saca el balde
          copyMatrix[copyPiece.x][copyPiece.y] = 0;
          return copyMatrix.slice();
        });
        dispatch(
          nextTetra({
            playing: isPlaying,
            currentTetraedrum: { x: 1, y: 1 },
            nextTetraedrum: { x: 0, y: Math.floor(Math.random() * 10) },
          })
        );
        setcopyPiece(null);
      }
      clearTimeout(esperame);
    }, speed);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: "1px",
        flexWrap: "wrap",
        maxWidth: "22em",
      }}
    >
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
          {specialClock ? `Crazy Buckets timer! ${specialClock}` : null}
        </div>
      )}
      {boardMatrix &&
        boardMatrix.map((el, index) => {
          const tot = el as any[];
          return tot.map((pip, ses) => {
            if (pip === 0) {
              return (
                <div style={{ fontSize: "2em" }} key={ses}>
                  🟨
                </div>
              );
            }
            if (pip === 1) {
              return (
                <div style={{ fontSize: "2em" }} key={ses}>
                  ⬛️
                </div>
              );
            } else {
              return (
                <div style={{ fontSize: "2em" }} key={ses}>
                  🪣
                </div>
              );
            }
          });
        })}
    </div>
  );
}
