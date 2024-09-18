import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

export default class CalendarRightPanel extends React.Component {

  static propTypes = {
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    locale: PropTypes.object,
    defaultTime: PropTypes.string,
    onSelect: PropTypes.func,
    onClickRightPanelTime: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      highlightTime: this.props.value || null,
    };
    this.timeRef = React.createRef();
    this.times = this.getTimes();
  }

  componentDidMount() {
    const { defaultTime } = this.props;
    const showTimeIndex = defaultTime ? this.times.findIndex(item => item >= defaultTime) : -1;
    const scrollTimeIndex = showTimeIndex > -1 ? showTimeIndex : 16;
    this.timeRef.current.scrollTo(0, 34 * scrollTimeIndex);
  }

  onSelect = (value, event) => {
    this.setState({
      highlightTime: value,
    });
    this.props.onSelect(value);
    this.props.onClickRightPanelTime(event);
  }

  getTimes = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      const minute0 = (`${String(i)}:00`).padStart(5, '0');
      times.push(minute0);
      const minute30 = (`${String(i)}:30`).padStart(5, '0');
      times.push(minute30);
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
    const { value, prefixCls, locale } = this.props;
    const selectedDate = value.format().slice(0, 10);
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
