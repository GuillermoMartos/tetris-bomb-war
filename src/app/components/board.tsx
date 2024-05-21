import styles from "./board.module.css";

export default function Board({ boardMatrix }: { boardMatrix: number[][] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: "0.7px",
        rowGap: "0px",
        flexWrap: "wrap",
        maxWidth: "22em",
        margin: "0px",
        padding: "0px",
      }}
    >
      {boardMatrix.map((row) => {
        return row.map((pos, ind) => {
          if (pos === 0) {
            return (
              <div style={{ fontSize: "2em" }} key={ind}>
                🟨
              </div>
            );
          }
          if (pos === 1) {
            return (
              <div style={{ fontSize: "2em" }} key={ind}>
                ⬛️
              </div>
            );
          } else {
            return (
              <div style={{ fontSize: "2em" }} key={ind}>
                💣
              </div>
            );
          }
        });
      })}
    </div>
  );
}
