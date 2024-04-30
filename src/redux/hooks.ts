import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'

export const UseAppDispatch = useDispatch.withTypes()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector