import moment from 'moment';

export const currentDate = moment().date();
export const currentMonth = moment().month() + 1;
export const currentYear = moment().year();
export const nowTime = moment().format('HH:mm');
export const stringCurrentDate = String(currentDate).padStart(2, '0');
export const stringCurrentMonth = String(currentMonth).padStart(2, '0');

export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'M/D/YYYY',
  European: 'DD/MM/YYYY',
  Germany_Russia_etc: 'DD.MM.YYYY',
};

const defaultDisabledTime = {
  disabledHours() {
    return [];
  },
  disabledMinutes() {
    return [];
  },
  disabledSeconds() {
    return [];
  },
};

export function getTodayTime(value) {
  let today = moment();
  today = today.locale(value.locale()).utcOffset(value.utcOffset());
  return today;
}

export function getTitleString(value) {
  return value.format('LL');
}

export function getTodayTimeStr(value) {
  const today = getTodayTime(value);
  return getTitleString(today);
}

export function getMonthName(month) {
  const locale = month.locale();
  const localeData = month.localeData();
  return localeData[locale === 'zh-cn' ? 'months' : 'monthsShort'](month);
}

export function syncTime(from, to) {
  if (!moment.isMoment(from) || !moment.isMoment(to)) return;
  to = to.hour(from.hour());
  to = to.minute(from.minute());
  to = to.second(from.second());
  to = to.millisecond(from.millisecond());
}

export function getTimeConfig(value, disabledTime) {
  let disabledTimeConfig = disabledTime ? disabledTime(value) : {};
  disabledTimeConfig = {
    ...defaultDisabledTime,
    ...disabledTimeConfig,
  };
  return disabledTimeConfig;
}

export function isTimeValidByConfig(value, disabledTimeConfig) {
  let invalidTime = false;
  if (value) {
    const hour = value.hour();
    const minutes = value.minute();
    const seconds = value.second();
    const disabledHours = disabledTimeConfig.disabledHours();
    if (disabledHours.indexOf(hour) === -1) {
      const disabledMinutes = disabledTimeConfig.disabledMinutes(hour);
      if (disabledMinutes.indexOf(minutes) === -1) {
        const disabledSeconds = disabledTimeConfig.disabledSeconds(hour, minutes);
        invalidTime = disabledSeconds.indexOf(seconds) !== -1;
      } else {
        invalidTime = true;
      }
    } else {
      invalidTime = true;
    }
  }
  return !invalidTime;
}

export function isTimeValid(value, disabledTime) {
  const disabledTimeConfig = getTimeConfig(value, disabledTime);
  return isTimeValidByConfig(value, disabledTimeConfig);
}

export function isAllowedDate(value, disabledDate, disabledTime) {
  if (disabledDate) {
    if (disabledDate(value)) {
      return false;
    }
  }
  if (disabledTime) {
    if (!isTimeValid(value, disabledTime)) {
      return false;
    }
  }
  return true;
}

export function formatDate(value, format) {
  if (!value) {
    return '';
  }

  if (Array.isArray(format)) {
    format = format[0];
  }

  return value.format(format);
}

export function formatDateLocal(formatStr, format) {
  const str = formatStr || '';
  let cleanStr;
  switch (format) {
    case DATE_FORMATS.ISO:
      cleanStr = str.replace(/[^0-9]+/g, '-');
      return cleanStr.split('-').filter(Boolean).map(String);
    case DATE_FORMATS.US:
    case DATE_FORMATS.European:
      cleanStr = str.replace(/[^0-9]+/g, '/');
      return cleanStr.split('/').filter(Boolean).map(String);
    case DATE_FORMATS.Germany_Russia_etc:
      cleanStr = str.replace(/[^0-9]+/g, '.');
      return cleanStr.split('.').filter(Boolean).map(String);
    default:
      return [];
  }
}

export function hasSpecialChar(str) {
  const matches = str.match(/[^0-9]/g);
  return matches ? matches.length : 0;
}

export function isValidMonth(monthStr) {
  if (typeof monthStr === 'undefined' || monthStr === null) return currentMonth;
  if (!/^\d+$/.test(Number(monthStr))) return currentMonth;
  const month = Number(monthStr);
  if (month >= 1 && month <= 12) {
    return monthStr;
  }
  return currentMonth;
}

export function isValidDay(dayStr) {
  if (!/^\d+$/.test(dayStr)) return false;
  const day = Number(dayStr);
  if ([1, 3, 5, 7, 8, 10, 12].includes(currentMonth)) {
    return day >= 1 && day <= 31;
  }
  if ([4, 6, 9, 11].includes(currentMonth)) {
    return day >= 1 && day <= 30;
  }
  if (currentMonth === 2) {
    const isLeapYear = (year) => {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };
    const year = currentYear;
    if (isLeapYear(year)) {
      return day >= 1 && day <= 29;
    }
    return day >= 1 && day <= 28;
  }
}

export function fullValidYear(yearStr) {
  const year = yearStr;
  if (!year || isNaN(year)) return currentYear;
  if (year.length === 2) {
    if (Number(year) >= 0 && Number(year) < 69) {
      return year ? `20${year}` : currentYear;
    } else if (Number(year) >= 69 && Number(year) < 100) {
      return year ? `19${year}` : currentYear;
    }
  }
  if (year.length === 4) {
    return year;
  }
  return year ? year.padStart(4, '0') : currentYear;
}

export function getDateFormatByStr(str, format) {
  const cananderStr = str || '';
  const parts = cananderStr.split('/');
  if (parts.length !== 3) return format;
  const delimiter = format === DATE_FORMATS.European ? '/' : '.';
  if (format === DATE_FORMATS.ISO) {
    return DATE_FORMATS.ISO;
  }
  if (format === DATE_FORMATS.US) {
    return DATE_FORMATS.US;
  }
  if ((format === DATE_FORMATS.European) || (format === DATE_FORMATS.Germany_Russia_etc)) {
    const [day, month] = parts;
    const dayLen = day.length;
    const monthLen = month.length;
    if (dayLen === 2 && monthLen === 2) {
      return `DD${delimiter}MM${delimiter}YYYY`;
    } else if (dayLen === 2 && monthLen === 1) {
      return `DD${delimiter}M${delimiter}YYYY`;
    } else if (dayLen === 1 && monthLen === 2) {
      return `D${delimiter}MM${delimiter}YYYY`;
    } else if (dayLen === 1 && monthLen === 1) {
      return `D${delimiter}M${delimiter}YYYY`;
    }
  }
  return format;
}

export function isCurrentYear(year, month, day) {
  return (
    Number(month) >= 1 &&
    Number(month) <= 12 &&
    Number(day) >= 1 &&
    Number(day) <= 31
  )
    ? year
    : currentYear;
}

export function isShowTimePicker(cananderStr) {
  return `${cananderStr} `;
}
