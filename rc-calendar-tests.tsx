import * as React from 'react';
import moment, {Moment} from 'moment';
import Calendar from './';

const action = ( date: Moment ) => {
  date.subtract( 1, 'day' );
};

export default () => (
  <Calendar
    showWeekNumber={false}
    locale={{}}
    defaultValue={moment()}
    showToday
    showOk={false}
    onChange={action}
    disabledDate={( now: Moment ) => false}
    onSelect={action}
    inputMode="numeric"
  />
);
