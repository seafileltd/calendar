import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
export const currentDate = dayjs().date();
export const currentMonth = dayjs().month() + 1;
export const currentYear = dayjs().year();
export const nowTime = dayjs().format('HH:mm');
export const stringCurrentDate = String(currentDate).padStart(2, '0');
export const stringCurrentMonth = String(currentMonth).padStart(2, '0');
export const currentTime = dayjs().format('HH:mm');

export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  ISOAndTime: 'YYYY-MM-DD HH:mm',
  US: 'M/D/YYYY',
  USAndTime: 'M/D/YYYY HH:mm',
  European: 'DD/MM/YYYY',
  EuropeanAndTime: 'DD/MM/YYYY HH:mm',
  Germany_Russia_etc: 'DD.MM.YYYY',
  Germany_Russia_etcAndTime: 'DD.MM.YYYY HH:mm',
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
  let today = dayjs();
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
  if (!dayjs.isDayjs(from) || !dayjs.isDayjs(to)) return;
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
    case DATE_FORMATS.ISOAndTime:
      cleanStr = str.replace(/[^0-9]+/g, '-');
      return cleanStr.split('-').filter(Boolean).map(String);
    case DATE_FORMATS.US:
    case DATE_FORMATS.USAndTime:
    case DATE_FORMATS.European:
    case DATE_FORMATS.EuropeanAndTime:
      cleanStr = str.replace(/[^0-9]+/g, '/');
      return cleanStr.split('/').filter(Boolean).map(String);
    case DATE_FORMATS.Germany_Russia_etc:
    case DATE_FORMATS.Germany_Russia_etcAndTime:
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
  return (year) ? year.padStart(4, '0') : currentYear;
}

export function delimate(formatPrefix) {
  let delimiter;
  if (formatPrefix === DATE_FORMATS.Germany_Russia_etc ||
        formatPrefix === DATE_FORMATS.Germany_Russia_etcAndTime) {
    delimiter = '.';
  } else if (formatPrefix === DATE_FORMATS.ISO || formatPrefix === DATE_FORMATS.ISOAndTime) {
    delimiter = '-';
  } else {
    delimiter = '/';
  }
  return delimiter;
}

export function getDateFormatByStr(str, format) {
  const cananderStr = str || '';
  const delimiter = delimate(format);
  const parts = cananderStr.split(delimiter);
  if (parts.length !== 3) return format;
  if (format === DATE_FORMATS.ISO) {
    return DATE_FORMATS.ISO;
  }
  if (format === DATE_FORMATS.ISOAndTime) {
    return DATE_FORMATS.ISOAndTime;
  }
  if (format === DATE_FORMATS.US) {
    return DATE_FORMATS.US;
  }
  if (format === DATE_FORMATS.USAndTime) {
    return DATE_FORMATS.USAndTime;
  }
  if (format === DATE_FORMATS.European ||
    format === DATE_FORMATS.Germany_Russia_etc ||
    format === DATE_FORMATS.Germany_Russia_etcAndTime ||
    format === DATE_FORMATS.EuropeanAndTime) {
    const [day, month] = parts;
    const dayLen = day.length;
    const monthLen = month.length;
    if (dayLen === 2 && monthLen === 2) {
      return `DD${delimiter}MM${delimiter}YYYY HH:mm`;
    } else if (dayLen === 2 && monthLen === 1) {
      return `DD${delimiter}M${delimiter}YYYY HH:mm`;
    } else if (dayLen === 1 && monthLen === 2) {
      return `D${delimiter}MM${delimiter}YYYY HH:mm`;
    } else if (dayLen === 1 && monthLen === 1) {
      return `D${delimiter}M${delimiter}YYYY HH:mm`;
    }
  }
  return format;
}

export function isCurrentYear(year, month, day) {
  return (Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= 31) ? year : currentYear; // eslint-disable-line max-len
}

export function validateTime(inputTime) {
  if (!inputTime || typeof inputTime !== 'string') {
    return currentTime;
  }
  const trimmedInput = inputTime.trim();
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

  if (!timeRegex.test(trimmedInput)) {
    return currentTime;
  }
  const [hours, minutes] = trimmedInput.split(':').map(Number);
  const parsedTime = dayjs().hour(hours).minute(minutes);
  if (!parsedTime.isValid()) {
    return currentTime;
  }
  return parsedTime.format('HH:mm');
}
