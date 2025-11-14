import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import utc from 'dayjs/plugin/utc';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import badMutable from 'dayjs/plugin/badMutable';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en-gb';

dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(utc);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(badMutable);
export default dayjs;
