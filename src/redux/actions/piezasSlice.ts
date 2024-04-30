import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";

export type tetras={x:number, y:number}

type miEstadito = {
    currentTetraedrum: null | tetras
    nextTetraedrum: null | tetras
    playing: boolean
    
}

const initialState:miEstadito = {
    currentTetraedrum: null,
    nextTetraedrum: null,
    playing: false
}

export const piezasSlice = createSlice({
    name: 'piezas',
    initialState,
    reducers: {
        startEndGame: (state, action:PayloadAction<boolean>) => {
            return {
                ...state,
             playing:!state.playing   
            }
        },
        nextTetra: (state, action: PayloadAction<miEstadito>) => {
            if (action.payload.nextTetraedrum) {
                return {
                    ...state,
                    nextTetraedrum: action.payload.nextTetraedrum
                }
            }
            return {
                ...state
            }
        }
    }
})

export const { startEndGame, nextTetra } = piezasSlice.actions
export default piezasSlice.reducer