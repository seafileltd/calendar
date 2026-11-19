import React from 'react';
import { mount } from 'enzyme';
import MockDate from 'mockdate';
import dayjs from '../src/util/dayjs';
import Calendar from '../src/Calendar';
import Picker from '../src/Picker';
import TimeInput from '../src/time/TimeInput';
import CalendarRightPanel from '../src/calendar/CalendarRightPanel';

const value = dayjs('2026-11-17 17:44:37');
const createCalendar = (props = {}) => mount(
  <Calendar
    showHourAndMinute
    showSecond
    format="YYYY-MM-DD HH:mm:ss"
    defaultValue={value}
    defaultSelectedValue={value}
    {...props}
  />
);

it('centers the selected time using row positions including margins', () => {
  const panel = new CalendarRightPanel({});
  const firstItem = { offsetHeight: 32, offsetTop: 2 };
  const container = {
    querySelector: () => firstItem,
    querySelectorAll: () => ({ 5: { offsetTop: 182 } }),
    clientHeight: 100,
    scrollHeight: 600,
  };
  panel.centerScroll(container, 5);
  expect(container.scrollTop).toBe(146);
});

describe('optional seconds panel', () => {
  let wrapper;
  afterEach(() => { if (wrapper) wrapper.unmount(); });

  it('keeps the existing minute UI and completion callback when showSecond is omitted', () => {
    const onComplete = jest.fn();
    const onSelect = jest.fn();
    wrapper = createCalendar({
      showSecond: undefined, onClickRightPanelTime: onComplete, onSelect,
    });
    expect(wrapper.find('.rc-calendar-right-panel-col')).toHaveLength(2);
    expect(wrapper.find('#time-input').prop('value')).toBe('17:44');
    expect(wrapper.find('.rc-calendar-with-seconds')).toHaveLength(0);
    wrapper.find('.rc-calendar-right-panel-col').at(1).find('li').at(45).simulate('click');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2026-11-17 17:45:37');
    expect(onSelect.mock.calls[0][1]).toBeUndefined();
  });

  it('does not enable a time panel for date-only callers', () => {
    wrapper = createCalendar({ showHourAndMinute: false, format: 'YYYY-MM-DD' });
    expect(wrapper.find('.rc-calendar-right-panel')).toHaveLength(0);
    expect(wrapper.find('.rc-calendar-with-seconds')).toHaveLength(0);
  });

  it('adds seconds after minutes using the same list and input', () => {
    wrapper = createCalendar();
    const columns = wrapper.find('.rc-calendar-right-panel-col');
    expect(columns).toHaveLength(3);
    expect(columns.map(column => column.find('li').length)).toEqual([24, 60, 60]);
    const selected = columns.map(column => (
      column.find('.rc-calendar-right-panel-item-selected').text()
    ));
    expect(selected).toEqual(['17', '44', '37']);
    expect(wrapper.find('#time-input').prop('value')).toBe('17:44:37');
    expect(wrapper.find('#time-input').prop('placeholder')).toBe('HH:mm:ss');
    expect(wrapper.find('.rc-calendar-with-seconds')).toHaveLength(1);
  });

  const units = ['hour', 'minute', 'second'];
  [[0, 12, '12:39:28'], [1, 45, '13:45:28'], [2, 37, '13:39:37']].forEach(([index, item, expected]) => {
    it(`keeps the other displayed time parts when first selecting a ${units[index]}`, () => {
      const previousNow = new Date();
      MockDate.set(new Date(2026, 10, 18, 13, 39, 28));
      try {
        const onSelect = jest.fn();
        const onComplete = jest.fn();
        wrapper = createCalendar({
          defaultValue: value.clone().startOf('day'),
          defaultSelectedValue: null,
          onSelect,
          onClickRightPanelTime: onComplete,
        });
        const columns = wrapper.find('.rc-calendar-right-panel-col');
        expect(columns.map(column => (
          column.find('.rc-calendar-right-panel-item-current').text()
        ))).toEqual(['13', '39', '28']);
        MockDate.set(new Date(2026, 10, 18, 13, 40, 10));
        columns.at(index).find('li').at(item).simulate('click');
        expect(onSelect.mock.calls[0][0].format('YYYY-MM-DD HH:mm:ss')).toBe(`2026-11-17 ${expected}`);
        expect(wrapper.find('#time-input').prop('value')).toBe(expected);
        expect(onComplete).toHaveBeenCalledTimes(index === 2 ? 1 : 0);
      } finally {
        MockDate.set(previousNow);
      }
    });
  });

  // Run with TZ=America/New_York to exercise the second occurrence of 01:30.
  ['seconds column', 'time input'].forEach((method) => {
    it(`keeps the selected instant when changing seconds with the ${method}`, () => {
      const selected = dayjs('2026-11-01T06:30:37.456Z');
      const onSelect = jest.fn();
      wrapper = createCalendar({ defaultValue: selected, defaultSelectedValue: selected, onSelect });
      if (method === 'seconds column') {
        wrapper.find('.rc-calendar-right-panel-col').at(2).find('li').at(38).simulate('click');
      } else {
        const input = wrapper.find('#time-input');
        input.simulate('focus');
        input.simulate('change', { target: { value: `${selected.format('HH:mm')}:38` } });
        input.simulate('keyDown', { key: 'Enter', preventDefault() {} });
      }
      const calls = onSelect.mock.calls;
      expect(calls[calls.length - 1][0].toISOString()).toBe('2026-11-01T06:30:38.000Z');
      expect(selected.toISOString()).toBe('2026-11-01T06:30:37.456Z');
    });
  });

  it('updates the time format and placeholder together when precision changes', () => {
    wrapper = createCalendar();
    wrapper.setProps({ showSecond: false });
    expect(wrapper.find('#time-input').prop('value')).toBe('17:44');
    expect(wrapper.find('#time-input').prop('placeholder')).toBe('HH:mm');
    expect(wrapper.find('.rc-calendar-right-panel-col')).toHaveLength(2);
    wrapper.setProps({ showSecond: true });
    expect(wrapper.find('#time-input').prop('value')).toBe('17:44:37');
    expect(wrapper.find('#time-input').prop('placeholder')).toBe('HH:mm:ss');
    expect(wrapper.find('.rc-calendar-right-panel-col')).toHaveLength(3);
  });

  it('completes only after selecting a second and keeps the date', () => {
    const onComplete = jest.fn();
    const onSelect = jest.fn();
    wrapper = createCalendar({ onClickRightPanelTime: onComplete, onSelect });
    wrapper.find('.rc-calendar-right-panel-col').at(0).find('li').at(12).simulate('click');
    wrapper.find('.rc-calendar-right-panel-col').at(1).find('li').at(45).simulate('click');
    expect(onComplete).not.toHaveBeenCalled();
    wrapper.find('.rc-calendar-right-panel-col').at(2).find('li').at(59).simulate('click');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[2][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2026-11-17 12:45:59');
    expect(onSelect.mock.calls[2][1]).toEqual({ source: 'timePanelSelect' });
    expect(wrapper.find('#time-input').prop('value')).toBe('12:45:59');
  });

  it('selects and preserves midnight instead of replacing it with the current time', () => {
    const onSelect = jest.fn();
    wrapper = createCalendar({ onSelect });
    [0, 1, 2].forEach(index => {
      wrapper.find('.rc-calendar-right-panel-col').at(index).find('li').at(0).simulate('click');
    });
    expect(onSelect.mock.calls[2][0].format('HH:mm:ss')).toBe('00:00:00');
    wrapper.find('.rc-calendar-date').filterWhere(node => node.text() === '18').simulate('click');
    expect(onSelect.mock.calls[3][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2026-11-18 00:00:00');
  });

  ['YYYY-MM-DD', 'M/D/YYYY', 'DD/MM/YYYY', 'DD.MM.YYYY'].forEach(format => {
    it(`edits ${format} dates separately from the selected time`, () => {
      const onSelect = jest.fn();
      wrapper = createCalendar({ format: `${format} HH:mm:ss`, onSelect });
      wrapper.find('#date-input').simulate('change', {
        target: { value: dayjs('2026-11-18').format(format) },
      });
      expect(onSelect.mock.calls[0][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2026-11-18 17:44:37');
      expect(wrapper.find('#time-input').prop('value')).toBe('17:44:37');
    });
  });

  it('supports time input and Enter using the existing completion callback', () => {
    const onSelect = jest.fn();
    const onComplete = jest.fn();
    wrapper = createCalendar({ onSelect, onClickRightPanelTime: onComplete });
    wrapper.find('#time-input').simulate('focus');
    wrapper.find('#time-input').simulate('change', { target: { value: '09:12:45' } });
    expect(onComplete).not.toHaveBeenCalled();
    wrapper.find('#time-input').simulate('keyDown', {
      key: 'Enter', keyCode: 13, preventDefault() {},
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[1][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2026-11-17 09:12:45');
    expect(onSelect.mock.calls[1][1]).toEqual({ source: 'timeInputSelect' });
  });

  it('retains all time columns in month and year panels', () => {
    wrapper = createCalendar();
    wrapper.find('.rc-calendar-month-select').simulate('click');
    expect(wrapper.find('.rc-calendar-right-panel-col')).toHaveLength(3);
    wrapper.find('.rc-calendar-month-panel-year-select').simulate('click');
    expect(wrapper.find('.rc-calendar-right-panel-col')).toHaveLength(3);
  });
});

describe('time input compatibility', () => {
  it('uses the supplied format and placeholder without overriding them for seconds', () => {
    const wrapper = mount(
      <TimeInput
        selectedValue={value}
        showSecond
        format={['HH mm ss']}
        placeholder="HH:mm"
      />
    );
    expect(wrapper.find('input').prop('value')).toBe('17 44 37');
    expect(wrapper.find('input').prop('placeholder')).toBe('HH:mm');
    wrapper.find('input').simulate('focus');
    wrapper.find('input').simulate('change', { target: { value: '09:12:45' } });
    wrapper.find('input').simulate('blur');
    expect(wrapper.find('input').prop('value')).toBe('17 44 37');
    wrapper.unmount();
  });

  const cases = [
    [false, '930', '09:30:37'],
    [false, '17:45', '17:45:37'],
    [true, '09:12:45', '09:12:45'],
    [true, '174459', '17:44:59'],
    [true, '1744', '17:44:00'],
    [true, '17:44', '17:44:00'],
    [true, '9', '09:00:00'],
    [true, '00:00:00', '00:00:00'],
    [true, '99:99:99', '23:59:59'],
  ];
  cases.forEach(([showSecond, text, expected]) => {
    it(`parses ${text} with seconds ${showSecond}`, () => {
      const onChange = jest.fn();
      const onSelect = jest.fn();
      const wrapper = mount(
        <TimeInput
          selectedValue={value}
          showSecond={showSecond}
          format={showSecond ? 'HH:mm:ss' : 'HH:mm'}
          onChange={onChange}
          onSelect={onSelect}
        />
      );
      expect(wrapper.find('input').prop('value')).toBe(showSecond ? '17:44:37' : '17:44');
      wrapper.find('input').simulate('focus');
      wrapper.find('input').simulate('change', { target: { value: text } });
      expect(onChange.mock.calls[0][0].format('HH:mm:ss')).toBe(expected);
      wrapper.find('input').simulate('keyDown', { key: 'Enter', preventDefault() {} });
      expect(onSelect.mock.calls[0][0].format('HH:mm:ss')).toBe(expected);
      wrapper.unmount();
    });
  });
});

describe('picker completion compatibility', () => {
  [false, true].forEach(showSecond => {
    it(`keeps the existing close behavior unless seconds are enabled (${showSecond})`, () => {
      const onOpenChange = jest.fn();
      const wrapper = mount(
        <Picker
          defaultOpen
          calendar={<Calendar showHourAndMinute showSecond={showSecond} />}
          onOpenChange={onOpenChange}
        >
          {() => <input />}
        </Picker>
      );
      wrapper.instance().onCalendarSelect(value, { source: 'timePanelChange' });
      expect(onOpenChange.mock.calls.length).toBe(showSecond ? 0 : 1);
      wrapper.instance().onCalendarSelect(value, { source: 'timePanelSelect' });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      wrapper.unmount();
    });
  });
});
