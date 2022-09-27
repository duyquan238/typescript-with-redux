import { useSelector } from 'react-redux';
import { TypedUseSelectorHook } from 'react-redux';
import { useDispatch } from 'react-redux';
import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import recorderReducer from './recorder';
import UserEventsReducer from './user-events';

const rootReducer = combineReducers({
  userEvents: UserEventsReducer,
  recorder: recorderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type TypedDispatch = ThunkDispatch<RootState, any, AnyAction>;
export type TypedThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
export const useTypedDispatch = () => useDispatch<TypedDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
