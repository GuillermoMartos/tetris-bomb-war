import { configureStore } from "@reduxjs/toolkit";
import piezasReducer from './actions/piecesSlice'


export const store = configureStore({
    reducer: piezasReducer
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = ReturnType<typeof store.dispatch>
