import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

export default class CalendarRightPanel extends React.Component {

  static propTypes = {
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    selectedValue: PropTypes.object,
    onSelect: PropTypes.func,
    onClickRightPanelTime: PropTypes.func,
    locale: PropTypes.object,
    defaultMinutesTime: PropTypes.string,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  }

  constructor(props) {
    super(props);
    const format = Array.isArray(this.props.format) ? this.props.format[0] : this.props.format;
    this.state = {
      highlightTime: this.props.selectedValue || this.props.value || null,
      localeFormat: format,
    };

    this.hoursRef = React.createRef();
    this.minutesRef = React.createRef();
    this.hours = this.getHours();
    this.minutes = this.getMinutes();

    this.skipScrollUpdates = 0;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.selectedValue) {
      if (!prevState.highlightTime || !prevState.highlightTime.isSame(nextProps.selectedValue)) {
        return { highlightTime: nextProps.selectedValue };
      }
    }
    return null;
  }

  componentDidMount() {
  const { defaultMinutesTime, value, selectedValue } = this.props;
  const baseTime = defaultMinutesTime || ((selectedValue || value) ? (selectedValue || value).format('HH:mm') : '00:00');
  const base = baseTime.split(':');
    const hIdx = this.hours.findIndex(h => h === base[0]);
    const mIdx = this.minutes.findIndex(m => m === base[1]);
    const hourIndex = hIdx > -1 ? hIdx : 0;
    const minuteIndex = mIdx > -1 ? mIdx : 0;

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        this.centerScroll(this.hoursRef.current, hourIndex);
        this.centerScroll(this.minutesRef.current, minuteIndex);
      });
    } else {
      this.centerScroll(this.hoursRef.current, hourIndex);
      this.centerScroll(this.minutesRef.current, minuteIndex);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevV = prevState.highlightTime || prevProps.selectedValue || prevProps.value;
    const currV = this.state.highlightTime || this.props.selectedValue || this.props.value;

    const prevH = prevV ? prevV.format('HH') : '00';
    const prevM = prevV ? prevV.format('mm') : '00';
    const currH = currV ? currV.format('HH') : '00';
    const currM = currV ? currV.format('mm') : '00';

    if (this.skipScrollUpdates > 0) {
      this.skipScrollUpdates -= 1;
      return;
    }

    const hChanged = prevH !== currH;
    const mChanged = prevM !== currM;
    if (hChanged || mChanged) {
      const scrollHours = () => {
        if (hChanged) {
          const hIdx = this.hours.findIndex(h => h === currH);
          const hourIndex = hIdx > -1 ? hIdx : 0;
          this.centerScroll(this.hoursRef.current, hourIndex);
        }
        if (mChanged) {
          const mIdx = this.minutes.findIndex(m => m === currM);
          const minuteIndex = mIdx > -1 ? mIdx : 0;
          this.centerScroll(this.minutesRef.current, minuteIndex);
        }
      };
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(scrollHours);
      } else {
        scrollHours();
      }
    }
  }

  centerScroll = (container, index) => {
    if (!container || index < 0) return;
    const firstItem = container.querySelector('li');
    const itemHeight = (firstItem && firstItem.offsetHeight) || 32;
    const containerHeight = container.clientHeight || 0;
    const maxScroll = Math.max(0, container.scrollHeight - containerHeight);
    let target = index * itemHeight - (containerHeight / 2 - itemHeight / 2);
    if (target < 0) target = 0;
    if (target > maxScroll) target = maxScroll;
    container.scrollTop = target;
  }

  onSelectMinute = (minute) => {
    const base = this.props.selectedValue || this.props.value || this.state.highlightTime || dayjs();
    const h = parseInt(this.getSelectedHour(), 10) || 0;
    const m = parseInt(minute, 10) || 0;
    const current = base.clone().hour(h).minute(m);
    this.skipScrollUpdates = 2;
    this.setState({ highlightTime: current });
    this.props.onSelect(current);
    if (this.props.onClickRightPanelTime) {
      this.props.onClickRightPanelTime();
    }
  }

  onSelectHour = (hour) => {
    const base = this.props.selectedValue || this.props.value || this.state.highlightTime || dayjs();
    const h = parseInt(hour, 10) || 0;
    const m = parseInt(this.getSelectedMinute(), 10) || 0;
    const current = base.clone().hour(h).minute(m);
    this.skipScrollUpdates = 2;
    this.setState({ highlightTime: current });
    this.props.onSelect(current);
  }

  getHours = () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

  getMinutes = () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  getSelectedHour = () => {
    const { highlightTime } = this.state;
    const { value, selectedValue } = this.props;
    const v = highlightTime || selectedValue || value;
    return v ? v.format('HH') : '00';
  }

  getSelectedMinute = () => {
    const { highlightTime } = this.state;
    const { value, selectedValue } = this.props;
    const v = highlightTime || selectedValue || value;
    return v ? v.format('mm') : '00';
  }

  render() {
    const { prefixCls } = this.props;
    const selectedHour = this.getSelectedHour();
    const selectedMinute = this.getSelectedMinute();
    return (
      <div className={`${prefixCls}-right-panel`}>
        <div className={`${prefixCls}-right-panel-time-header`}>
          {selectedHour}:{selectedMinute}
        </div>
        <div className={`${prefixCls}-right-panel-body`}>
          <div className={`${prefixCls}-right-panel-col`} ref={this.hoursRef}>
            <ul>
              {this.hours.map((h) => (
                <li
                  key={h}
                  onClick={() => this.onSelectHour(h)}
                  className={`${prefixCls}-right-panel-item ${h === selectedHour ? `${prefixCls}-right-panel-item-selected` : ''}`}
                  title={h}
                >{h}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${prefixCls}-right-panel-col`} ref={this.minutesRef}>
            <ul>
              {this.minutes.map((m) => (
                <li
                  key={m}
                  onClick={() => this.onSelectMinute(m)}
                  className={`${prefixCls}-right-panel-item ${m === selectedMinute ? `${prefixCls}-right-panel-item-selected` : ''}`}
                  title={m}
                >{m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
