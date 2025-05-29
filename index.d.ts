// Type definitions for rc-calendar 9.6
// Project: http://github.com/react-component/calendar
// Definitions by: 9renpoto <https://github.com/9renpoto>
// Definitions: https://github.com/react-component/calendar

import * as React from 'react';

export type Mode = 'time' | 'date' | 'month' | 'year' | 'decade';

export interface Props {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  defaultValue?: Object;
  value?: Object;
  selectedValue?: object;
  mode?: Mode;
  locale?: object;
  format?: string | string[];
  showDateInput?: boolean;
  showWeekNumber?: boolean;
  showToday?: boolean;
  showOk?: boolean;
  onSelect?: ( date: object ) => void;
  onOk?: () => void;
  onKeyDown?: () => void;
  onClickRightPanelTime?: () => void;
  timePicker?: React.ReactNode;
  dateInputPlaceholder?: string;
  onClear?: () => void;
  onChange?: ( date: object | null ) => void;
  onPanelChange?: ( date: Object | null, mode: Mode ) => void;
  disabledDate?: ( current: object | undefined ) => boolean;
  disabledTime?: ( current: object | undefined ) => object;
  dateRender?: ( current: object, value: object ) => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  renderSidebar?: () => React.ReactNode;
  inputMode?: string;
}

export default class ReactCalendar extends React.Component<Props> { }
