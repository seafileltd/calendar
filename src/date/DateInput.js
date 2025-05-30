import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import KeyCode from 'rc-util/lib/KeyCode';
import { polyfill } from 'react-lifecycles-compat';
import dayjs from 'dayjs';
import {
  formatDate, DATE_FORMATS, currentDate, currentMonth, currentYear,
  stringCurrentDate, stringCurrentMonth, formatDateLocal, hasSpecialChar,
  isValidMonth, isValidDay, fullValidYear, getDateFormatByStr, isCurrentYear,
  validateTime, delimate,
} from '../util';

let cachedSelectionStart;
let cachedSelectionEnd;
let dateInputInstance;

class DateInput extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    timePicker: PropTypes.object,
    value: PropTypes.object,
    disabledTime: PropTypes.any,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    locale: PropTypes.object,
    disabledDate: PropTypes.func,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    placeholder: PropTypes.string,
    onSelect: PropTypes.func,
    selectedValue: PropTypes.object,
    clearIcon: PropTypes.node,
    inputMode: PropTypes.string,
    showHourAndMinute: PropTypes.bool,
    onChangeCananderIput: PropTypes.func,
  }

  constructor(props) {
    super(props);
    const selectedValue = props.selectedValue;
    const formatPrefix = this.props.format[0];
    this.state = {
      timeStr: '',
      dateStr: '',
      str: formatDate(selectedValue, this.props.format),
      hasFocus: false,
      localeFormat: formatPrefix,
      delimiter: delimate(formatPrefix),
      cananderIput: '',
    };
  }

  componentDidUpdate() {
    if (dateInputInstance && this.state.hasFocus &&
      !(cachedSelectionStart === 0 && cachedSelectionEnd === 0)) {
      dateInputInstance.setSelectionRange(cachedSelectionStart, cachedSelectionEnd);
    }
  }

  onClear = () => {
    const { showHourAndMinute, onClear } = this.props;
    if (showHourAndMinute) {
      this.setState({
        dateStr: '',
        timeStr: '',
      });
    } else {
      this.setState({
        str: '',
      });
    }
    onClear(null);
  };

  onInputChange = (str) => {
    let cananderStr = this.normalizeDateInput(str, this.props.showHourAndMinute);
    const { disabledDate, onChange, selectedValue } = this.props;
    const parts = formatDateLocal(cananderStr, this.state.localeFormat);
    const hourMinuteStr = validateTime(this.state.timeStr);
    this.setState({ timeStr: hourMinuteStr });
    cananderStr = `${cananderStr} ${hourMinuteStr}`;
    // 没有内容，合法并直接退出
    if (!str) {
      onChange(null);
      this.setState({ str });
      return;
    }
    // 不合法直接退出
    const format = getDateFormatByStr(cananderStr, this.state.localeFormat);
    const parsed = dayjs(cananderStr, format);
    let value = this.props.value.clone();
    value = value
      .year(parsed.year())
      .month(parsed.month())
      .date(parsed.date())
      .hour(parsed.hour())
      .minute(parsed.minute())
      .second(parsed.second());

    if (this.state.localeFormat === DATE_FORMATS.ISO ||
      this.state.localeFormat === DATE_FORMATS.ISOAndTime
    ) {
      if (parts[0] && parts[0].length === 4 && (parts[0].slice(0, 3) === '000' ||
        parts[0].slice(0, 2) === '00')) {
        value.year(parts[0]);
      }
    }
    if (this.state.localeFormat === DATE_FORMATS.European ||
      this.state.localeFormat === DATE_FORMATS.EuropeanAndTime ||
        this.state.localeFormat === DATE_FORMATS.US ||
         this.state.localeFormat === DATE_FORMATS.USAndTime ||
        this.state.localeFormat === DATE_FORMATS.Germany_Russia_etc ||
        this.state.localeFormat === DATE_FORMATS.Germany_Russia_etcAndTime
    ) {
      if (parts[2] && parts[2].length === 4 && (parts[2].slice(0, 3) === '000' ||
        parts[2].slice(0, 2) === '00')) {
        value.year(parts[2]);
      }
    }
    if (!value || (disabledDate && disabledDate(value))) {
      this.setState({ str });
      return;
    }

    if (selectedValue !== value || (
      selectedValue && value && !selectedValue.isSame(value)
    )) {
      this.setState({ str });
      onChange(value);
    }
  }

  onInputChangeAll = (event) => {
    const str = event.target.value;
    this.onInputChange(str);
  }

  onInputChangeDate = (event) => {
    const dateStr = event.target.value;
    this.setState({ dateStr });
    this.onInputChange(dateStr);
  }

  onInputChangeHourMinute = (e) => {
    const timeStr = e.target.value;
    this.setState({ timeStr });
  }

  onFocus = () => {
    this.setState({ hasFocus: true });
  }

  onBlur = () => {
    this.setState((prevState, prevProps) => ({
      hasFocus: false,
      str: formatDate(prevProps.value, prevProps.format),
    }));
  }

  onKeyDown = (event) => {
    const { keyCode } = event;
    const { onSelect, value, disabledDate } = this.props;
    if (keyCode === KeyCode.ENTER && onSelect) {
      const validateDate = !disabledDate || !disabledDate(value);
      if (validateDate) {
        onSelect(value.clone());
      }
      event.preventDefault();
    }
  };

  static getDerivedStateFromProps(nextProps, state) {
    let newState = {};

    if (dateInputInstance) {
      cachedSelectionStart = dateInputInstance.selectionStart;
      cachedSelectionEnd = dateInputInstance.selectionEnd;
    }
    // when popup show, click body will call this, bug!
    const selectedValue = nextProps.selectedValue;
    if (!state.hasFocus) {
      const timeStr = formatDate(selectedValue, nextProps.format).split(' ')[0];
      const parts = timeStr.split(state.delimiter);
      const timeParts = formatDate(selectedValue, nextProps.format).split(' ')[1];
      if (parts.length === 3) {
        if (state.localeFormat === DATE_FORMATS.ISO) {
          newState = { str: `${parts[0].padStart(4, 0)}-${parts[1]}-${parts[2]}` };
        } else if (state.localeFormat === DATE_FORMATS.ISOAndTime) {
          newState = {
            str: `${parts[0].padStart(4, 0)}-${parts[1]}-${parts[2]} ${ nextProps.showHourAndMinute ? timeParts : ''}`, // eslint-disable-line max-len
            dateStr: `${parts[0].padStart(4, 0)}-${parts[1]}-${parts[2]}`,
          };
        } else if (state.localeFormat === DATE_FORMATS.US) {
          newState = { str: `${Number(parts[0])}/${Number(parts[1])}/${parts[2].padStart(4, 0)}` };
        } else if (state.localeFormat === DATE_FORMATS.USAndTime) {
          newState = {
            str: `${Number(parts[0])}/${Number(parts[1])}/${parts[2].padStart(4, 0)} ${ nextProps.showHourAndMinute ? timeParts : ''}`, // eslint-disable-line max-len
            dateStr: `${Number(parts[0])}/${Number(parts[1])}/${parts[2].padStart(4, 0)}`,
          };
        } else if (state.localeFormat === DATE_FORMATS.European ||
        state.localeFormat === DATE_FORMATS.Germany_Russia_etc) {
          newState = { str: `${Number(parts[0])}${state.delimiter}${Number(parts[1])}${state.delimiter}${parts[2].padStart(4, 0)}` }; // eslint-disable-line max-len
        } else if (state.localeFormat === DATE_FORMATS.EuropeanAndTime ||
        state.localeFormat === DATE_FORMATS.Germany_Russia_etcAndTime) {
          newState = {
            str: `${Number(parts[0])}${state.delimiter}${Number(parts[1])}${state.delimiter}${parts[2].padStart(4, 0)} ${ nextProps.showHourAndMinute ? timeParts : ''}`, // eslint-disable-line max-len
            dateStr: `${Number(parts[0])}${state.delimiter}${Number(parts[1])}${state.delimiter}${parts[2].padStart(4, 0)}`, // eslint-disable-line max-len
          };
        }
      }
    }
    return newState;
  }

  static getInstance() {
    return dateInputInstance;
  }

  getRootDOMNode = () => {
    return ReactDOM.findDOMNode(this);
  }

  normalizeDateInput(str) {
    let day;
    let month;
    let year;
    const parts = formatDateLocal(str, this.state.localeFormat, DATE_FORMATS);
    const delimiter = this.state.delimiter;
    const hasSpecial = hasSpecialChar(str);
    if (this.state.localeFormat === DATE_FORMATS.ISO ||
      this.state.localeFormat === DATE_FORMATS.ISOAndTime
    ) {
      const numStr = str.replace(/[^0-9]/g, '');
      if (numStr.length === 7) {
        year = numStr.slice(0, 4);
        month = numStr.slice(4, 6).padStart(2, '0');
        day = numStr.slice(6, 7).padStart(2, '0');
        if (!isValidDay(day)) {
          return `${year}-${stringCurrentMonth}-${stringCurrentDate}`;
        }
        return `${year}-${month}-${day}`;
      }
      if (hasSpecial) {
        year = fullValidYear(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
        if (month >= 1 && month <= 12) {
          if (isValidDay(day)) {
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
          return `${year}-${String(month).padStart(2, '0')}-01`;
        }
        if ((month >= 13 || month < 1) && isNaN(day)) {
          return `${year}-${stringCurrentMonth}-${stringCurrentDate}`;
        }
        if (!month && !day) {
          return `${year}-01-01`;
        }
      }
      if (str.length >= 1 && str.length <= 8) {
        year = fullValidYear(str.slice(0, 4));
        month = str.slice(4, 6);
        day = Number(str.slice(6, 8));
        if (str.length === 5 && Number(month) < 1) {
          return `${year}-${stringCurrentMonth}-${stringCurrentDate} `;
        }
        if ((str.length === 6 && Number(month) < 1)) {
          return `${year}-${stringCurrentMonth}-${stringCurrentDate}`;
        }
        if ((str.length === 7)) {
          if (!isValidDay(day)) {
            return `${year}-${String(isValidMonth(month)).padStart(2, '0')}-${stringCurrentDate}`;
          }
          return `${year}-${String(isValidMonth(month)).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // eslint-disable-line max-len
        }
        if (str.length === 8) {
          if (!isValidDay(day)) {
            return `${isCurrentYear(year, month, day)}-${String(isValidMonth(month)).padStart(2, '0')}-${stringCurrentDate}`; // eslint-disable-line max-len
          }
          return `${isCurrentYear(year, month, day)}-${String(isValidMonth(month)).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // eslint-disable-line max-len
        }
        if (Number(month) >= 1 && Number(month) <= 12 && isValidDay(day)) {
          return `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return `${year}-${month ? month.padStart(2, '0') : '01'}-${day ? String(day).padStart(2, '0') : '01'}`; // eslint-disable-line max-len
      }
      return `${currentYear}/${stringCurrentMonth}/${stringCurrentDate}`;
    }
    if (this.state.localeFormat === DATE_FORMATS.US ||
      this.state.localeFormat === DATE_FORMATS.USAndTime) {
      if (hasSpecial) {
        month = Number(parts[0]);
        day = Number(parts[1]);
        year = fullValidYear(parts[2]);
        if (month >= 1 && month <= 12 && isValidDay(day)) {
          return `${month}/${day}/${year}`;
        }
        return `${currentMonth}/${currentDate}/${currentYear}`;
      }
      if (str.length >= 1 && str.length <= 8) {
        month = Number(str.slice(0, 2));
        day = Number(str.slice(2, 4));
        year = fullValidYear(str.slice(4, str.length));
        if (month >= 1 && month <= 12) {
          if (isValidDay(day)) {
            return `${month}/${day}/${year}`;
          }
          if (!day) {
            return `${month}/1/${year}`;
          }
          return `${currentMonth}/${currentDate}/${currentYear}`;
        }
      }
      return `${currentMonth}/${currentDate}/${currentYear}`;
    }
    if (this.state.localeFormat === DATE_FORMATS.European ||
      this.state.localeFormat === DATE_FORMATS.EuropeanAndTime ||
      this.state.localeFormat === DATE_FORMATS.Germany_Russia_etcAndTime ||
      this.state.localeFormat === DATE_FORMATS.Germany_Russia_etc) {
      if (hasSpecial) {
        day = parts[0];
        month = parts[1];
        year = fullValidYear(parts[2]);
        if (isValidDay(day) && Number(month) >= 1 && Number(month) <= 12) {
          return `${Number(day)}${delimiter}${Number(month)}${delimiter}${year}`;
        }
        return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear}`;
      }
      if (str.length >= 1 && str.length <= 8) {
        day = Number(str.slice(0, 2));
        const monthStr = str.slice(2, 4);
        month = isValidMonth(monthStr);
        const yearStr = str.slice(4, str.length);
        year = fullValidYear(yearStr);
        if (Number(monthStr) >= 1 && Number(monthStr) <= 12 && isValidDay(day)) {
          return `${Number(day)}${delimiter}${Number(month)}${delimiter}${year}`;
        }
      }
      return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear}`;
    }
  }

  focus = () => {
    if (dateInputInstance) {
      dateInputInstance.focus();
    }
  }

  TimeBlure = () => {
    const hourMinuteStr = validateTime(this.state.timeStr);
    this.setState({ timeStr: hourMinuteStr }, () => {
      this.onInputChange(this.state.str);
    });
  }

  focusTimeInput = (timeStr) => {
    this.setState({ timeStr });
  }

  saveDateInput = (dateInput) => {
    dateInputInstance = dateInput;
  }

  render() {
    const props = this.props;
    const { str, dateStr, timeStr } = this.state;
    const { locale, prefixCls, placeholder, clearIcon, inputMode, showHourAndMinute } = props;
    return (
      <div className={`${prefixCls}-input-wrap`}>
        {
          showHourAndMinute ?
            (
              <div className={`${prefixCls}-date-input-wrap`} style={{ display: 'flex' }}>
                <div>
                  <input
                    ref={this.saveDateInput}
                    className={`${prefixCls}-input`}
                    value={dateStr}
                    disabled={props.disabled}
                    placeholder={placeholder.slice(0, 10)}
                    onChange={this.onInputChangeDate}
                    onKeyDown={this.onKeyDown}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    inputMode={inputMode}
                  />
                </div>
                <div>
                  <input
                    ref={this.saveDateInput}
                    className={`${prefixCls}-input`}
                    value={timeStr}
                    disabled={props.disabled}
                    placeholder={'HH:mm'}
                    onChange={this.onInputChangeHourMinute}
                    onKeyDown={this.onKeyDown}
                    onFocus={this.onFocus}
                    onBlur={this.TimeBlure}
                    inputMode={inputMode}
                  />
                </div>
              </div>
            ) :
            (
              <div className={`${prefixCls}-date-input-wrap`} style={{ display: 'flex' }}>
                <input
                  ref={this.saveDateInput}
                  className={`${prefixCls}-input`}
                  value={str}
                  disabled={props.disabled}
                  placeholder={placeholder}
                  onChange={this.onInputChangeAll}
                  onKeyDown={this.onKeyDown}
                  onFocus={this.onFocus}
                  onBlur={this.onBlur}
                  inputMode={inputMode}
                />
              </div>
            )

        }
        {props.showClear ? (
          <a
            role="button"
            title={locale.clear}
            onClick={this.onClear}
          >
            {clearIcon || <span className={`${prefixCls}-clear-btn`} />}
          </a>
        ) : null}
      </div>
    );
  }
}

polyfill(DateInput);

export default DateInput;
