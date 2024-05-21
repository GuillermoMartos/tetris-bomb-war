import { assignNewRandomPieceShape, matrix } from "@/app/shapes/shapes";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type tetraedrumPosition = {
  x: number;
  y: number;
};

export type tetraedrum = {
  position: tetraedrumPosition;
  shape: matrix;
};

type myState = {
  currentTetraedrum: null | tetraedrum;
  nextTetraedrum: null | tetraedrum;
  playing: boolean;
};

const initialState: myState = {
  currentTetraedrum: null,
  nextTetraedrum: null,
  playing: false,
};

export const piezasSlice = createSlice({
  name: "pieces reducer",
  initialState,
  reducers: {
    playPause: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        playing: !action.payload,
      };
    },
    startEndGame: (state, action: PayloadAction<boolean>) => {
      if (!action.payload) {
        return {
          ...state,
          playing: !action.payload,
          nextTetraedrum: {
            position: { x: 0, y: 5 },
            shape: assignNewRandomPieceShape(),
          },
          currentTetraedrum: {
            position: { x: 0, y: 5 },
            shape: assignNewRandomPieceShape(),
          },
        };
      }
      return {
        playing: !action.payload,
        currentTetraedrum: null,
        nextTetraedrum: null,
      };
    },
    nextTetra: (state, action: PayloadAction<tetraedrum>) => {
      console.log(action.payload);
      return {
        ...state,
        playing: state.playing,
        nextTetraedrum: {
          position: { x: 0, y: 5 },
          shape: assignNewRandomPieceShape(),
        },
        currentTetraedrum: action.payload,
      };
    },
  },
});

export const { startEndGame, nextTetra, playPause } = piezasSlice.actions;
export default piezasSlice.reducer;
