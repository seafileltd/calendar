import * as React from 'react';
import * as dayjs from 'dayjs';
import Calendar from './';

const action = (date: dayjs.Dayjs) => {
  date.subtract(1);
};

export default () => (
  <Calendar
    showWeekNumber={false}
    locale={{}}
    defaultValue={dayjs()}
    showToday
    showOk={false}
    onChange={action}
    disabledDate={(now: dayjs.Dayjs) => false}
    onSelect={action}
    inputMode="numeric"
  />
);
