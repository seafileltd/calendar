/* eslint-disable no-undef */
import React from 'react';
import keyCode from 'rc-util/lib/KeyCode';
import dayjs from '../src/util/dayjs';
import { mount, render } from 'enzyme';
import TimePickerPanel from 'rc-time-picker/lib/Panel';
import Calendar from '../src/Calendar';
import zhCN from '../src/locale/zh_CN';
import enUS from '../src/locale/en_US';

const format = ('YYYY-MM-DD');

describe('Calendar', () => {
  describe('render', () => {
    it('render correctly', () => {
      const zhWrapper = render(
        <Calendar locale={zhCN} defaultValue={dayjs('2017-03-29').locale('zh-cn')} />
      );
      expect(zhWrapper).toMatchSnapshot();

      const enWrapper = render(
        <Calendar locale={enUS} defaultValue={dayjs('2017-03-29').locale('en')} />
      );
      expect(enWrapper).toMatchSnapshot();

      const customEnUSLocalWithMonthFormat = { ...enUS, monthFormat: 'MMMM' };
      const enWrapperWithMonthFormatWrapper = render(
        <Calendar
          locale={customEnUSLocalWithMonthFormat}
          defaultValue={dayjs('2017-03-29').local('en')}
        />
      );
      expect(enWrapperWithMonthFormatWrapper).toMatchSnapshot();
    });

    it('render correctly with invalid dayjs object', () => {
      const enWrapper = render(
          <Calendar locale={enUS} defaultValue={dayjs('invalid').locale('en')} />
      );
      expect(enWrapper).toMatchSnapshot();
    });

    it('render showToday false correctly', () => {
      const wrapper = mount(<Calendar showToday={false}/>);
      expect(wrapper.find('.rc-calendar-today-btn').length).toBe(0);
    });
  });

  describe('timePicker', () => {
    it('set defaultOpenValue if timePicker.props.defaultValue is set', () => {
      const timePicker = <TimePickerPanel defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />;
      const wrapper = mount(<Calendar timePicker={timePicker} />);
      wrapper.find('.rc-calendar-time-picker-btn').simulate('click');
      const selectedValues = wrapper.find('.rc-time-picker-panel-select-option-selected');
      for (let i = 0; i < selectedValues.length; i += 1) {
        expect(selectedValues.at(i).text()).toBe('00');
      }
    });

    it('follow Calendar[selectedValue|defaultSelectedValue] when it is set', () => {
      const timePicker = <TimePickerPanel defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />;
      const wrapper = mount(
        <Calendar timePicker={timePicker} defaultSelectedValue={dayjs('01:01:01', 'HH:mm:ss')} />
      );
      wrapper.find('.rc-calendar-time-picker-btn').simulate('click');
      const selectedValues = wrapper.find('.rc-time-picker-panel-select-option-selected');
      for (let i = 0; i < selectedValues.length; i += 1) {
        expect(selectedValues.at(i).text()).toBe('01');
      }
    });

    it('use timePicker\'s time', () => {
      const timePicker = <TimePickerPanel defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />;
      const onSelect = jest.fn();
      const wrapper = mount(<Calendar timePicker={timePicker} onSelect={onSelect} />);

      wrapper.find('.rc-calendar-today').simulate('click');
      // use timePicker's defaultValue if users haven't select a time
      expect(
        wrapper.find('.rc-calendar-input').at(0).getDOMNode().value
      ).toBe('3/29/2017');
      expect(onSelect.mock.calls[0][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2017-03-29 00:00:00');

      wrapper.find('.rc-calendar-time-picker-btn').simulate('click');
      wrapper.find('.rc-time-picker-panel-select ul').at(0).find('li').at(6).simulate('click');
      // update time to timePicker's time
      expect(
        wrapper.find('.rc-calendar-input').at(0).getDOMNode().value
      ).toBe('3/29/2017');
      expect(onSelect.mock.calls[1][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2017-03-29 06:00:00');

      wrapper.find('.rc-calendar-cell').at(10).simulate('click');
      // still use timePicker's time
      expect(
        wrapper.find('.rc-calendar-input').at(0).getDOMNode().value
      ).toBe('3/8/2017');
      expect(onSelect.mock.calls[2][0].format('YYYY-MM-DD HH:mm:ss')).toBe('2017-03-08 06:00:00');
      wrapper.unmount();
    });
    it('timePicker date have no changes when hover', () => {
      const timePicker = <TimePickerPanel defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />;
      const wrapper = mount(<Calendar timePicker={timePicker} />);
      wrapper.find('.rc-calendar-time-picker-btn').simulate('click');
      const dateBtns = wrapper.find('.rc-calendar-my-select a');
      const btnClassName = 'rc-calendar-time-status';
      for (let i = 0; i < dateBtns.length; i += 1) {
        dateBtns.at(i).simulate('mouseEnter');
        expect(dateBtns.get(i).props.title).toBeFalsy();
        expect(dateBtns.get(i).props.className).toEqual(expect.stringContaining(btnClassName));
      }
    });

    it('keeps the time panel when switching to month or year panel', () => {
      const wrapper = mount(<Calendar showHourAndMinute />);

      expect(wrapper.find('.rc-calendar-right-panel').length).toBe(1);

      wrapper.find('.rc-calendar-month-select').simulate('click');
      expect(wrapper.find('.rc-calendar-month-panel').length).toBe(1);
      expect(wrapper.find('.rc-calendar-right-panel').length).toBe(1);

      wrapper.find('.rc-calendar-month-panel-year-select').simulate('click');
      expect(wrapper.find('.rc-calendar-year-panel').length).toBe(1);
      expect(wrapper.find('.rc-calendar-right-panel').length).toBe(1);
    });
  });

  describe('controlled panels', () => {
    it('render controlled panels correctly', () => {
      const MonthPicker = mount(<Calendar mode="month" />);
      expect(MonthPicker.render()).toMatchSnapshot();
      MonthPicker.find('.rc-calendar-month-panel-year-select').at(0).simulate('click');
      expect(MonthPicker.find('.rc-calendar-year-panel').length).toBe(0);
      expect(MonthPicker.find('.rc-calendar-month-panel').length).toBe(1);

      const YearPicker = mount(<Calendar mode="year" />);
      expect(YearPicker.render()).toMatchSnapshot();
      YearPicker.find('.rc-calendar-year-panel-decade-select').at(0).simulate('click');
      expect(YearPicker.find('.rc-calendar-decade-panel').length).toBe(0);
      expect(YearPicker.find('.rc-calendar-year-panel').length).toBe(1);
    });

    it('support controlled mode', () => {
      const timePicker = <TimePickerPanel defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />;
      let value = null;
      class ControlledCalendar extends React.Component {
        state = { mode: 'date' };

        handlePanelChange = (v, mode) => {
          value = v;
          this.setState({ mode });
        }

        render() {
          return (
            <Calendar
              mode={this.state.mode}
              onPanelChange={this.handlePanelChange}
              timePicker={timePicker}
            />
          );
        }
      }
      const wrapper = mount(<ControlledCalendar />);

      wrapper.find('.rc-calendar-time-picker-btn').simulate('click');
      expect(wrapper.find('.rc-calendar-time-picker').length).toBe(1);
      wrapper.find('.rc-calendar-time-picker-btn').simulate('click');
      expect(wrapper.find('.rc-calendar-time-picker').length).toBe(0);

      wrapper.find('.rc-calendar-month-select').simulate('click');
      expect(wrapper.find('.rc-calendar-month-panel').length).toBe(1);
      wrapper.find('.rc-calendar-month-panel-year-select').simulate('click');
      expect(wrapper.find('.rc-calendar-year-panel').length).toBe(1);
      wrapper.find('.rc-calendar-year-panel-decade-select').simulate('click');
      expect(wrapper.find('.rc-calendar-decade-panel').length).toBe(1);
      expect(value.isSame(dayjs(), 'day'));
      wrapper.find('.rc-calendar-decade-panel-selected-cell').simulate('click');
      expect(wrapper.find('.rc-calendar-decade-panel').length).toBe(0);
      wrapper.find('.rc-calendar-year-panel-selected-cell').simulate('click');
      expect(wrapper.find('.rc-calendar-year-panel').length).toBe(0);
      wrapper.find('.rc-calendar-month-panel-selected-cell').simulate('click');
      expect(wrapper.find('.rc-calendar-month-panel').length).toBe(0);
      expect(value.isSame(dayjs('2010-03-29'), 'day'));

      wrapper.find('.rc-calendar-year-select').simulate('click');
      expect(wrapper.find('.rc-calendar-year-panel').length).toBe(1);
      wrapper.find('.rc-calendar-year-panel-decade-select').simulate('click');
      expect(wrapper.find('.rc-calendar-decade-panel').length).toBe(1);
      wrapper.find('.rc-calendar-decade-panel-selected-cell').simulate('click');
      expect(wrapper.find('.rc-calendar-decade-panel').length).toBe(0);
      wrapper.find('.rc-calendar-year-panel-selected-cell').simulate('click');
      expect(wrapper.find('.rc-calendar-year-panel').length).toBe(0);
    });
  });

  describe('after render', () => {
    let calendar;
    let input;
    beforeEach(() => {
      calendar = mount(<Calendar showToday showWeekNumber/>);
      input = calendar.find('.rc-calendar-input').hostNodes().at(0);
    });

    afterEach(() => {
      calendar.unmount();
    });

    describe('keyboard works', () => {
      it('ignores shortcut events from the date input', () => {
        const onKeyDown = jest.fn();
        const onSelect = jest.fn();
        calendar.setProps({ onKeyDown, onSelect });
        input.simulate('keyDown', { keyCode: keyCode.LEFT });

        expect(onKeyDown).not.toHaveBeenCalled();
        expect(onSelect).not.toHaveBeenCalled();
        expect(input.getDOMNode().value).toBe('');
      });

      [
        ['left', keyCode.LEFT, false],
        ['right', keyCode.RIGHT, false],
        ['up', keyCode.UP, false],
        ['down', keyCode.DOWN, false],
        ['page down', keyCode.PAGE_DOWN, false],
        ['page up', keyCode.PAGE_UP, false],
        ['ctrl left', keyCode.LEFT, true],
        ['ctrl right', keyCode.RIGHT, true],
        ['home', keyCode.HOME, false],
        ['end', keyCode.END, false],
        ['letter', keyCode.A, false],
      ].forEach(([name, code, ctrlKey]) => {
        it(`delegates the ${name} shortcut without selecting a date`, () => {
          const onKeyDown = jest.fn();
          const onSelect = jest.fn();
          const preventDefault = jest.fn();
          const stopPropagation = jest.fn();
          calendar.setProps({ onKeyDown, onSelect });
          calendar.simulate('keyDown', {
            keyCode: code,
            ctrlKey,
            preventDefault,
            stopPropagation,
          });

          expect(onKeyDown).toHaveBeenCalledTimes(1);
          expect(onKeyDown).toHaveBeenCalledWith(
            expect.objectContaining({ keyCode: code, ctrlKey })
          );
          expect(preventDefault).toHaveBeenCalled();
          expect(stopPropagation).toHaveBeenCalled();
          expect(onSelect).not.toHaveBeenCalled();
          expect(input.getDOMNode().value).toBe('');
        });
      });

      it('selects the displayed date with Enter', () => {
        const onSelect = jest.fn();
        const preventDefault = jest.fn();
        calendar.unmount();
        calendar = mount(<Calendar defaultValue={dayjs('2017-03-29')} onSelect={onSelect} />);
        calendar.simulate('keyDown', { keyCode: keyCode.ENTER, preventDefault });

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls[0][0].format(format)).toBe('2017-03-29');
        expect(onSelect.mock.calls[0][1]).toEqual({ source: 'keyboard' });
        expect(calendar.find('.rc-calendar-input').getDOMNode().value).toBe('3/29/2017');
        expect(preventDefault).toHaveBeenCalled();
      });

      it('does not select a disabled date with Enter', () => {
        const onSelect = jest.fn();
        calendar.unmount();
        calendar = mount(
          <Calendar
            defaultValue={dayjs('2017-03-28')}
            onSelect={onSelect}
            disabledDate={date => date.isBefore('2017-03-29', 'day')}
          />
        );
        calendar.simulate('keyDown', { keyCode: keyCode.ENTER });

        expect(onSelect).not.toHaveBeenCalled();
        expect(calendar.find('.rc-calendar-input').getDOMNode().value).toBe('');
      });
    });

    it('next month works', () => {
      let month = calendar.state().value.month();
      if (month === 11) {
        month = -1;
      }

      calendar.find('.rc-calendar-next-month-btn').hostNodes().at(0).simulate('click');

      expect(calendar.state().value.month()).toBe(month + 1);
      expect(input.getDOMNode().value).toBe('');
    });

    it('previous month works', () => {
      let month = calendar.state().value.month();
      if (month === 0) {
        month = 12;
      }

      calendar.find('.rc-calendar-prev-month-btn').hostNodes().at(0).simulate('click');

      expect(calendar.state().value.month()).toBe(month - 1);
      expect(input.getDOMNode().value).toBe('');
    });

    it('next year works', () => {
      const year = calendar.state().value.year();

      calendar.find('.rc-calendar-next-year-btn').hostNodes().at(0).simulate('click');

      expect(calendar.state().value.year()).toBe(year + 1);
    });

    it('previous year works', () => {
      const year = calendar.state().value.year();

      calendar.find('.rc-calendar-prev-year-btn').hostNodes().at(0).simulate('click');

      expect(calendar.state().value.year()).toBe(year - 1);
    });

    it('onSelect works', () => {
      let day;

      const onSelect = jest.fn();

      calendar = mount(
        <Calendar
          format={format}
          showToday
          onSelect={onSelect}
          showWeekNumber
        />
      );

      day = calendar.find('.rc-calendar-date').hostNodes().at(5);
      day.simulate('click');

      input = calendar.find('.rc-calendar-input').hostNodes().at(0);

      expect(input.getDOMNode().value).toBe(calendar.state().value.format(format));
      expect(onSelect.mock.calls[0][0].date()).toBe(parseInt(day.text(), 10));
    });

    it('month panel shows', () => {
      expect(calendar.find('.rc-calendar-month-panel').length).toBe(0);
      calendar.find('.rc-calendar-month-select').hostNodes().simulate('click');
      expect(calendar.find('.rc-calendar-month-panel').hostNodes().length).toBe(1);
      expect(calendar.find('.rc-calendar-month-panel-month').hostNodes().length).toBe(12);
      calendar.find('.rc-calendar-month-panel-month').hostNodes().at(9).simulate('click');
      expect(calendar.state().value.month()).toBe(9);
    });

    it('top year panel shows', () => {
      let text;
      expect(calendar.find('.rc-calendar-year-panel').length).toBe(0);
      calendar.find('.rc-calendar-year-select').hostNodes().simulate('click');
      expect(calendar.find('.rc-calendar-year-panel').hostNodes().length).toBe(1);
      expect(calendar.find('.rc-calendar-year-panel-year').hostNodes().length).toBe(12);
      const year = calendar.find('.rc-calendar-year-panel-year').hostNodes().at(9);
      year.simulate('click');
      text = year.text();
      expect(String(calendar.state().value.year())).toBe(text);
    });

    it('year panel works', () => {
      let text;
      calendar.find('.rc-calendar-month-select').hostNodes().simulate('click');
      calendar.find('.rc-calendar-month-panel-year-select').hostNodes().simulate('click');
      expect(calendar.find('.rc-calendar-year-panel').hostNodes().length).toBe(1);
      expect(calendar.find('.rc-calendar-year-panel-year').hostNodes().length).toBe(12);
      const year = calendar.find('.rc-calendar-year-panel-year').hostNodes().at(9);
      year.simulate('click');
      text = year.text();
      calendar.find('.rc-calendar-month-panel-month').hostNodes().at(9).simulate('click');
      expect(String(calendar.state().value.year())).toBe(text);
      expect(input.getDOMNode().value).toBe('');
    });

    it('decade panel works', () => {
      calendar.find('.rc-calendar-month-select').hostNodes().simulate('click');
      calendar.find('.rc-calendar-month-panel-year-select').hostNodes().simulate('click');
      calendar.find('.rc-calendar-year-panel-decade-select').hostNodes().simulate('click');

      expect(calendar.find('.rc-calendar-decade-panel').hostNodes().length).toBe(1);
      const decadeCells = calendar.find('.rc-calendar-decade-panel-decade').hostNodes();
      expect(decadeCells.length).toBe(10);
      expect(decadeCells.at(0).text()).toBe('2000-2009');
      expect(decadeCells.at(9).text()).toBe('2090-2099');
    });

    it('numeric keyboard works', () => {
      const newCalendar = mount(<Calendar inputMode="numeric" />);
      expect(newCalendar.find('.rc-calendar-input').props().inputMode).toBe('numeric');
    });

    it('extra footer works', () => {
      const renderFooter = (mode) => (<span className="extra-node">{mode}</span>);

      calendar = mount(
        <Calendar
          format={format}
          showToday
          showWeekNumber
          renderFooter={renderFooter}
        />
      );

      let extraNode = calendar.find('.extra-node');
      expect(extraNode.length).toBe(1);
      expect(extraNode.text()).toBe('date');

      calendar.find('.rc-calendar-month-select').hostNodes().simulate('click');
      extraNode = calendar.find('.rc-calendar-month-panel .extra-node');
      expect(extraNode.length).toBe(1);
      expect(extraNode.text()).toBe('month');

      calendar.find('.rc-calendar-year-select').hostNodes().simulate('click');
      extraNode = calendar.find('.rc-calendar-year-panel .extra-node');
      expect(extraNode.length).toBe(1);
      expect(extraNode.text()).toBe('year');

      calendar.find('.rc-calendar-year-panel-decade-select').hostNodes().simulate('click');
      extraNode = calendar.find('.rc-calendar-decade-panel .extra-node');
      expect(extraNode.length).toBe(1);
      expect(extraNode.text()).toBe('decade');
    });
  });


  describe('input', () => {
    it('change will fire onSelect/onChange', () => {
      const expected = '2017-01-21';

      const onSelect = jest.fn();
      const onChange = jest.fn();

      const calendar = mount(<Calendar
        format={format}
        showToday
        onSelect={onSelect}
        onChange={onChange}
      />);
      const input = calendar.find('.rc-calendar-input').hostNodes().at(0);
      input.simulate('change', { target: { value: expected } });

      expect(onSelect.mock.calls[0][0].format(format)).toBe(expected);
      expect(onChange.mock.calls[0][0].format(format)).toBe(expected);
    });

    it('supports an array of formats when parsing and formats using the first format', () => {
      const expected = '21/01/2017';
      const value = '21/01/17';

      const onSelect = jest.fn();
      const onChange = jest.fn();

      const calendar = mount(<Calendar
        format={['DD/MM/YYYY', 'DD/MM/YY']}
        showToday
        onSelect={onSelect}
        onChange={onChange}
      />);
      const input = calendar.find('.rc-calendar-input').hostNodes().at(0);
      input.simulate('change', { target: { value } });

      expect(onSelect.mock.calls[0][0].format('DD/MM/YYYY')).toBe(expected);
      expect(onChange.mock.calls[0][0].format('DD/MM/YYYY')).toBe(expected);
    });

    it('only reformat the date when the input loses focus', () => {
      const value = '21/01/17';

      const onSelect = jest.fn();
      const onChange = jest.fn();

      const calendar = mount(<Calendar
        format={['DD/MM/YYYY', 'DD/MM/YY']}
        showToday
        onSelect={onSelect}
        onChange={onChange}
      />);

      const input = calendar.find('.rc-calendar-input').hostNodes().at(0);
      input.simulate('focus');
      input.simulate('change', { target: { value } });

      let inputValue = calendar.find('.rc-calendar-input').props().value;
      expect(inputValue).toBe('21/01/17');

      input.simulate('blur');

      inputValue = calendar.find('.rc-calendar-input').props().value;
      expect(inputValue).toBe('21/01/2017');
    });
  });

  it('handle clear', () => {
    const now = dayjs();
    const calendar = mount(
      <Calendar defaultSelectedValue={now} />
    );
    calendar.find('.rc-calendar-clear-btn').simulate('click');
    expect(calendar.state().selectedValue).toBe(null);
    expect(now.isSame(calendar.state().value)).toBe(true);
  });

  describe('onOk', () => {
    it('triggers onOk', () => {
      const selected = dayjs().add(1, 'day');
      const handleOk = jest.fn();
      const calendar = mount(
        <Calendar showOk defaultSelectedValue={selected} onOk={handleOk} />
      );
      calendar.find('.rc-calendar-ok-btn').simulate('click');
      expect(handleOk).toHaveBeenCalledWith(selected);
    });

    it('Ok Button disabled', () => {
      const calendar = mount(
        <Calendar showOk />
      );

      expect(
        calendar.find('OkButton').props().okDisabled
      ).toBe(true);
    });

    it('does not triggers onOk if selected date is disabled', () => {
      const selected = dayjs().add(1, 'day');
      const handleOk = jest.fn();
      const calendar = mount(
        <Calendar
          showOk
          defaultSelectedValue={selected}
          onOk={handleOk}
          disabledDate={() => true}
        />
      );
      calendar.find('.rc-calendar-ok-btn').simulate('click');
      expect(handleOk).not.toBeCalled();
    });
  });

  it('today button', () => {
    const selected = dayjs().add(1, 'day').utcOffset(480);
    const calendar = mount(
      <Calendar defaultSelectedValue={selected} />
    );
    calendar.find('.rc-calendar-today-btn').simulate('click');
    expect(dayjs().isSame(calendar.state().selectedValue)).toBe(true);
  });
});
