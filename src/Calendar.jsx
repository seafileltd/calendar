import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import KeyCode from 'rc-util/lib/KeyCode';
import { polyfill } from 'react-lifecycles-compat';
import dayjs from 'dayjs';
import DateTable from './date/DateTable';
import CalendarHeader from './calendar/CalendarHeader';
import CalendarFooter from './calendar/CalendarFooter';
import CalendarRightPanel from './calendar/CalendarRightPanel';
import {
  calendarMixinWrapper,
  calendarMixinPropTypes,
  calendarMixinDefaultProps,
  getNowByCurrentStateValue,
} from './mixin/CalendarMixin';
import { commonMixinWrapper, propType, defaultProp } from './mixin/CommonMixin';
import DateInput from './date/DateInput';
import TimeInput from './time/TimeInput';
import { getTimeConfig, getTodayTime, syncTime, CALENDAR_STATUS } from './util';
import { goStartMonth, goEndMonth, goTime } from './util/toTime';
import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);

function noop() {
}

const getMomentObjectIfValid = date => {
  if (dayjs.isDayjs(date) && date.isValid()) {
    return date;
  }
  return false;
};

class Calendar extends React.Component {
  static propTypes = {
    ...calendarMixinPropTypes,
    ...propType,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    defaultValue: PropTypes.object,
    value: PropTypes.object,
    selectedValue: PropTypes.object,
    defaultSelectedValue: PropTypes.object,
    mode: PropTypes.oneOf(['time', 'date', 'month', 'year', 'decade']),
    locale: PropTypes.object,
    showDateInput: PropTypes.bool,
    showWeekNumber: PropTypes.bool,
    showToday: PropTypes.bool,
    showOk: PropTypes.bool,
    showHourAndMinute: PropTypes.bool,
    defaultMinutesTime: PropTypes.string,
    onSelect: PropTypes.func,
    onOk: PropTypes.func,
    onKeyDown: PropTypes.func,
    timePicker: PropTypes.element,
    dateInputPlaceholder: PropTypes.any,
    onClear: PropTypes.func,
    onChange: PropTypes.func,
    onPanelChange: PropTypes.func,
    disabledDate: PropTypes.func,
    disabledTime: PropTypes.any,
    dateRender: PropTypes.func,
    renderFooter: PropTypes.func,
    renderSidebar: PropTypes.func,
    clearIcon: PropTypes.node,
    focusablePanel: PropTypes.bool,
    inputMode: PropTypes.string,
    onBlur: PropTypes.func,
    onClickRightPanelTime: PropTypes.func,
    firstDayOfWeek: PropTypes.string,
  }

  static defaultProps = {
    ...calendarMixinDefaultProps,
    ...defaultProp,
    showToday: true,
    showDateInput: true,
    showHourAndMinute: false,
    timePicker: null,
    onOk: noop,
    onPanelChange: noop,
    onClickRightPanelTime: noop,
    focusablePanel: true,
    firstDayOfWeek: 'Sunday',
  }

  constructor(props) {
    super(props);
    this.state = {
      mode: this.props.mode || 'date',
      value:
          getMomentObjectIfValid(props.value) ||
          getMomentObjectIfValid(props.defaultValue) ||
          dayjs(),
      selectedValue: props.selectedValue || props.defaultSelectedValue,
      currentStatus: CALENDAR_STATUS.SPECIFIC_TIME,
    };
  }

  componentDidMount() {
    if (this.props.showDateInput) {
      this.saveFocusElement(DateInput.getInstance());
    }
  }

  onPanelChange = (value, mode) => {
    const { props, state } = this;
    if (!('mode' in props)) {
      this.setState({ mode });
    }
    props.onPanelChange(value || state.value, mode);
  }

  onKeyDown = (event) => {
    if (event.target.nodeName.toLowerCase() === 'input') {
      return undefined;
    }
    const keyCode = event.keyCode;
    // mac
    const ctrlKey = event.ctrlKey || event.metaKey;
    const { disabledDate } = this.props;
    const { value } = this.state;
    switch (keyCode) {
      case KeyCode.DOWN:
        this.goTime(1, 'weeks');
        event.preventDefault();
        return 1;
      case KeyCode.UP:
        this.goTime(-1, 'weeks');
        event.preventDefault();
        return 1;
      case KeyCode.LEFT:
        if (ctrlKey) {
          this.goTime(-1, 'years');
        } else {
          this.goTime(-1, 'days');
        }
        event.preventDefault();
        return 1;
      case KeyCode.RIGHT:
        if (ctrlKey) {
          this.goTime(1, 'years');
        } else {
          this.goTime(1, 'days');
        }
        event.preventDefault();
        return 1;
      case KeyCode.HOME:
        this.setValue(
          goStartMonth(this.state.value),
        );
        event.preventDefault();
        return 1;
      case KeyCode.END:
        this.setValue(
          goEndMonth(this.state.value),
        );
        event.preventDefault();
        return 1;
      case KeyCode.PAGE_DOWN:
        this.goTime(1, 'month');
        event.preventDefault();
        return 1;
      case KeyCode.PAGE_UP:
        this.goTime(-1, 'month');
        event.preventDefault();
        return 1;
      case KeyCode.ENTER:
        if (!disabledDate || !disabledDate(value)) {
          this.onSelect(value, {
            source: 'keyboard',
          });
        }
        event.preventDefault();
        return 1;
      default:
        this.props.onKeyDown(event);
        return 1;
    }
  }

  onClear = () => {
    this.onSelect(null);
    this.props.onClear();
    this.setState({ currentStatus: CALENDAR_STATUS.CURRENT_TIME });
  }

  onOk = () => {
    const { selectedValue } = this.state;
    if (this.isAllowedDate(selectedValue)) {
      this.props.onOk(selectedValue);
    }
  }

  onDateInputChange = (value) => {
    this.onSelect(value, {
      source: 'dateInput',
    });
  }

  onDateInputSelect = (value) => {
    this.onSelect(value, {
      source: 'dateInputSelect',
    });
  }

  onDateTableSelect = (value) => {
    const { timePicker } = this.props;
    const { selectedValue } = this.state;
    this.setState({ currentStatus: CALENDAR_STATUS.SPECIFIC_TIME });
    if (!selectedValue && timePicker) {
      const timePickerDefaultValue = timePicker.props.defaultValue;
      if (timePickerDefaultValue) {
        syncTime(timePickerDefaultValue, value);
      }
    }
    this.onSelect(value);
  }

  onToday = () => {
    const { value } = this.state;
    const now = getTodayTime(value);
    this.onSelect(now, {
      source: 'todayButton',
    });
  }

  onBlur = (event) => {
    setTimeout(() => {
      const dateInput = DateInput.getInstance();
      const timeInput = TimeInput.getInstance && TimeInput.getInstance();
      const rootInstance = this.rootInstance;

      if (!rootInstance || rootInstance.contains(document.activeElement) ||
      (dateInput && dateInput.contains(document.activeElement)) ||
      (timeInput && timeInput.contains && timeInput.contains(document.activeElement))) {
        // focused element is still part of Calendar
        return;
      }

      if (this.props.onBlur) {
        this.props.onBlur(event);
      }
    }, 0);
  }

  static getDerivedStateFromProps(nextProps, state) {
    const { value, selectedValue } = nextProps;
    let newState = {};

    if ('mode' in nextProps && state.mode !== nextProps.mode) {
      newState = { mode: nextProps.mode };
    }
    if ('value' in nextProps) {
      newState.value =
          getMomentObjectIfValid(value) ||
          getMomentObjectIfValid(nextProps.defaultValue) ||
          getNowByCurrentStateValue(state.value);
    }
    if ('selectedValue' in nextProps) {
      newState.selectedValue = selectedValue;
    }

    return newState;
  }

  onTimeInputChange = (value) => {
    this.onSelect(value, { source: 'timeInputChange' });
  }

  onTimeInputSelect = (value) => {
    this.onSelect(value, { source: 'timeInputSelect' });
  }

  getRootDOMNode = () => {
    return ReactDOM.findDOMNode(this);
  }

  openTimePicker = () => {
    this.onPanelChange(null, 'time');
  }

  closeTimePicker = () => {
    this.onPanelChange(null, 'date');
  }


  goTime = (direction, unit) => {
    this.setValue(
      goTime(this.state.value, direction, unit),
    );
  }

  render() {
    const { props, state } = this;
    const {
      locale, prefixCls, disabledDate,
      timePicker, onClickRightPanelTime,
      disabledTime, clearIcon, renderFooter, inputMode, showHourAndMinute,
      firstDayOfWeek, showWeekNumber,
    } = props;
    const { value, selectedValue, mode, currentStatus } = state;
    const showTimePicker = mode === 'time';
    const disabledTimeConfig = showTimePicker && disabledTime && timePicker ?
      getTimeConfig(selectedValue, disabledTime) : null;

    let timePickerEle = null;

    if (timePicker && showTimePicker) {
      const timePickerProps = {
        showHour: true,
        showSecond: true,
        showMinute: true,
        ...timePicker.props,
        ...disabledTimeConfig,
        onChange: this.onDateInputChange,
        value: selectedValue,
        disabledTime,
      };

      if (timePicker.props.defaultValue !== undefined) {
        timePickerProps.defaultOpenValue = timePicker.props.defaultValue;
      }

      timePickerEle = React.cloneElement(timePicker, timePickerProps);
    }

    const baseFormat = Array.isArray(this.getFormat()) ? this.getFormat()[0] : this.getFormat();
    const headerDatePlaceholder = baseFormat.replace(/\s*HH:mm(?::ss)?\s*/,'').trim() || 'YYYY-MM-DD';
    const inputFormat = Array.isArray(this.getFormat()) ? this.getFormat() : [this.getFormat()];
    // For the date input, strip any time tokens from formats so date and time are shown separately
    const stripTime = f => (typeof f === 'string' ? f.replace(/\s*HH:mm(?::ss)?\s*/, '').trim() : f);
    const dateOnlyFormats = Array.isArray(this.getFormat()) ? this.getFormat().map(stripTime) : [stripTime(this.getFormat())];

    const dateInputElement = props.showDateInput ? (
      <DateInput
        format={dateOnlyFormats}
        key="date-input"
        value={value}
        locale={locale}
        placeholder={headerDatePlaceholder}
        showClear={false}
        disabledTime={disabledTime}
        disabledDate={disabledDate}
        onClear={this.onClear}
        prefixCls={prefixCls}
        selectedValue={selectedValue}
        onChange={this.onDateInputChange}
        onSelect={this.onDateInputSelect}
        clearIcon={clearIcon}
        inputMode={inputMode}
      />
    ) : null;

    const timeInputTopElement = (
      <TimeInput
        key="time-input-top"
        prefixCls={prefixCls}
        value={value}
        selectedValue={selectedValue}
        onChange={this.onTimeInputChange}
        onSelect={this.onTimeInputSelect}
        inputMode="numeric"
      />
    );

    const children = [];
    if (props.renderSidebar) {
      children.push(props.renderSidebar());
    }

    const showTimeControls = showHourAndMinute && mode === 'date';

    children.push(<div className={`${prefixCls}-panel`} key="panel">
      <div className={`${prefixCls}-inputs`}>
        <div className={`${prefixCls}-date-input-col`}>
          <div className={`${prefixCls}-date-input`}>
            {dateInputElement}
          </div>
        </div>
        {showTimeControls && (
          <div className={`${prefixCls}-time-input-col`}>
          {timeInputTopElement}
        </div>
        )}
      </div>
      <div className={`${prefixCls}-date-panel-container`}>
      <div
        tabIndex={this.props.focusablePanel ? 0 : undefined}
        className={`${prefixCls}-date-panel`}
      >
        <CalendarHeader
          locale={locale}
          mode={mode}
          value={value}
          onValueChange={this.setValue}
          onPanelChange={this.onPanelChange}
          renderFooter={renderFooter}
          showTimePicker={showTimePicker}
          prefixCls={prefixCls}
        />
        {timePicker && showTimePicker ?
          (<div className={`${prefixCls}-time-picker`}>
            <div className={`${prefixCls}-time-picker-panel`}>
              {timePickerEle}
            </div>
          </div>)
          : null}
        <div className={`${prefixCls}-body`}>
          <DateTable
            locale={locale}
            value={value}
            selectedValue={selectedValue}
            prefixCls={prefixCls}
            dateRender={props.dateRender}
            onSelect={this.onDateTableSelect}
            disabledDate={disabledDate}
            showWeekNumber={showWeekNumber}
            firstDayOfWeek={firstDayOfWeek}
            currentStatus={currentStatus}
          />
        </div>

      </div>
      {showTimeControls &&
        <CalendarRightPanel
          prefixCls={prefixCls}
          value={value}
          selectedValue={selectedValue}
          locale={locale}
          onSelect={(v) => this.onDateTableSelect(v)}
          onClickRightPanelTime={onClickRightPanelTime}
          defaultMinutesTime={this.props.defaultMinutesTime}
          format={inputFormat}
        />
      }
    </div>
      <CalendarFooter
        showOk={props.showOk}
        mode={mode}
        renderFooter={props.renderFooter}
        locale={locale}
        prefixCls={prefixCls}
        showToday={props.showToday}
        disabledTime={disabledTime}
        showTimePicker={showTimePicker}
        showDateInput={props.showDateInput}
        timePicker={timePicker}
        selectedValue={selectedValue}
        value={value}
        disabledDate={disabledDate}
        okDisabled={
          props.showOk !== false && (!selectedValue || !this.isAllowedDate(selectedValue))
        }
        onOk={this.onOk}
        onSelect={this.onSelect}
        onToday={this.onToday}
        onOpenTimePicker={this.openTimePicker}
        onCloseTimePicker={this.closeTimePicker}
      />
    </div>);

    return this.renderRoot({
      children,
      className: props.showWeekNumber ? `${prefixCls}-week-number` : '',
    });
  }
}

polyfill(Calendar);

export default calendarMixinWrapper(commonMixinWrapper(Calendar));
