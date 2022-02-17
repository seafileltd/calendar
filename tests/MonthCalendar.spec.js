/* eslint-disable no-undef */
import React from 'react';
import { mount } from 'enzyme';
import keyCode from 'rc-util/lib/KeyCode';
import dayjs from 'dayjs';
import MonthCalendar from '../src/MonthCalendar';

import localeData from 'dayjs/plugin/localeData';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en-gb';
dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

describe('MonthCalendar', () => {
  it('year or decade panel work correctly', () => {
    const format = 'YYYY-MM';
    const wrapper = mount(<MonthCalendar />);
    wrapper.find('.rc-calendar-month-panel-year-select').simulate('click');
    wrapper.find('.rc-calendar-year-panel-decade-select').simulate('click');
    wrapper.find('.rc-calendar-decade-panel-selected-cell').simulate('click');
    wrapper.find('.rc-calendar-year-panel-selected-cell').simulate('click');
    wrapper.find('.rc-calendar-month-panel-selected-cell').simulate('click');
    expect(wrapper.state('selectedValue').format(format)).toBe('2010-03');
  });
  describe('keyboard', () => {
    let wrapper;
    beforeEach(() => {
      const selected = dayjs().add(2, 'month');
      wrapper = mount(<MonthCalendar defaultValue={selected} />);
    });

    it('enter to select works', () => {
      const onSelect = jest.fn();
      wrapper = mount(<MonthCalendar onSelect={onSelect} />);
      wrapper.simulate('keydown', {
        keyCode: keyCode.ENTER,
      });
      expect(onSelect).toHaveBeenCalledWith(wrapper.state('value'), undefined);
    });

    it('enter not to select disabled month', () => {
      const onSelect = jest.fn();
      function disabledDate(current) {
        if (!current) {
          return false;
        }
        const date = dayjs();
        return current.month() < date.month();
      }

      wrapper = mount(<MonthCalendar onSelect={onSelect} disabledDate={disabledDate} />);
      wrapper.simulate('keydown', {
        keyCode: keyCode.LEFT,
      });
      wrapper.simulate('keydown', {
        keyCode: keyCode.ENTER,
      });
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('DOWN', () => {
      wrapper.simulate('keydown', {
        keyCode: keyCode.DOWN,
      });
      expect(wrapper.state().value.month()).toBe(7);
    });

    it('UP', () => {
      wrapper.simulate('keydown', {
        keyCode: keyCode.UP,
      });
      expect(wrapper.state().value.month()).toBe(1);
    });

    it('LEFT', () => {
      wrapper.simulate('keydown', {
        keyCode: keyCode.LEFT,
      });
      expect(wrapper.state().value.month()).toBe(3);
    });

    it('RIGHT', () => {
      wrapper.simulate('keydown', {
        keyCode: keyCode.RIGHT,
      });
      expect(wrapper.state().value.month()).toBe(5);
    });

    it('CTRL + LEFT', () => {
      wrapper.simulate('keydown', {
        keyCode: keyCode.LEFT,
        ctrlKey: 1,
      });
      expect(wrapper.state().value.month()).toBe(4);
      expect(wrapper.state().value.year()).toBe(2016);
      const selectedYear = wrapper.find('.rc-calendar-month-panel-year-select-content');
      expect(selectedYear.at(0).text()).toBe('2016');
    });

    it('CTRL + RIGHT', () => {
      wrapper.simulate('keydown', {
        keyCode: keyCode.RIGHT,
        ctrlKey: 1,
      });
      expect(wrapper.state().value.month()).toBe(4);
      expect(wrapper.state().value.year()).toBe(2018);
      const selectedYear = wrapper.find('.rc-calendar-month-panel-year-select-content');
      expect(selectedYear.at(0).text()).toBe('2018');
    });

    it('ignore other keys', () => {
      wrapper.simulate('keydown', {
        keyCode: keyCode.A,
      });
      expect(wrapper.state().value.month()).toBe(4);
      expect(wrapper.state().value.year()).toBe(2017);
      const selectedYear = wrapper.find('.rc-calendar-month-panel-year-select-content');
      expect(selectedYear.at(0).text()).toBe('2017');
    });
  });

  it('controlled value should work', () => {
    const wrapper = mount(<MonthCalendar value={dayjs('2000-01-01 00:00:00')} />);
    expect(wrapper.state().value.format('YYYY-MM-DD')).toBe('2000-01-01');

    wrapper.setProps({ value: dayjs('2049-09-03 00:00:00') });
    expect(wrapper.state().value.format('YYYY-MM-DD')).toBe('2049-09-03');
  });
});
