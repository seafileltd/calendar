import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import KeyCode from 'rc-util/lib/KeyCode';
import { polyfill } from 'react-lifecycles-compat';
import dayjs from 'dayjs';
import { formatDate, DATE_FORMATS,
  getDateFormatByStr, formatDateLocal,
  delimate, normalizeDateInput } from '../util';

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
  }

  constructor(props) {
    super(props);
    const selectedValue = props.selectedValue;
    const formatPrefix = this.props.format[0];
    this.state = {
      str: formatDate(selectedValue, this.props.format),
      hasFocus: false,
      localeFormat: formatPrefix,
      delimiter: delimate(formatPrefix),
    };
  }

  componentDidUpdate() {
    if (dateInputInstance && this.state.hasFocus &&
      !(cachedSelectionStart === 0 && cachedSelectionEnd === 0)) {
      dateInputInstance.setSelectionRange(cachedSelectionStart, cachedSelectionEnd);
    }
  }

  onClear = () => {
    this.setState({
      str: '',
    });
    this.props.onClear(null);
  };

  onInputChange = (str) => {
    const cananderStr = normalizeDateInput(str, this.state.localeFormat, this.state.delimiter);
    const { disabledDate, onChange, selectedValue } = this.props;
    const parts = formatDateLocal(cananderStr, this.state.localeFormat);
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
    value.locale('zh-cn');
    if (this.state.localeFormat === DATE_FORMATS.ISO ||
      this.state.localeFormat === DATE_FORMATS.ISOAndTime
    ) {
      if (parts[0] && parts[0].length === 4 && (parts[0].slice(0, 3) === '000' ||
        parts[0].slice(0, 2) === '00')) {
        value = value
          .year(parts[0])
          .month(parsed.month())
          .date(parsed.date())
          .hour(parsed.hour())
          .minute(parsed.minute())
          .second(parsed.second());
      } else {
        value = value
          .year(parsed.year())
          .month(parsed.month())
          .date(parsed.date())
          .hour(parsed.hour())
          .minute(parsed.minute())
          .second(parsed.second());
      }
    } else if (this.state.localeFormat === DATE_FORMATS.European ||
      this.state.localeFormat === DATE_FORMATS.EuropeanAndTime ||
        this.state.localeFormat === DATE_FORMATS.US ||
         this.state.localeFormat === DATE_FORMATS.USAndTime ||
        this.state.localeFormat === DATE_FORMATS.Germany_Russia_etc ||
        this.state.localeFormat === DATE_FORMATS.Germany_Russia_etcAndTime
    ) {
      if (parts[2] && parts[2].length === 4 && (parts[2].slice(0, 3) === '000' ||
        parts[2].slice(0, 2) === '00')) {
        value = value
          .year(parts[2])
          .month(parsed.month())
          .date(parsed.date())
          .hour(parsed.hour())
          .minute(parsed.minute())
          .second(parsed.second());
      } else {
        value = value
          .year(parsed.year())
          .month(parsed.month())
          .date(parsed.date())
          .hour(parsed.hour())
          .minute(parsed.minute())
          .second(parsed.second());
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

  onFocus = () => {
    this.setState({ hasFocus: true });
  }

  onBlur = () => {
    this.setState((prevState, prevProps) => ({
      hasFocus: false,
      str: prevState.str ? formatDate(prevProps.value, prevProps.format) : '',
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
          };
        } else if (state.localeFormat === DATE_FORMATS.US) {
          newState = { str: `${Number(parts[0])}/${Number(parts[1])}/${parts[2].padStart(4, 0)}` };
        } else if (state.localeFormat === DATE_FORMATS.USAndTime) {
          newState = {
            str: `${Number(parts[0])}/${Number(parts[1])}/${parts[2].padStart(4, 0)} ${ nextProps.showHourAndMinute ? timeParts : ''}`, // eslint-disable-line max-len
          };
        } else if (state.localeFormat === DATE_FORMATS.European ||
        state.localeFormat === DATE_FORMATS.Germany_Russia_etc) {
          newState = { str: `${Number(parts[0])}${state.delimiter}${Number(parts[1])}${state.delimiter}${parts[2].padStart(4, 0)}` }; // eslint-disable-line max-len
        } else if (state.localeFormat === DATE_FORMATS.EuropeanAndTime ||
        state.localeFormat === DATE_FORMATS.Germany_Russia_etcAndTime) {
          newState = {
            str: `${Number(parts[0])}${state.delimiter}${Number(parts[1])}${state.delimiter}${parts[2].padStart(4, 0)} ${ nextProps.showHourAndMinute ? timeParts : ''}`, // eslint-disable-line max-len
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

  focus = () => {
    if (dateInputInstance) {
      dateInputInstance.focus();
    }
  }

  saveDateInput = (dateInput) => {
    dateInputInstance = dateInput;
  }

  render() {
    const props = this.props;
    const { str } = this.state;
    const { locale, prefixCls, placeholder, clearIcon, inputMode } = props;
    return (
      <div className={`${prefixCls}-input-wrap`}>
        <div className={`${prefixCls}-date-input-wrap`}>
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
