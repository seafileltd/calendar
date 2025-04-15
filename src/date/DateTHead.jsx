import React from 'react';
import DateConstants from './DateConstants';

const { DAY_NAME_TO_INDEX, DATE_ROW_COLUMN_COUNT } = DateConstants;

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

    const firstDayName = typeof props.firstDayOfWeek === 'string'
      ? props.firstDayOfWeek[0].toUpperCase() + props.firstDayOfWeek.slice(1)
      : 'Sunday';
    const firstDay = DAY_NAME_TO_INDEX[firstDayName] ? DAY_NAME_TO_INDEX[firstDayName] : 0;

    let showWeekNumberEl;
    const dateColumnCount = DATE_ROW_COLUMN_COUNT.DATE_COL_COUNT;
    for (let dateColIndex = 0; dateColIndex < dateColumnCount; dateColIndex++) {
      const index = (firstDay + dateColIndex) % dateColumnCount;
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
