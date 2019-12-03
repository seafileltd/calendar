import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class CalendarRightPanel extends React.Component {

  static propTypes = {
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    onSelect: PropTypes.func,
    locale: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      highlightTime: this.props.value || null,
    };
    this.timeRef = React.createRef();
  }

  componentDidMount() {
    // The default time is 8, page scroll to 08:00
    this.timeRef.current.scrollTo(0, 34 * 16);
  }

  onSelect = (value) => {
    this.setState({
      highlightTime: value,
    });
    this.props.onSelect(value);
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
    const times = [];
    for (let i = 0; i < 24; i++) {
      const str = (`${String(i)}:00`).padStart(5, '0');
      const str1 = (`${String(i)}:30`).padStart(5, '0');
      times.push(str);
      times.push(str1);
    }
    const highlight = this.state.highlightTime;
    const highlightTime = highlight ? highlight.format().slice(11, 16) : null;
    const isEnGb = (locale && locale.year === 'Year');
    return (
      <div className={`${prefixCls}-right-panel`}>
        <div className={`${prefixCls}-right-panel-header`} onClick={this.scrollUp}>
          <span></span>
        </div>
        <div className={`${prefixCls}-right-panel-body`} ref={this.timeRef}>
          <ul>
            {times.map((time) => {
              let current = moment(`${selectedDate} ${time}`);
              current = isEnGb ? current.locale('en-gb') : current.locale('zh-cn');
              return (
                <li
                  key={time}
                  onClick={this.onSelect.bind(this, current)}
                  className={`${highlightTime === time ? 'highlight' : ''}`}
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
