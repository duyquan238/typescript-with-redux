import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  loadUserEvents,
  selectUserEventsArray,
  UserEvent,
} from '../../redux/user-events';
import './Calendar.css';

const mapState = (state: RootState) => ({
  events: selectUserEventsArray(state),
});

const mapDispatch = {
  loadUserEvents,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface Props extends PropsFromRedux {}

const createDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return (
    `0${year}`.slice(-2) +
    '-' +
    `0${month}`.slice(-2) +
    '-' +
    `0${day}`.slice(-2)
  );
};

const groupEventsByDay = (events: UserEvent[]) => {
  const groups: Record<string, UserEvent[]> = {};
  const addToGroup = (dateKey: string, event: UserEvent) => {
    if (groups[dateKey] === undefined) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
  };

  events.forEach((event) => {
    const dateStartKey = createDateKey(new Date(event.dateStart));
    console.log('dateStartKey', dateStartKey);
    const dateEndKey = createDateKey(new Date(event.dateEnd));
    console.log('dateEndKey', dateEndKey);
    if (dateEndKey !== dateStartKey) {
      addToGroup(dateEndKey, event);
    }
  });
  console.log('groups', groups);
  return groups;
};

const Calendar: React.FC<Props> = ({ events, loadUserEvents }) => {
  useEffect(() => {
    loadUserEvents();
  }, []);

  let groupedEvents: ReturnType<typeof groupEventsByDay> | undefined;
  let sortedGroupKeys: string[] | undefined;

  if (events.length) {
    console.log(events);
    groupedEvents = groupEventsByDay(events);
    console.log(groupedEvents);
    sortedGroupKeys = Object.keys(groupedEvents).sort(
      (date1, date2) => +new Date(date1) - +new Date(date2)
    );
    console.log('sortedGroupKeys', sortedGroupKeys);
  }

  return groupedEvents && sortedGroupKeys ? (
    <div className="calendar">
      {sortedGroupKeys.map((dayKey) => {
        const events = groupedEvents![dayKey];
        console.log('dayKey', dayKey);
        const groupDate = new Date(dayKey);
        console.log('groupDate', groupDate);
        const day = groupDate.getDate();
        const month = groupDate.toLocaleString(undefined, {
          month: 'long',
          timeZone: 'UTC',
        });
        return (
          <div className="calendar-day">
            <div className="calendar-day-label">
              <span>
                {day} {month}
              </span>
            </div>
            <div className="calendar-events">
              {events.map((event) => (
                <div className="calendar-event" key={event.id}>
                  <div className="calender-event-info">
                    <div className="calender-event-time">10:00 - 12:00</div>
                    <div className="calender-event-title">{event.title}</div>
                  </div>
                  <button className="calendar-event-delete-button">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default connector(Calendar);
