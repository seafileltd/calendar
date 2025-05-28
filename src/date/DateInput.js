import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import KeyCode from 'rc-util/lib/KeyCode';
import { polyfill } from 'react-lifecycles-compat';
import moment from 'moment';
import { formatDate, DATE_FORMATS } from '../util';

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
    onChangeCananderIput: PropTypes.func,
  }

  constructor(props) {
    super(props);
    const selectedValue = props.selectedValue;
    const formatPrefix = this.props.format[0];
    let delimiter;
    if (formatPrefix === DATE_FORMATS.Germany_Russia_etc ||
      formatPrefix === DATE_FORMATS.Germany_Russia_etcAndTime) {
      delimiter = '.';
    } else if (formatPrefix === DATE_FORMATS.ISO || formatPrefix === DATE_FORMATS.ISOAndTime) {
      delimiter = '-';
    } else {
      delimiter = '/';
    }

    this.state = {
      str: formatDate(selectedValue, this.props.format),
      hasFocus: false,
      localeFormat: formatPrefix,
      delimiter,
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
    this.setState({
      str: '',
    });
    this.props.onClear(null);
  };

  onInputChange = (event) => {
    const str = event.target.value;
    const { disabledDate, format, onChange, selectedValue } = this.props;

    this.setState({ cananderIput: str });
    // 没有内容，合法并直接退出
    if (!str) {
      onChange(null);
      this.setState({ str });
      return;
    }

    // 不合法直接退出
    const parsed = moment(str, format);

    let value = this.props.value.clone();
    value = value
      .year(parsed.year())
      .month(parsed.month())
      .date(parsed.date())
      .hour(parsed.hour() || moment().hour())
      .minute(parsed.minute() || moment().minute())
      .second(parsed.second() || moment().second());
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
      if (state.localeFormat === DATE_FORMATS.ISO) {
        if (parts.length === 3) {
          newState = { str: `${parts[0].padStart(4, 0)}-${parts[1]}-${parts[2]}` };
        }
      } else if (state.localeFormat === DATE_FORMATS.ISOAndTime) {
        if (parts.length === 3) {
          newState = { str: `${parts[0].padStart(4, 0)}-${parts[1]}-${parts[2]} ${timeParts && timeParts}` };// eslint-disable-line max-len
        }
      } else if (state.localeFormat === DATE_FORMATS.US) {
        if (parts.length === 3) {
          newState = { str: `${Number(parts[0])}/${Number(parts[1])}/${parts[2].padStart(4, 0)}` };
        }
      } else if (state.localeFormat === DATE_FORMATS.USAndTime) {
        if (parts.length === 3) {
          newState = { str: `${Number(parts[0])}/${Number(parts[1])}/${parts[2].padStart(4, 0)} ${timeParts && timeParts}` };// eslint-disable-line max-len
        }
      } else if (state.localeFormat === DATE_FORMATS.European ||
        state.localeFormat === DATE_FORMATS.Germany_Russia_etc) {
        if (parts.length === 3) {
          newState = { str: `${Number(parts[0])}${state.delimiter}${Number(parts[1])}${state.delimiter}${parts[2].padStart(4, 0)}` };// eslint-disable-line max-len
        }
      } else if (state.localeFormat === DATE_FORMATS.EuropeanAndTime ||
          state.localeFormat === DATE_FORMATS.Germany_Russia_etcAndTime) {
        if (parts.length === 3) {
          newState = { str: `${Number(parts[0])}${state.delimiter}${Number(parts[1])}${state.delimiter}${parts[2].padStart(4, 0)} ${timeParts && timeParts}` };// eslint-disable-line max-len
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
            onChange={this.onInputChange}
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
