import '@seafile/seafile-calendar/assets/index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from '@seafile/seafile-calendar';
import DatePicker from '@seafile/seafile-calendar/src/Picker';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';

import zhCN from '@seafile/seafile-calendar/src/locale/zh_CN';
import enUS from '@seafile/seafile-calendar/src/locale/en_US';

import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en-gb';
dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);

const format = 'YYYY-MM-DD';
const cn = location.search.indexOf('cn') !== -1;

const now = dayjs();
if (cn) {
  now.locale('zh-cn').utcOffset(8);
} else {
  now.locale('en-gb').utcOffset(0);
}

const defaultCalendarValue = now.clone();
defaultCalendarValue.add(-1, 'month');

class Demo extends React.Component {
  state = {
    open: false,
    destroy: false,
  };

  getCalendarContainer() {
    return this.d || document.getElementById('d');
  }

  setVisible(open) {
    this.setState({
      open,
    });
  }

  open = () => {
    this.setVisible(true);
  }

  close = () => {
    this.setVisible(false);
  }

  destroy = () => {
    this.setState({
      destroy: true,
    });
  }

  render() {
    if (this.state.destroy) {
      return null;
    }
    return (<div>
      <button onClick={this.open}>open</button>
      &nbsp;
      <button onClick={this.destroy}>destroy</button>
      <Dialog visible={this.state.open} onClose={this.close}>
        <div id="d" ref={n => (this.d = n)} />
        <div style={{ marginTop: 20 }}>
          <DatePicker
            getCalendarContainer={this.getCalendarContainer}
            calendar={<Calendar locale={cn ? zhCN : enUS}/>}
          >
            {
              ({ value }) => {
                return (
                  <span>
                <input
                  style={{ width: 250 }}
                  readOnly
                  value={value && value.format(format) || ''}
                />
                </span>
                );
              }
            }
          </DatePicker>
        </div>
      </Dialog>
    </div>);
  }
}

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
