import React from 'react';
import DateConstants from './DateConstants';

const { DAY_NAME_TO_INDEX } = DateConstants;

export default class DateTHead extends React.Component {
  render() {
    const props = this.props;
    const value = props.value;
    const localeData = value.localeData();    
    const prefixCls = props.prefixCls;
    const veryShortWeekdays = [];
    const weekDays = [];
    
    const allWeekdaysMin = localeData.weekdaysMin();
    const allWeekdaysShort = localeData.weekdaysShort();
    
    let firstDayName = typeof props.firstDayOfWeek === 'string' ? props.firstDayOfWeek[0].toUpperCase() + props.firstDayOfWeek.slice(1) : 'Sunday';
    const firstDay = DAY_NAME_TO_INDEX[firstDayName] ? DAY_NAME_TO_INDEX[firstDayName] : 0;
    
    let showWeekNumberEl;
    for (let dateColIndex = 0; dateColIndex < 7; dateColIndex++) {
      const index = (firstDay + dateColIndex) % 7;
      veryShortWeekdays[dateColIndex] = allWeekdaysMin[index];
      weekDays[dateColIndex] = allWeekdaysShort[index];
    }

    if (props.showWeekNumber) {
      showWeekNumberEl = (
        <th
          role="columnheader"
          className={`${prefixCls}-column-header ${prefixCls}-week-number-header`}
        >
          <span className={`${prefixCls}-column-header-inner`}>x</span>
        </th>);
    }
    const weekDaysEls = weekDays.map((day, xindex) => {
      return (
        <th
          key={xindex}
          role="columnheader"
          title={day}
          className={`${prefixCls}-column-header`}
        >
          <span className={`${prefixCls}-column-header-inner`}>
          {veryShortWeekdays[xindex]}
          </span>
        </th>);
    });
    return (<thead>
    <tr role="row">
      {showWeekNumberEl}
      {weekDaysEls}
    </tr>
    </thead>);
  }
}
