"use client";
import { UseAppDispatch, useAppSelector } from "@/redux/hooks";
import styles from "./page.module.css";
import { startEndGame, nextTetra, tetras } from "@/redux/actions/piezasSlice";
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
  const initialSpeed = 80;
  const jueguito = useAppSelector((state) => state.playing);
  const dispatch = UseAppDispatch();
  var pieza = useAppSelector((s) => s.nextTetraedrum);
  const [copyPieza, setCopyPieza] = useState<null | tetras>(null);
  const [score, setScore] = useState(0);
  const [specialClock, setSpecialClock] = useState(0);
  const [bucketsIndexs, setBucketsIndexs] = useState<bucketIndex>();
  const [maxScore, setMaxScore] = useState(0);
  const [speed, setSpeed] = useState(initialSpeed);
  const [tableroMatrix, setTableroMatrix] = useState(
    Array(20)
      .fill(0)
      .map(() => Array(10).fill(0))
  );
  let changeMovementRef = useRef(false);
  let busyMovementRef = useRef(false);
  let cleanBucketsRef = useRef(false);

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

      // Cleanup function to clear the interval when component unmounts or specialClock changes
      return () => clearInterval(intervalId);
    }
  }, [specialClock]);

  useEffect(() => {
    if (!pieza && jueguito) {
      dispatch(
        nextTetra({
          playing: true,
          currentTetraedrum: { x: 0, y: 0 },
          nextTetraedrum: { x: 0, y: 4 },
        })
      );
    }
    function handleKeyboardCommands(event: KeyboardEvent) {
      if (event.code == "Enter") {
        dispatch(startEndGame(jueguito));
      }
      // Lógica para mover la pieza según la tecla presionada
      if (event.code === "ArrowLeft" && copyPieza && !busyMovementRef.current) {
        // cambiar la referencia de mover la pieza previene thriggerear disparador dos veces
        changeMovementRef.current = !changeMovementRef.current;
        busyMovementRef.current = !busyMovementRef.current;
        if (pieza && jueguito) {
          const changer: changeY = { right: false, left: true };
          disparador(tableroMatrix, changer);
        }
      } else if (
        event.code === "ArrowRight" &&
        copyPieza &&
        !busyMovementRef.current
      ) {
        busyMovementRef.current = !busyMovementRef.current;
        changeMovementRef.current = !changeMovementRef.current;
        const changer: changeY = { right: true, left: false };
        disparador(tableroMatrix, changer);
      }
    }
    window.addEventListener("keydown", handleKeyboardCommands);

    if (pieza && jueguito && !changeMovementRef.current) {
      setCopyPieza((prev) => {
        if (!prev) {
          return pieza;
        }
        return prev;
      });
      disparador(tableroMatrix);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyboardCommands);
    };
  }, [pieza, jueguito, tableroMatrix]);

  async function disparador(tablas: number[][], changeY?: changeY) {
    if (pieza && copyPieza) {
      await goDown(tablas, speed, changeY);
      setScore(score + 0.3);
      return;
    }
    return setTableroMatrix(tableroMatrix.slice());
  }

  async function goDown(tablas: number[][], speed: number, changeY?: changeY) {
    if (tablas[0].some((el) => el === 1)) {
      const index1 = tablas[0].indexOf(1);
      if (tablas[1][index1] === 1) {
        dispatch(startEndGame(jueguito));
        setTableroMatrix(
          Array(20)
            .fill(0)
            .map(() => Array(10).fill(0))
        );
        if (score > maxScore) {
          setMaxScore(score);
        }
        pieza = null;
        setSpeed(initialSpeed);
        return alert("GAME OVER");
      }
    }
    let esperame = setTimeout(() => {
      if (!copyPieza) {
        return;
      }

      // la piezaCopy con que manejamos la dinamica de movimiento para abajo lee primero si tiene que moverse izq/der
      if (changeMovementRef.current && copyPieza && changeY) {
        // no permite moverse fuera de los límites
        if (
          (copyPieza.y === 0 && changeY.left) ||
          (copyPieza.y === 9 && changeY.right)
        ) {
          changeMovementRef.current = !changeMovementRef.current;
          busyMovementRef.current = false;
          return setTableroMatrix((prev) => {
            if (!cleanBucketsRef.current && bucketsIndexs) {
              setBucketsIndexs(undefined);
              return removeBuckets(prev, bucketsIndexs).slice();
            }
            return prev.slice();
          });
        }
        if (
          copyPieza &&
          tablas[copyPieza.x][
            changeY.left ? copyPieza.y - 1 : copyPieza.y + 1
          ] == 0
        ) {
          const segundoCopyPieza = { ...copyPieza };
          setCopyPieza((prev) => {
            if (prev)
              return { y: changeY.left ? prev.y - 1 : prev.y + 1, x: prev.x };
            return prev;
          });
          busyMovementRef.current = false;
          changeMovementRef.current = !changeMovementRef.current;
          setTableroMatrix((prev) => {
            let copyMatrix = prev.slice();
            // borrado del anterior casillero ocupado
            copyMatrix[segundoCopyPieza.x][segundoCopyPieza.y] = 0;
            // pintado del nuevo casillero ojo, acá vamos a mirar también que no estemos en el borde ya del eje Y
            copyMatrix[segundoCopyPieza.x][
              changeY.left ? segundoCopyPieza.y - 1 : segundoCopyPieza.y + 1
            ] = 1;
            if (!cleanBucketsRef.current && bucketsIndexs) {
              setBucketsIndexs(undefined);
              return removeBuckets(copyMatrix, bucketsIndexs).slice();
            }
            return copyMatrix.slice();
          });

          return;
        }
        busyMovementRef.current = false;
        changeMovementRef.current = !changeMovementRef.current;
        return dispatch(
          nextTetra({
            playing: jueguito,
            currentTetraedrum: { x: copyPieza.x, y: copyPieza.y },
            nextTetraedrum: { x: copyPieza.x, y: copyPieza.y },
          })
        );
      }

      if (copyPieza.x < 19) {
        setCopyPieza((prevState) => {
          if (!prevState) return null;
          return { ...prevState, x: prevState.x + 1 };
        });
      }

      //pide pieza nueva cuando la anterior ya cayó
      if (copyPieza.x == 20 || tablas[copyPieza.x][copyPieza.y] == 1) {
        // check linea completa para borrado
        setTableroMatrix((prev) => {
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
            playing: jueguito,
            currentTetraedrum: { x: 1, y: 1 },
            nextTetraedrum: { x: 0, y: Math.floor(Math.random() * 10) },
          })
        );
        setCopyPieza(null);
        return;
      }

      //lógica de vaciar o llenar cuadros del tablero en bajada
      if (copyPieza && tablas[copyPieza.x][copyPieza.y] == 0) {
        setTableroMatrix((prev) => {
          if (!pieza) {
            return prev;
          }
          const copyMatrix = prev.slice();

          // limpia los casilleros donde estuvo el bloque, ya que avanza hacia abajo
          if (copyPieza.x !== 0) {
            copyMatrix[copyPieza.x - 1][copyPieza.y] = 0;
          }

          // pinta los casilleros que ocupa la pieza en su movimiento
          copyMatrix[copyPieza.x][copyPieza.y] = 1;
          if (!cleanBucketsRef.current && bucketsIndexs) {
            setBucketsIndexs(undefined);
            return removeBuckets(copyMatrix, bucketsIndexs).slice();
          }
          return copyMatrix.slice();
        });
      }

      if (copyPieza && tablas[copyPieza.x][copyPieza.y] == 2) {
        setScore(score + 20);
        setTableroMatrix((prev) => {
          if (!pieza) {
            return prev;
          }
          const copyMatrix = prev.slice();
          // limpia los casilleros donde estuvo el bloque, ya que avanza hacia abajo
          if (copyPieza.x !== 0) {
            copyMatrix[copyPieza.x - 1][copyPieza.y] = 0;
          }
          // saca el balde
          copyMatrix[copyPieza.x][copyPieza.y] = 0;
          return copyMatrix.slice();
        });
        dispatch(
          nextTetra({
            playing: jueguito,
            currentTetraedrum: { x: 1, y: 1 },
            nextTetraedrum: { x: 0, y: Math.floor(Math.random() * 10) },
          })
        );
        setCopyPieza(null);
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
      {!jueguito ? (
        <h1
          id="event-start"
          className={styles["starter-text"]}
          onClick={(e) => {
            dispatch(startEndGame(jueguito));
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
              dispatch(startEndGame(jueguito));
            }}
          >
            Press Enter or click here to play/pause
          </h1>
          <h1>Your score: {score.toFixed(0)}</h1>
          {maxScore ? <h1>Max score: {maxScore.toFixed(0)}</h1> : null}
          {specialClock ? `Crazy Buckets timer! ${specialClock}` : null}
        </div>
      )}
      {tableroMatrix &&
        tableroMatrix.map((el, index) => {
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
