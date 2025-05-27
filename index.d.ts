// Type definitions for rc-calendar 9.6
// Project: http://github.com/react-component/calendar
// Definitions by: 9renpoto <https://github.com/9renpoto>
// Definitions: https://github.com/react-component/calendar

import * as React from 'react';
import {moment} from 'moment';

export type Mode = 'time' | 'date' | 'month' | 'year' | 'decade';

export interface Props {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  defaultValue?: moment;
  value?: moment;
  selectedValue?: moment;
  mode?: Mode;
  locale?: object;
  format?: string | string[];
  showDateInput?: boolean;
  showWeekNumber?: boolean;
  showToday?: boolean;
  showOk?: boolean;
  onSelect?: ( date: moment ) => void;
  onOk?: () => void;
  onKeyDown?: () => void;
  onClickRightPanelTime?: () => void;
  timePicker?: React.ReactNode;
  dateInputPlaceholder?: string;
  onClear?: () => void;
  onChange?: ( date: moment | null ) => void;
  onPanelChange?: ( date: moment | null, mode: Mode ) => void;
  disabledDate?: ( current: moment | undefined ) => boolean;
  disabledTime?: ( current: moment | undefined ) => object;
  dateRender?: ( current: moment, value: moment ) => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  renderSidebar?: () => React.ReactNode;
  inputMode?: string;
}

export default class ReactCalendar extends React.Component<Props> { }
