import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { setTimeWithSeconds } from '../util';

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
    timeInput: PropTypes.node,
    showSecond: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    const format = Array.isArray(this.props.format) ? this.props.format[0] : this.props.format;
    this.state = {
      highlightTime: this.props.selectedValue || null,
      localeFormat: format,
    };

    // Use the same time for the empty panel and the first selection.
    this.initialTime = dayjs();
    this.hoursRef = React.createRef();
    this.minutesRef = React.createRef();
    this.secondsRef = React.createRef();
    this.hours = this.getHours();
    this.minutes = this.getMinutes();
    this.seconds = this.getMinutes();

    this.skipScrollUpdates = 0;
  }

  componentDidMount() {
    const { defaultMinutesTime, selectedValue, showSecond } = this.props;
    const initialTime = selectedValue || this.initialTime;
    const baseTime = defaultMinutesTime || initialTime.format('HH:mm:ss');
    const base = baseTime.split(':');
    const hIdx = this.hours.findIndex(h => h === base[0]);
    const mIdx = this.minutes.findIndex(m => m === base[1]);
    const hourIndex = hIdx > -1 ? hIdx : 0;
    const minuteIndex = mIdx > -1 ? mIdx : 0;
    const secondIndex = parseInt(base[2] || initialTime.format('ss'), 10);

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        this.centerScroll(this.hoursRef.current, hourIndex);
        this.centerScroll(this.minutesRef.current, minuteIndex);
        if (showSecond) this.centerScroll(this.secondsRef.current, secondIndex);
      });
    } else {
      this.centerScroll(this.hoursRef.current, hourIndex);
      this.centerScroll(this.minutesRef.current, minuteIndex);
      if (showSecond) this.centerScroll(this.secondsRef.current, secondIndex);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevV = prevState.highlightTime || prevProps.selectedValue || this.initialTime;
    const currV = this.state.highlightTime || this.props.selectedValue || this.initialTime;

    const prevH = prevV ? prevV.format('HH') : '00';
    const prevM = prevV ? prevV.format('mm') : '00';
    const currH = currV ? currV.format('HH') : '00';
    const currM = currV ? currV.format('mm') : '00';
    const prevS = prevV ? prevV.second() : 0;
    const currS = currV ? currV.second() : 0;

    if (this.skipScrollUpdates > 0) {
      this.skipScrollUpdates -= 1;
      return;
    }

    const hChanged = prevH !== currH;
    const mChanged = prevM !== currM;
    const sChanged = this.props.showSecond &&
      (prevS !== currS || prevProps.showSecond !== this.props.showSecond);
    if (hChanged || mChanged || sChanged) {
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
        if (sChanged) this.centerScroll(this.secondsRef.current, currS);
      };
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(scrollHours);
      } else {
        scrollHours();
      }
    }
  }

  onSelectMinute = (minute) => {
    if (this.props.showSecond) {
      this.selectTimeWithSeconds('minute', minute);
      return;
    }
    const base = this.props.selectedValue || this.state.highlightTime ||
      this.props.value || dayjs();
    const selectedHour = this.getSelectedHour();
    const h = selectedHour !== null ? parseInt(selectedHour, 10) : this.initialTime.hour();
    const m = parseInt(minute, 10);
    const current = base.clone().hour(h).minute(m);
    this.skipScrollUpdates = 2;
    this.setState({ highlightTime: current });
    this.props.onSelect(current);
    if (this.props.onClickRightPanelTime) {
      this.props.onClickRightPanelTime();
    }
  }

  onSelectHour = (hour) => {
    if (this.props.showSecond) {
      this.selectTimeWithSeconds('hour', hour);
      return;
    }
    const base = this.props.selectedValue || this.state.highlightTime || dayjs();
    const h = parseInt(hour, 10);
    const selectedMinute = this.getSelectedMinute();
    const m = selectedMinute !== null ? parseInt(selectedMinute, 10) : this.initialTime.minute();
    const current = base.clone().hour(h).minute(m);
    this.skipScrollUpdates = 2;
    this.setState({ highlightTime: current });
    this.props.onSelect(current);
  }

  onSelectSecond = (second) => {
    this.selectTimeWithSeconds('second', second);
  }

  selectTimeWithSeconds = (unit, value) => {
    const selected = this.props.selectedValue || this.state.highlightTime;
    const base = selected || this.props.value || this.initialTime;
    // Before a selection, keep the calendar's date and use the time shown in the columns.
    const time = selected || this.initialTime;
    const current = setTimeWithSeconds(base, {
      hour: time.hour(),
      minute: time.minute(),
      second: time.second(),
      [unit]: parseInt(value, 10),
    });
    const completed = unit === 'second';
    this.skipScrollUpdates = 2;
    this.setState({ highlightTime: current });
    this.props.onSelect(current, { source: completed ? 'timePanelSelect' : 'timePanelChange' });
    if (completed && this.props.onClickRightPanelTime) this.props.onClickRightPanelTime();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.selectedValue) {
      if (!prevState.highlightTime || !prevState.highlightTime.isSame(nextProps.selectedValue)) {
        return { highlightTime: nextProps.selectedValue };
      }
    }
    return null;
  }

  getHours = () => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

  getMinutes = () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  getSelectedHour = () => {
    const { highlightTime } = this.state;
    const { selectedValue } = this.props;
    const v = highlightTime || selectedValue || null;
    return v ? v.format('HH') : null;
  }

  getSelectedMinute = () => {
    const { highlightTime } = this.state;
    const { selectedValue } = this.props;
    const v = highlightTime || selectedValue || null;
    return v ? v.format('mm') : null;
  }

  getSelectedSecond = () => {
    const v = this.state.highlightTime || this.props.selectedValue || null;
    return v ? v.format('ss') : null;
  }

  centerScroll = (container, index) => {
    if (!container || index < 0) return;
    const firstItem = container.querySelector('li');
    const itemHeight = (firstItem && firstItem.offsetHeight) || 32;
    const item = container.querySelectorAll('li')[index];
    const itemTop = (item && firstItem && item.offsetTop - firstItem.offsetTop) ||
      index * itemHeight;
    const containerHeight = container.clientHeight || 0;
    const maxScroll = Math.max(0, container.scrollHeight - containerHeight);
    let target = itemTop - (containerHeight / 2 - itemHeight / 2);
    if (target < 0) target = 0;
    if (target > maxScroll) target = maxScroll;
    container.scrollTop = target;
  }

  render() {
    const { prefixCls } = this.props;
    const selectedHour = this.getSelectedHour();
    const selectedMinute = this.getSelectedMinute();
    const selectedSecond = this.getSelectedSecond();
    const { initialTime } = this;
    const currentHour = initialTime.format('HH');
    const currentMinute = initialTime.format('mm');
    const currentSecond = initialTime.format('ss');
    return (
      <div className={`${prefixCls}-right-panel`}>
        <div className={`${prefixCls}-time-input`}>
          {this.props.timeInput}
        </div>
        <div className={`${prefixCls}-right-panel-body`}>
          <div className={`${prefixCls}-right-panel-col`} ref={this.hoursRef}>
            <ul>
              {this.hours.map((h) => {
                const isSelected = selectedHour && h === selectedHour;
                const isCurrent = !selectedHour && h === currentHour;
                const className = [
                  `${prefixCls}-right-panel-item-text`,
                  isSelected ? `${prefixCls}-right-panel-item-selected` : '',
                  isCurrent ? `${prefixCls}-right-panel-item-current` : '',
                ].filter(Boolean).join(' ');
                return (
                  <li
                    key={h}
                    onClick={() => this.onSelectHour(h)}
                    className={`${prefixCls}-right-panel-item`}
                    title={h}
                  >
                    <span className={className}>
                      {h}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={`${prefixCls}-right-panel-col`} ref={this.minutesRef}>
            <ul>
              {this.minutes.map((m) => {
                const isSelected = selectedMinute && m === selectedMinute;
                const isCurrent = !selectedMinute && m === currentMinute;
                const className = [
                  `${prefixCls}-right-panel-item-text`,
                  isSelected ? `${prefixCls}-right-panel-item-selected` : '',
                  isCurrent ? `${prefixCls}-right-panel-item-current` : '',
                ].filter(Boolean).join(' ');
                return (
                  <li
                    key={m}
                    onClick={() => this.onSelectMinute(m)}
                    className={`${prefixCls}-right-panel-item`}
                    title={m}
                  >
                    <span className={className}>
                      {m}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          {this.props.showSecond && (
            <div className={`${prefixCls}-right-panel-col`} ref={this.secondsRef}>
              <ul>
                {this.seconds.map((second) => {
                  const isSelected = selectedSecond && second === selectedSecond;
                  const isCurrent = !selectedSecond && second === currentSecond;
                  const className = [
                    `${prefixCls}-right-panel-item-text`,
                    isSelected ? `${prefixCls}-right-panel-item-selected` : '',
                    isCurrent ? `${prefixCls}-right-panel-item-current` : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <li
                      key={second}
                      onClick={() => this.onSelectSecond(second)}
                      className={`${prefixCls}-right-panel-item`}
                      title={second}
                    >
                      <span className={className}>{second}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
}
