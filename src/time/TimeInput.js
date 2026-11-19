import React from 'react';
import PropTypes from 'prop-types';
import { polyfill } from 'react-lifecycles-compat';
import dayjs from 'dayjs';
import { setTimeWithSeconds } from '../util';

const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

function formatTime(value, format) {
  if (!value) return '';
  const fmt = Array.isArray(format) ? format[0] : (format || 'HH:mm');
  return value.format(fmt);
}

// Convert a loose numeric/time string into HH:mm, with optional seconds.
// Rules (similar spirit to DateInput.initializeStr):
// - Strip non-digits
// - If len <= 2 => treat as hour
// - If len > 2 => last two digits are minutes; preceding are hours
// - Clamp hours to [0,23], minutes to [0,59]
// - Return formatted HH:mm or '' when input is empty
function initializeTime(str, showSecond) {
  if (typeof str !== 'string') return '';
  const digits = str.replace(/\D/g, '');
  if (!digits.length) return '';

  if (showSecond) {
    let parts;
    if (str.indexOf(':') !== -1) {
      parts = str.split(':');
      if (parts.length > 3 || parts.some(part => !/^\d*$/.test(part))) return '';
    } else if (digits.length <= 2) {
      parts = [digits];
    } else if (digits.length <= 4) {
      parts = [digits.slice(0, -2), digits.slice(-2)];
    } else {
      parts = [digits.slice(0, -4), digits.slice(-4, -2), digits.slice(-2)];
    }
    return parts.concat(['0', '0', '0']).slice(0, 3).map((part, index) => (
      String(Math.min(parseInt(part || '0', 10), index === 0 ? 23 : 59)).padStart(2, '0')
    )).join(':');
  }

  let hDigits = '';
  let mDigits = '';
  if (digits.length <= 2) {
    hDigits = digits;
  } else {
    hDigits = digits.slice(0, digits.length - 2);
    mDigits = digits.slice(-2);
  }

  let hour = parseInt(hDigits || '0', 10);
  let minute = parseInt(mDigits || '0', 10);
  if (Number.isNaN(hour)) hour = 0;
  if (Number.isNaN(minute)) minute = 0;

  if (hour > 23) hour = 23;
  if (minute > 59) minute = 59;

  const HH = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${HH}:${mm}`;
}

let timeInputInstance;

class TimeInput extends React.Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    selectedValue: PropTypes.object,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    inputMode: PropTypes.string,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    disabled: PropTypes.bool,
    className: PropTypes.string,
    showSecond: PropTypes.bool,
  };

  static defaultProps = {
    format: 'HH:mm',
    placeholder: 'HH:mm',
    showSecond: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      str: '',
      hasFocus: false,
    };
  }

  onInputChange = (event) => {
    const str = event.target.value;
    const next = this.getTimeValue(str);

    this.setState({ str });
    if (next && this.props.onChange) {
      this.props.onChange(next);
    }
  }

  onKeyDown = (event) => {
    if (event.key === 'Enter' && this.props.onSelect) {
      const next = this.getTimeValue(this.state.str);
      if (!next) return;
      this.props.onSelect(next);
      event.preventDefault();
    }
  }

  onFocus = () => {
    this.setState({ hasFocus: true });
  }

  onBlur = () => {
    const base = this.props.selectedValue ? this.props.selectedValue : (this.props.value || null);
    this.setState({
      hasFocus: false,
      str: formatTime(base, this.props.format),
    });
  }

  static getInstance() {
    return timeInputInstance;
  }

  static getDerivedStateFromProps(nextProps, state) {
    let newState = null;
    if (!state.hasFocus) {
      const base = nextProps.selectedValue || null;
      newState = { str: formatTime(base, nextProps.format) };
    }
    return newState;
  }

  getTimeValue = (str) => {
    const { selectedValue, value, showSecond } = this.props;
    const timeStr = initializeTime(str, showSecond);
    if (!timeStr) return null;
    const base = selectedValue || value || dayjs();
    if (showSecond) {
      const [hour, minute, second] = timeStr.split(':').map(Number);
      return setTimeWithSeconds(base, { hour, minute, second });
    }
    const parsed = dayjs(timeStr, 'HH:mm');
    return base.clone().hour(parsed.hour()).minute(parsed.minute());
  }

  saveRef = (node) => {
    timeInputInstance = node;
  }

  render() {
    const { prefixCls, placeholder, inputMode, disabled, className } = this.props;
    const inputCls = className || `${prefixCls}-input`;
    return (
      <div className={`${prefixCls}-input-wrap`}>
        <div className={`${prefixCls}-time-input-wrap`}>
          <input
            id="time-input"
            ref={this.saveRef}
            className={inputCls}
            value={this.state.str}
            disabled={disabled}
            placeholder={placeholder}
            onChange={this.onInputChange}
            onKeyDown={this.onKeyDown}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            inputMode={inputMode}
          />
        </div>
      </div>
    );
  }
}

polyfill(TimeInput);

export default TimeInput;
