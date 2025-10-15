import React from 'react';
import PropTypes from 'prop-types';
import { polyfill } from 'react-lifecycles-compat';
import dayjs from 'dayjs';

const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

function formatTime(value, format) {
  if (!value) return '';
  const fmt = Array.isArray(format) ? format[0] : (format || 'HH:mm');
  return value.format(fmt);
}

// Convert a loose numeric/time string into HH:mm
// Rules (similar spirit to DateInput.initializeStr):
// - Strip non-digits
// - If len <= 2 => treat as hour
// - If len > 2 => last two digits are minutes; preceding are hours
// - Clamp hours to [0,23], minutes to [0,59]
// - Return formatted HH:mm or '' when input is empty
function initializeTime(str) {
  if (typeof str !== 'string') return '';
  const digits = str.replace(/\D/g, '');
  if (!digits.length) return '';

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
let cachedSelectionStart;
let cachedSelectionEnd;

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
  };

  static defaultProps = {
    format: 'HH:mm',
    placeholder: 'HH:mm',
  };

  constructor(props) {
    super(props);
    this.state = {
      str: '',
      hasFocus: false,
    };
  }

  static getDerivedStateFromProps(nextProps, state) {
    let newState = null;
    if (timeInputInstance) {
      cachedSelectionStart = timeInputInstance.selectionStart;
      cachedSelectionEnd = timeInputInstance.selectionEnd;
    }

    if (!state.hasFocus) {
      const base = nextProps.selectedValue || null;
      newState = { str: base ? formatTime(base, nextProps.format) : '' };
    }
    return newState;
  }

  onInputChange = (event) => {
    const str = event.target.value;
    const timeStr = initializeTime(str);

    if (!str || !timeStr) {
      this.setState({ str });
      return;
    }

    const base = this.props.selectedValue || this.props.value || dayjs();
    const parsed = dayjs(timeStr, 'HH:mm');
    const next = base.clone().hour(parsed.hour()).minute(parsed.minute());

    this.setState({ str });
    if (this.props.onChange) {
      this.props.onChange(next);
    }
  }

  onKeyDown = (event) => {
    if (event.key === 'Enter' && this.props.onSelect) {
      const timeStr = initializeTime(this.state.str);
      if (!timeStr) return;
      const base = this.props.selectedValue || this.props.value || dayjs();
      const parsed = dayjs(timeStr, 'HH:mm');
      const next = base.clone().hour(parsed.hour()).minute(parsed.minute());
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
      str: base ? formatTime(base, this.props.format) : '',
    });
  }

  saveRef = (node) => {
    timeInputInstance = node;
  }

  static getInstance() {
    return timeInputInstance;
  }

  render() {
    const { prefixCls, placeholder, inputMode, disabled, className } = this.props;
    const inputCls = className || `${prefixCls}-time-input ${prefixCls}-text-input`;
    return (
      <div className={`${prefixCls}-time-input-outer`}>
        <input
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
    );
  }
}

polyfill(TimeInput);

export default TimeInput;
