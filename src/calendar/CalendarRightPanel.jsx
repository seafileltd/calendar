import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { formatDateLocal } from '../util';

export default class CalendarRightPanel extends React.Component {

  static propTypes = {
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    onSelect: PropTypes.func,
    onClickRightPanelTime: PropTypes.func,
    locale: PropTypes.object,
    defaultMinutesTime: PropTypes.string,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    showHourAndMinute: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      highlightTime: this.props.value || null,
      localeFormat: this.props.format[0],
    };
    this.timeRef = React.createRef();
    this.times = this.getTimes();
  }

  componentDidMount() {
    const { defaultMinutesTime } = this.props;
    const showTimeIndex = this.times.findIndex(item => item >= defaultMinutesTime);
    const scrollTimeIndex = showTimeIndex > -1 ? showTimeIndex - 1 : 16;
    this.timeRef.current.scrollTo(0, 34 * scrollTimeIndex);
  }

  onSelect = (value) => {
    this.setState({
      highlightTime: value,
    });
    this.props.onSelect(value);
    this.props.onClickRightPanelTime();
  }

  getTimes = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      const str = (`${String(i)}:00`).padStart(5, '0');
      const str1 = (`${String(i)}:30`).padStart(5, '0');
      times.push(str);
      times.push(str1);
    }
    return times;
  }

  scrollUp = () => {
    this.timeRef.current.scrollBy(0, -200);
  }

  scrollDown = () => {
    this.timeRef.current.scrollBy(0, 200);
  }

  render() {
    const { value, prefixCls, locale, showHourAndMinute } = this.props;
    let selectedDate = value.format().slice(0, 10);
    if (showHourAndMinute) {
      selectedDate = value.format().slice(0, String(value.format()).indexOf('T')).padStart(10, 0);
    }
    const highlight = this.state.highlightTime;
    const highlightTime = highlight ? highlight.format().slice(11, 16) : null;
    const isZhcn = (locale && locale.today === '今天');
    return (
      <div className={`${prefixCls}-right-panel`}>
        <div className={`${prefixCls}-right-panel-header`} onClick={this.scrollUp}>
          <span></span>
        </div>
        <div className={`${prefixCls}-right-panel-body`} ref={this.timeRef}>
          <ul>
            {this.times.map((time) => {
              let current = dayjs(`${selectedDate} ${time}`);
              if (showHourAndMinute) {
                const parts = formatDateLocal(selectedDate, this.state.localeFormat);
                if (parts[0] && parts[0].length === 4 &&
                (parts[0].slice(0, 3) === '000' || parts[0].slice(0, 2) === '00')) {
                  current.year(parts[0]);
                }
              }
              current = isZhcn ? current.locale('zh-cn') : current.locale('en-gb');
              return (
                <li
                  key={time}
                  onClick={this.onSelect.bind(this, current)}
                  className={`${highlightTime === time ? `${prefixCls}-selected-time` : ''}`}
                >{time}</li>
              );
            })}
          </ul>
        </div>
        <div className={`${prefixCls}-right-panel-footer`} onClick={this.scrollDown}>
          <span></span>
        </div>
      </div>
    );
  }
}
