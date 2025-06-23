import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
export const getCurrentDate = () => dayjs().date();
export const getCurrentMonth = () => dayjs().month() + 1;
export const getCurrentYear = () => dayjs().year();
export const getCurrentTime = () => dayjs().format('HH:mm');

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

export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export function validateCalendarDay(dayStr) {
  if (!/^\d+$/.test(dayStr)) return false;
  const day = Number(dayStr);
  const MONTHS_WITH_31_DAYS = [1, 3, 5, 7, 8, 10, 12];
  const MONTHS_WITH_30_DAYS = [4, 6, 9, 11];
  if (MONTHS_WITH_31_DAYS.includes(getCurrentMonth())) {
    return day >= 1 && day <= 31;
  }
  if (MONTHS_WITH_30_DAYS.includes(getCurrentMonth())) {
    return day >= 1 && day <= 30;
  }
  if (getCurrentMonth() === 2) {
    const year = getCurrentYear();
    if (isLeapYear(year)) {
      return day >= 1 && day <= 29;
    }
    return day >= 1 && day <= 28;
  }
}

export function tokenizeFormattedDate(formatStr, format) {
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

export function validateTime(inputTime) {
  if (!inputTime || typeof inputTime !== 'string') {
    return getCurrentTime();
  }
  const trimmed = inputTime.trim();
  const timeRegex = /^(\d{2}):(\d{2})$/;
  const match = trimmed.match(timeRegex);
  if (!match) {
    return getCurrentTime();
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return getCurrentTime();
  }
  return `${match[1]}:${match[2]}`;
}

export function delimate(format) {
  let delimiter;
  if (format === DATE_FORMATS.Germany_Russia_etc ||
        format === DATE_FORMATS.Germany_Russia_etcAndTime) {
    delimiter = '.';
  } else if (format === DATE_FORMATS.ISO || format === DATE_FORMATS.ISOAndTime) {
    delimiter = '-';
  } else {
    delimiter = '/';
  }
  return delimiter;
}

export function validateCalendarYear(yearStr) {
  const year = yearStr;
  if (!year || isNaN(year)) return getCurrentYear();
  if (year.length === 2) {
    if (Number(year) >= 0 && Number(year) < 69) {
      return year ? `20${year}` : getCurrentYear();
    } else if (Number(year) >= 69 && Number(year) < 100) {
      return year ? `19${year}` : getCurrentYear();
    }
  }
  if (year.length === 4) {
    return year;
  }
  return year ? year.padStart(4, '0') : getCurrentYear();
}

export function validateAndNormalizeDate(dayStr, monthStr, yearStr) {
  let day = Number(dayStr);
  let month = Number(monthStr);
  let year = yearStr;
  const isInThirtyOneDaysMonths = [1, 3, 5, 7, 8, 10, 12].includes(month);
  const isInThirtyDaysMonths = [4, 6, 9, 11].includes(month);
  const isValidDayThirtyOne = day < 1 || day > 31;
  const isValidDayThirty = day < 1 || day > 30;
  const isValidDayTwentyNight = day < 1 || day > 29;
  const isValidDayTwentyEight = day < 1 || day > 28;

  if (month > 12 || month < 0 || !month) {
    day = getCurrentDate();
    month = getCurrentMonth();
    year = getCurrentYear();
  }

  if ((isInThirtyOneDaysMonths && isValidDayThirtyOne)
    || (isInThirtyDaysMonths && isValidDayThirty)) {
    day = getCurrentDate();
    month = getCurrentMonth();
    year = getCurrentYear();
  }

  if (month === 2) {
    if (isLeapYear(year) && isValidDayTwentyNight) {
      day = getCurrentDate();
      month = getCurrentMonth();
      year = getCurrentYear();
    } else if (isValidDayTwentyEight) {
      day = getCurrentDate();
      month = getCurrentMonth();
      year = getCurrentYear();
    }
  }
  return { day, month, year };
}

export function getDatePart(str) {
  if (typeof str !== 'string') return '';
  const parts = str.trim().split(/\s+/);
  return parts[0];
}

export function initializeStr(str, format) {
  const inputStr = str;
  const inputStrLength = inputStr.length;
  let time = getCurrentTime();
  const hasSpecial = hasSpecialChar(inputStr);
  const formattedArray = tokenizeFormattedDate(inputStr, format);
  const dateDelimater = delimate(format);
  if (format === DATE_FORMATS.ISO) {
    const numStr = inputStr.replace(/[^0-9]/g, '');
    if (numStr.length === 7 || numStr.length === 8) {
      const yearStr = numStr.slice(0, 4);
      const monthStr = numStr.slice(4, 6) || '01';
      const dateStr = numStr.slice(6, numStr.length) || '01';
      const validateYear = validateCalendarYear(yearStr);
      let { day, month } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      const { year } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${year}${dateDelimater}${month}${dateDelimater}${day}`;
    }
    if (hasSpecial) {
      const validateYear = validateCalendarYear(formattedArray[0]);
      let { day, month } = validateAndNormalizeDate(formattedArray[2] || '01', formattedArray[1] || '01', validateYear); // eslint-disable-line max-len
      const { year } = validateAndNormalizeDate(formattedArray[2] || '01', formattedArray[1] || '01', validateYear); // eslint-disable-line max-len
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${year}${dateDelimater}${month}${dateDelimater}${day}`;
    } else if (inputStrLength >= 1 && inputStrLength <= 8) {
      const yearStr = inputStr.slice(0, 4);
      const monthStr = inputStr.slice(4, 6) || '01';
      const dateStr = inputStr.slice(6, 8) || '01';
      const validateYear = validateCalendarYear(yearStr);
      let { day, month } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      const { year } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${year}${dateDelimater}${month}${dateDelimater}${day}`;
    } else if (inputStrLength > 8) {
      return `${getCurrentYear()}${dateDelimater}${String(getCurrentMonth()).padStart(2, 0)}${dateDelimater}${String(getCurrentDate()).padStart(2, 0)}`; // eslint-disable-line max-len
    }
  } else if (format === DATE_FORMATS.ISOAndTime) {
    const datePart = getDatePart(inputStr);
    const formattedDateArray = tokenizeFormattedDate(datePart, format);
    const isDateSpecial = hasSpecialChar(datePart);
    const numStr = datePart.replace(/[^0-9]/g, '');
    if (numStr.length === 7 || numStr.length === 8) {
      const yearStr = numStr.slice(0, 4);
      const monthStr = numStr.slice(4, 6) || '01';
      const dateStr = numStr.slice(6, numStr.length) || '01';
      if (formattedArray.length === 3) {
        time = validateTime(`${formattedArray[1]}:${formattedArray[2]}`);
      }
      if (formattedArray.length === 4) {
        time = validateTime(`${formattedArray[2]}:${formattedArray[3]}`);
      }
      if (formattedArray.length === 5) {
        time = validateTime(`${formattedArray[3]}:${formattedArray[4]}`);
      }
      const validateYear = validateCalendarYear(yearStr);
      let { day, month } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      const { year } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${year}${dateDelimater}${month}${dateDelimater}${day} ${time}`;
    }
    if (isDateSpecial) {
      if (formattedDateArray.length < 3) {
        formattedArray.splice(2, 0, '01');
      }
      const validateYear = validateCalendarYear(formattedArray[0]);
      let { day, month } = validateAndNormalizeDate(formattedArray[2] || '01', formattedArray[1] || '01', validateYear); // eslint-disable-line max-len
      const { year } = validateAndNormalizeDate(formattedArray[2] || '01', formattedArray[1] || '01', validateYear); // eslint-disable-line max-len
      time = validateTime(`${formattedArray[3]}:${formattedArray[4]}`);
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${year}${dateDelimater}${month}${dateDelimater}${day} ${time}`;
    } else if (datePart.length >= 1 && datePart.length <= 8) {
      const yearStr = datePart.slice(0, 4);
      const monthStr = datePart.slice(4, 6) || '01';
      const dateStr = datePart.slice(6, 8) || '01';
      const timeParts = tokenizeFormattedDate(inputStr, format);
      time = validateTime(`${timeParts[1]}:${timeParts[2]}`);
      const validateYear = validateCalendarYear(yearStr);
      let { day, month } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      const { year } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${year}${dateDelimater}${month}${dateDelimater}${day} ${time}`;
    } else if (datePart.length > 8) {
      return `${getCurrentYear()}${dateDelimater}${String(getCurrentMonth()).padStart(2, 0)}${dateDelimater}${String(getCurrentDate()).padStart(2, 0)}  ${getCurrentTime()}`; // eslint-disable-line max-len
    }
  } else if (format === DATE_FORMATS.US) {
    if (hasSpecial) {
      const validateYear = validateCalendarYear(formattedArray[2]);
      const { day, month, year } = validateAndNormalizeDate(formattedArray[1] || '1', formattedArray[0], validateYear); // eslint-disable-line max-len
      return `${month}${dateDelimater}${day}${dateDelimater}${year}`;
    } else if (inputStrLength >= 1 && inputStrLength <= 8) {
      const monthStr = inputStr.slice(0, 2);
      const dateStr = inputStr.slice(2, 4) || '1';
      const yearStr = inputStr.slice(4, inputStr.length);
      const validateYear = validateCalendarYear(yearStr);
      const { day, month, year } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      return `${month}${dateDelimater}${day}${dateDelimater}${year}`; // eslint-disable-line max-len
    } else if (inputStrLength > 8) {
      return `${String(getCurrentMonth()).padStart(2, 0)}${dateDelimater}${String(getCurrentDate()).padStart(2, 0)}${dateDelimater}${getCurrentYear()}`; // eslint-disable-line max-len
    }
  } else if (format === DATE_FORMATS.USAndTime) {
    const datePart = getDatePart(inputStr);
    const formattedDateArray = tokenizeFormattedDate(datePart, format);
    const isDateSpecial = hasSpecialChar(datePart);
    if (isDateSpecial) {
      if (formattedDateArray.length < 3) {
        formattedArray.splice(2, 0, String(getCurrentYear()));
      }
      const validateYear = validateCalendarYear(formattedArray[2]);
      const { day, month, year } = validateAndNormalizeDate(formattedArray[1] || '1', formattedArray[0], validateYear); // eslint-disable-line max-len
      time = validateTime(`${formattedArray[3]}:${formattedArray[4]}`);
      return `${month}${dateDelimater}${day}${dateDelimater}${year} ${time}`;
    } else if (datePart.length >= 1 && datePart.length <= 8) {
      const monthStr = datePart.slice(0, 2);
      const dateStr = datePart.slice(2, 4) || '1';
      const yearStr = datePart.slice(4, datePart.length);
      const validateYear = validateCalendarYear(yearStr); // eslint-disable-line max-len
      const { day, month, year } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      const timeParts = tokenizeFormattedDate(inputStr, format);
      time = validateTime(`${timeParts[1]}:${timeParts[2]}`) || getCurrentTime();
      return `${month}${dateDelimater}${day}${dateDelimater}${year} ${time}`;
    } else if (datePart.length > 8) {
      return `${String(getCurrentMonth()).padStart(2, 0)}${dateDelimater}${String(getCurrentDate()).padStart(2, 0)}${dateDelimater}${getCurrentYear()} ${getCurrentTime()}`; // eslint-disable-line max-len
    }
  } else if (format === DATE_FORMATS.European
    || format === DATE_FORMATS.Germany_Russia_etc
  ) {
    if (hasSpecial) {
      const validateYear = validateCalendarYear(formattedArray[2]);
      let { day, month } = validateAndNormalizeDate(formattedArray[0], formattedArray[1], validateYear); // eslint-disable-line max-len
      const { year } = validateAndNormalizeDate(formattedArray[0], formattedArray[1], validateYear); // eslint-disable-line max-len
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${day}${dateDelimater}${month}${dateDelimater}${year}`;
    } else if (inputStrLength >= 1 && inputStrLength <= 8) {
      const dateStr = inputStr.slice(0, 2);
      const monthStr = inputStr.slice(2, 4) || getCurrentMonth();
      const yearStr = inputStr.slice(4, inputStr.length);
      const validateYear = validateCalendarYear(yearStr);
      const { year } = validateAndNormalizeDate(dateStr, monthStr, validateYear); // eslint-disable-line max-len
      let { day, month } = validateAndNormalizeDate(dateStr, monthStr, validateYear); // eslint-disable-line max-len
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${day}${dateDelimater}${month}${dateDelimater}${year}`;
    } else if (inputStrLength > 8) {
      return `${String(getCurrentDate()).padStart(2, 0)}${dateDelimater}${String(getCurrentMonth()).padStart(2, 0)}${dateDelimater}${getCurrentYear()}`; // eslint-disable-line max-len
    }
  } else if (format === DATE_FORMATS.EuropeanAndTime
    || format === DATE_FORMATS.Germany_Russia_etcAndTime
  ) {
    const datePart = getDatePart(inputStr);
    const formattedDateArray = tokenizeFormattedDate(datePart, format);
    const isDateSpecial = hasSpecialChar(datePart);
    if (isDateSpecial) {
      if (formattedDateArray.length < 3) {
        formattedArray.splice(2, 0, String(getCurrentYear()));
      }
      const validateYear = validateCalendarYear(formattedArray[2]);
      let { day, month } = validateAndNormalizeDate(formattedArray[0], formattedArray[1], validateYear); // eslint-disable-line max-len
      const { year } = validateAndNormalizeDate(formattedArray[0], formattedArray[1], validateYear); // eslint-disable-line max-len
      time = validateTime(`${formattedArray[3]}:${formattedArray[4]}`);
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${day}${dateDelimater}${month}${dateDelimater}${year} ${time}`;
    } else if (datePart.length >= 1 && datePart.length <= 8) {
      const dateStr = datePart.slice(0, 2);
      const monthStr = datePart.slice(2, 4) || getCurrentMonth();
      const yearStr = datePart.slice(4, datePart.length);
      const timeParts = tokenizeFormattedDate(inputStr, format);
      time = validateTime(`${timeParts[1]}:${timeParts[2]}`);
      const validateYear = validateCalendarYear(yearStr);
      let { day, month } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      const { year } = validateAndNormalizeDate(dateStr, monthStr, validateYear);
      day = String(day).padStart(2, 0);
      month = String(month).padStart(2, 0);
      return `${day}${dateDelimater}${month}${dateDelimater}${year} ${time}`;
    } else if (datePart.length > 8) {
      return `${String(getCurrentDate()).padStart(2, 0)}${dateDelimater}${String(getCurrentMonth()).padStart(2, 0)}${dateDelimater}${getCurrentYear()} ${getCurrentTime()}`; // eslint-disable-line max-len
    }
  }
}
