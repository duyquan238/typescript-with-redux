import { selectDateStart } from './recorder';
import { RootState } from './store';
import { Action, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
export interface UserEvent {
  id: number;
  title: string;
  dateStart: string;
  dateEnd: string;
}

interface UserEventsState {
  byIds: Record<UserEvent['id'], UserEvent>;
  allIds: UserEvent['id'][];
}

const LOAD_REQUEST = 'userEvents/load_request';
const LOAD_SUCCESS = 'userEvents/load_success';
const LOAD_FAILURE = 'userEvents/load_failure';

interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}
interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
  payload: {
    events: UserEvent[];
  };
}
interface LoadFailureAction extends Action<typeof LOAD_FAILURE> {
  error: string;
}

export const loadUserEvents =
  (): ThunkAction<
    void,
    RootState,
    undefined,
    LoadRequestAction | LoadSuccessAction | LoadFailureAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: LOAD_REQUEST,
    });
    try {
      const response = await fetch('http://localhost:3001/events');
      const events: UserEvent[] = await response.json();
      dispatch({
        type: LOAD_SUCCESS,
        payload: { events },
      });
    } catch (err) {
      dispatch({ type: LOAD_FAILURE, error: 'Load Failure' });
    }
  };

const CREATE_REQUEST = 'userEvents/create_request';
interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}

const CREATE_SUCCESS = 'userEvents/create_success';
interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
  payload: {
    event: UserEvent;
  };
}

const CREATE_FAILURE = 'userEvents/create_failure';
interface CreateFailureAction extends Action<typeof CREATE_FAILURE> {}

export const createUserEvent =
  (): ThunkAction<
    Promise<void>,
    RootState,
    undefined,
    CreateRequestAction | CreateSuccessAction | CreateFailureAction
  > =>
  async (dispatch, getState) => {
    dispatch({
      type: CREATE_REQUEST,
    });
    try {
      const dateStart = selectDateStart(getState());
      const event: Omit<UserEvent, 'id'> = {
        title: 'No name',
        dateStart,
        dateEnd: new Date().toISOString(),
      };
      const response = await fetch(`http://localhost:3001/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      console.log('response', response);
      const createdEvent: UserEvent = await response.json();
      console.log('createdEvent', createdEvent);
      dispatch({
        type: CREATE_SUCCESS,
        payload: {
          event: createdEvent,
        },
      });
    } catch (error) {
      dispatch({
        type: CREATE_FAILURE,
      });
    }
  };
const selectUserEventState = (rootState: RootState) => rootState.userEvents;
export const selectUserEventsArray = (rootState: RootState) => {
  const state = selectUserEventState(rootState);
  return state.allIds.map((id) => state.byIds[id]);
};

const initialState: UserEventsState = {
  byIds: {},
  allIds: [],
};

const UserEventsReducer = (
  state: UserEventsState = initialState,
  action: LoadSuccessAction | CreateSuccessAction
) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      const { events } = action.payload;
      return {
        ...state,
        allIds: events.map(({ id }) => id),
        byIds: events.reduce<UserEventsState['byIds']>((byIds, event) => {
          byIds[event.id] = event;
          return byIds;
        }, {}),
      };
    case CREATE_SUCCESS:
      const { event } = action.payload;
      return {
        ...state,
        allIds: [...state.allIds, event.id],
        byIds: { ...state.byIds, [event.id]: event },
      };
    default:
      return state;
  }
};

export default UserEventsReducer;
