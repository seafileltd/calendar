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
      highlightTime: this.props.selectedValue || null,
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
    const { defaultMinutesTime, selectedValue } = this.props;
    const baseTime = defaultMinutesTime || (selectedValue ? selectedValue.format('HH:mm') : dayjs().format('HH:mm'));
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
    const prevV = prevState.highlightTime || prevProps.selectedValue || dayjs();
    const currV = this.state.highlightTime || this.props.selectedValue || dayjs();

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
    const base = this.props.selectedValue || this.state.highlightTime || this.props.value || dayjs();
    const selectedHour = this.getSelectedHour();
    const h = selectedHour !== null ? parseInt(selectedHour, 10) : dayjs().hour();
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
    const base = this.props.selectedValue || this.state.highlightTime || dayjs();
    const h = parseInt(hour, 10);
    const selectedMinute = this.getSelectedMinute();
    const m = selectedMinute !== null ? parseInt(selectedMinute, 10) : dayjs().minute();
    const current = base.clone().hour(h).minute(m);
    this.skipScrollUpdates = 2;
    this.setState({ highlightTime: current });
    this.props.onSelect(current);
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

  render() {
    const { prefixCls } = this.props;
    const selectedHour = this.getSelectedHour();
    const selectedMinute = this.getSelectedMinute();
    const currentHour = dayjs().format('HH');
    const currentMinute = dayjs().format('mm');
    const displayHour = selectedHour || currentHour;
    const displayMinute = selectedMinute || currentMinute;

    return (
      <div className={`${prefixCls}-right-panel`}>
        <div className={`${prefixCls}-right-panel-header ${prefixCls}-header`}>
          {displayHour}:{displayMinute}
        </div>
        <div className={`${prefixCls}-right-panel-body`}>
          <div className={`${prefixCls}-right-panel-col`} ref={this.hoursRef}>
            <ul>
              {this.hours.map((h) => {
                const isSelected = selectedHour && h === selectedHour;
                const isCurrent = !selectedHour && h === currentHour;
                const className = `${prefixCls}-right-panel-item-text ${isSelected ? `${prefixCls}-right-panel-item-selected` : ''} ${isCurrent ? `${prefixCls}-right-panel-item-current` : ''}`;
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
                const className = `${prefixCls}-right-panel-item-text ${isSelected ? `${prefixCls}-right-panel-item-selected` : ''} ${isCurrent ? `${prefixCls}-right-panel-item-current` : ''}`;
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
        </div>
      </div>
    );
  }
}
