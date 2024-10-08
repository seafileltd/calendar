/* eslint react/no-multi-comp:0, no-console:0 */

import '@seafile/seafile-calendar/assets/index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import FullCalendar from '@seafile/seafile-calendar/src/FullCalendar';

import 'rc-select/assets/index.css';
import Select from 'rc-select';

import zhCN from '@seafile/seafile-calendar/src/locale/zh_CN';
import enUS from '@seafile/seafile-calendar/src/locale/en_US';

import dayjs from '../src/util/dayjs';

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

function onSelect(value) {
  console.log('select', value.format(format));
}

class Demo extends React.Component {
  state = {
    type: 'month',
  };

  onTypeChange = (type) => {
    this.setState({
      type,
    });
  }

  render() {
    return (
      <div style={{ zIndex: 1000, position: 'relative' }}>
        <FullCalendar
          style={{ margin: 10 }}
          Select={Select}
          fullscreen={false}
          onSelect={onSelect}
          defaultValue={now}
          locale={cn ? zhCN : enUS}
        />
        <FullCalendar
          style={{ margin: 10 }}
          Select={Select}
          fullscreen
          defaultValue={now}
          onSelect={onSelect}
          type={this.state.type}
          onTypeChange={this.onTypeChange}
          locale={cn ? zhCN : enUS}
        />
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('__react-content'));
