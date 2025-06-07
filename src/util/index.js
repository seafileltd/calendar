import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
export const currentDate = dayjs().date();
export const currentMonth = dayjs().month() + 1;
export const currentYear = dayjs().year();
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
    format === DATE_FORMATS.Germany_Russia_etc) {
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
  if (format === DATE_FORMATS.EuropeanAndTime ||
    format === DATE_FORMATS.Germany_Russia_etcAndTime) {
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
  const trimmed = inputTime.trim();
  const timeRegex = /^(\d{2}):(\d{2})$/;
  const match = trimmed.match(timeRegex);
  if (!match) {
    return currentTime;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return currentTime;
  }
  return `${match[1]}:${match[2]}`;
}

export function checkSpecialBetweenDigits(str) {
  const regex = /^\d+[^0-9]\d+$/;
  return regex.test(str);
}

function getDatePart(str) {
  if (typeof str !== 'string') return '';
  const parts = str.trim().split(/\s+/);
  return parts[0];
}

export function normalizeDateInput(str, localeFormat, delimiter) {
  let day;
  let month;
  let year;
  let time = currentTime;
  const parts = formatDateLocal(str, localeFormat, DATE_FORMATS);
  if (localeFormat === DATE_FORMATS.ISO) {
    const hasSpecial = hasSpecialChar(str);
    const numStr = str.replace(/[^0-9]/g, '');
    if (numStr.length === 7) {
      year = numStr.slice(0, 4);
      month = numStr.slice(4, 6).padStart(2, '0');
      day = numStr.slice(6, 7).padStart(2, '0');
      if (!isValidDay(day)) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate}`;
      }
      return `${year}-${month}-${day}`;
    }
    if (hasSpecial) {
      year = fullValidYear(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
      if (month >= 1 && month <= 12) {
        if (isValidDay(day)) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        return `${year}-${String(month).padStart(2, '0')}-01`;
      }
      if ((month >= 13 || month < 1) && isNaN(day)) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate}`;
      }
      if ((month >= 13 || month < 1) && day) {
        return `${String(currentYear)}-${stringCurrentMonth}-${stringCurrentDate}`;
      }
      if (!month && !day) {
        return `${year}-01-01`;
      }
    }
    if (str.length >= 1 && str.length <= 8) {
      year = fullValidYear(str.slice(0, 4));
      month = str.slice(4, 6);
      day = Number(str.slice(6, 8));
      if (str.length === 5 && Number(month) < 1) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate} `;
      }
      if ((str.length === 6 && Number(month) < 1)) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate}`;
      }
      if ((str.length === 7)) {
        if (!isValidDay(day)) {
          return `${year}-${String(isValidMonth(month)).padStart(2, '0')}-${stringCurrentDate}`;
        }
        return `${year}-${String(isValidMonth(month)).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // eslint-disable-line max-len
      }
      if (str.length === 8) {
        if (!isValidDay(day)) {
          return `${isCurrentYear(year, month, day)}-${String(isValidMonth(month)).padStart(2, '0')}-${stringCurrentDate}`; // eslint-disable-line max-len
        }
        return `${isCurrentYear(year, month, day)}-${String(isValidMonth(month)).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // eslint-disable-line max-len
      }
      if (Number(month) >= 1 && Number(month) <= 12 && isValidDay(day)) {
        return `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      return `${year}-${month ? month.padStart(2, '0') : '01'}-${day ? String(day).padStart(2, '0') : '01'}`; // eslint-disable-line max-len
    }
    return `${currentYear}/${stringCurrentMonth}/${stringCurrentDate}`;
  }
  if (localeFormat === DATE_FORMATS.ISOAndTime) {
    const unNormalDate = getDatePart(str);
    const unNormalDateParts = formatDateLocal(unNormalDate, localeFormat, DATE_FORMATS);
    const hasSpecial = hasSpecialChar(unNormalDate);
    const numStr = unNormalDate.replace(/[^0-9]/g, '');
    if (numStr.length === 7) {
      year = numStr.slice(0, 4);
      month = numStr.slice(4, 6).padStart(2, '0');
      day = numStr.slice(6, 7).padStart(2, '0');
      if (parts.length === 3) {
        time = validateTime(`${parts[1]}:${parts[2]}`);
      }
      if (parts.length === 4) {
        time = validateTime(`${parts[2]}:${parts[3]}`);
      }
      if (parts.length === 5) {
        time = validateTime(`${parts[3]}:${parts[4]}`);
      }
      if (!isValidDay(day)) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate} ${time}`;
      }
      return `${year}-${month}-${day} ${time}`;
    }
    if (hasSpecial) {
      if (unNormalDateParts.length < 3) {
        parts.splice(2, 0, '1');
      }
      year = fullValidYear(parts[0]);
      month = Number(parts[1]);
      day = Number(parts[2]);
      time = validateTime(`${parts[3]}:${parts[4]}`);
      if (month >= 1 && month <= 12) {
        if (isValidDay(day)) {
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${time}`; // eslint-disable-line max-len
        }
        return `${year}-${String(month).padStart(2, '0')}-01 ${time}`;
      }
      if ((month >= 13 || month < 1) && isNaN(day)) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate} ${time}`; // eslint-disable-line max-len
      }
      if ((month >= 13 || month < 1) && day) {
        return `${String(currentYear)}-${stringCurrentMonth}-${stringCurrentDate} ${time}`; // eslint-disable-line max-len
      }
      if (!month && !day) {
        return `${year}-01-01 ${time}`;
      }
    }
    if (unNormalDate.length >= 1 && unNormalDate.length <= 8) {
      year = fullValidYear(unNormalDate.slice(0, 4));
      month = unNormalDate.slice(4, 6);
      day = Number(unNormalDate.slice(6, 8));
      const timeParts = formatDateLocal(str, localeFormat, DATE_FORMATS);
      time = validateTime(`${timeParts[1]}:${timeParts[2]}`);
      if (unNormalDate.length === 5 && Number(month) < 1) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate} ${time}`;
      }
      if ((unNormalDate.length === 6 && Number(month) < 1)) {
        return `${year}-${stringCurrentMonth}-${stringCurrentDate} ${time}`;
      }
      if ((unNormalDate.length === 7)) {
        if (!isValidDay(day)) {
          return `${year}-${String(isValidMonth(month)).padStart(2, '0')}-${stringCurrentDate} ${time}`; // eslint-disable-line max-len
        }
        return `${year}-${String(isValidMonth(month)).padStart(2, '0')}-${String(day).padStart(2, '0')} ${time}`; // eslint-disable-line max-len
      }
      if (unNormalDate.length === 8) {
        if (!isValidDay(day)) {
          return `${isCurrentYear(year, month, day)}-${String(isValidMonth(month)).padStart(2, '0')}-${stringCurrentDate} ${time}`; // eslint-disable-line max-len
        }
        return `${isCurrentYear(year, month, day)}-${String(isValidMonth(month)).padStart(2, '0')}-${String(day).padStart(2, '0')} ${time}`; // eslint-disable-line max-len
      }
      if (Number(month) >= 1 && Number(month) <= 12 && isValidDay(day)) {
        return `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')} ${time}`;
      }
      return `${year}-${month ? month.padStart(2, '0') : '01'}-${day ? String(day).padStart(2, '0') : '01'} ${time}`; // eslint-disable-line max-len
    }
    return `${currentYear}/${stringCurrentMonth}/${stringCurrentDate} ${time}`;
  }
  if (localeFormat === DATE_FORMATS.US) {
    const hasSpecial = hasSpecialChar(str);
    if (hasSpecial) {
      month = Number(parts[0]);
      day = Number(parts[1]);
      year = fullValidYear(parts[2]);
      if (month >= 1 && month <= 12 && isValidDay(day)) {
        return `${month}/${day}/${year}`;
      }
      return `${currentMonth}/${currentDate}/${currentYear}`;
    }
    if (str.length >= 1 && str.length <= 8) {
      month = Number(str.slice(0, 2));
      day = Number(str.slice(2, 4));
      year = fullValidYear(str.slice(4, str.length));
      if (month >= 1 && month <= 12) {
        if (isValidDay(day)) {
          return `${month}/${day}/${year}`;
        }
        if (!day) {
          return `${month}/1/${year}`;
        }
        return `${currentMonth}/${currentDate}/${currentYear}`;
      }
    }
    return `${currentMonth}/${currentDate}/${currentYear}`;
  }
  if (localeFormat === DATE_FORMATS.USAndTime) {
    const unNormalDate = getDatePart(str);
    const unNormalDateParts = formatDateLocal(unNormalDate, localeFormat, DATE_FORMATS);
    const hasSpecial = hasSpecialChar(unNormalDate);
    if (hasSpecial) {
      if (unNormalDateParts.length < 3) {
        parts.splice(2, 0, String(currentYear));
      }
      month = Number(parts[0]);
      day = Number(parts[1]);
      year = fullValidYear(parts[2]);
      time = validateTime(`${parts[3]}:${parts[4]}`);
      if (month >= 1 && month <= 12 && isValidDay(day)) {
        return `${month}/${day}/${year} ${time}`;
      }
      return `${currentMonth}/${currentDate}/${currentYear} ${time}`;
    }
    if (unNormalDate.length >= 1 && unNormalDate.length <= 8) {
      month = Number(unNormalDate.slice(0, 2));
      day = Number(unNormalDate.slice(2, 4));
      year = fullValidYear(unNormalDate.slice(4, unNormalDate.length));
      const timeParts = formatDateLocal(str, localeFormat, DATE_FORMATS);
      time = validateTime(`${timeParts[1]}:${timeParts[2]}`);
      if (month >= 1 && month <= 12) {
        if (isValidDay(day)) {
          return `${month}/${day}/${year} ${time}`;
        }
        if (!day) {
          return `${month}/1/${year} ${time}`;
        }
        return `${currentMonth}/${currentDate}/${currentYear} ${time}`;
      }
    }
    return `${currentMonth}/${currentDate}/${currentYear} ${time}`;
  }
  if (localeFormat === DATE_FORMATS.European ||
    localeFormat === DATE_FORMATS.Germany_Russia_etc) {
    const hasSpecial = hasSpecialChar(str);
    if (hasSpecial) {
      day = parts[0];
      month = parts[1];
      year = fullValidYear(parts[2]);
      if (isValidDay(day) && Number(month) >= 1 && Number(month) <= 12) {
        return `${Number(day)}${delimiter}${Number(month)}${delimiter}${year}`;
      }
      return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear}`;
    }
    if (str.length >= 1 && str.length <= 8) {
      day = Number(str.slice(0, 2));
      const monthStr = str.slice(2, 4);
      month = isValidMonth(monthStr);
      const yearStr = str.slice(4, str.length);
      year = fullValidYear(yearStr);

      if (isValidDay(day)) {
        if (Number(monthStr) < 1 && Number(monthStr) > 12) {
          return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear}`;
        }
        return `${Number(day)}${delimiter}${Number(month)}${delimiter}${year}`;
      }
    }
    return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear}`;
  }
  if (localeFormat === DATE_FORMATS.EuropeanAndTime ||
    localeFormat === DATE_FORMATS.Germany_Russia_etcAndTime) {
    const unNormalDate = getDatePart(str);
    const unNormalDateParts = formatDateLocal(unNormalDate, localeFormat, DATE_FORMATS);
    const hasSpecial = hasSpecialChar(unNormalDate);
    if (hasSpecial) {
      if (unNormalDateParts.length < 3) {
        parts.splice(2, 0, String(currentYear));
      }
      day = parts[0];
      month = parts[1];
      year = fullValidYear(parts[2]);
      time = validateTime(`${parts[3]}:${parts[4]}`);
      if (isValidDay(day) && Number(month) >= 1 && Number(month) <= 12) {
        return `${Number(day)}${delimiter}${Number(month)}${delimiter}${year} ${time}`;
      }
      return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear} ${time}`;
    }
    if (unNormalDate.length >= 1 && unNormalDate.length <= 8) {
      day = Number(unNormalDate.slice(0, 2));
      const monthStr = unNormalDate.slice(2, 4);
      month = isValidMonth(monthStr);
      const yearStr = unNormalDate.slice(4, unNormalDate.length);
      year = fullValidYear(yearStr);
      const timeParts = formatDateLocal(str, localeFormat, DATE_FORMATS);
      time = validateTime(`${timeParts[1]}:${timeParts[2]}`);
      if (isValidDay(day)) {
        if (Number(monthStr) < 1 && Number(monthStr) > 12) {
          return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear} ${time}`;
        }
        return `${Number(day)}${delimiter}${Number(month)}${delimiter}${year} ${time}`;
      }
    }
    return `${currentDate}${delimiter}${currentMonth}${delimiter}${currentYear} ${time}`;
  }
}
