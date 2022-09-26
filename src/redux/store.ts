import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import recorderReducer from './recorder';
import UserEventsReducer from './user-events';

const rootReducer = combineReducers({
  userEvents: UserEventsReducer,
  recorder: recorderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
