// Type definitions for rc-calendar 9.6
// Project: http://github.com/react-component/calendar
// Definitions by: 9renpoto <https://github.com/9renpoto>
// Definitions: https://github.com/react-component/calendar

import * as React from 'react';
import { Dayjs } from 'dayjs';

export type Mode = 'time' | 'date' | 'month' | 'year' | 'decade';

export interface Props {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  defaultValue?: Dayjs;
  value?: Dayjs;
  selectedValue?: Dayjs;
  mode?: Mode;
  locale?: object;
  format?: string | string[];
  showDateInput?: boolean;
  showWeekNumber?: boolean;
  showToday?: boolean;
  showOk?: boolean;
  onSelect?: (date: Dayjs) => void;
  onOk?: () => void;
  onKeyDown?: () => void;
  onClickRightPanelTime?: () => void;
  timePicker?: React.ReactNode;
  dateInputPlaceholder?: string;
  onClear?: () => void;
  onChange?: (date: Dayjs | null) => void;
  onPanelChange?: (date: Dayjs | null, mode: Mode) => void;
  disabledDate?: (current: Dayjs | undefined) => boolean;
  disabledTime?: (current: Dayjs | undefined) => object;
  dateRender?: (current: Dayjs, value: Dayjs) => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  renderSidebar?: () => React.ReactNode;
  inputMode?: string;
}

export default class ReactCalendar extends React.Component<Props> {}
