import moment from 'moment';
import localeData from 'moment/plugin/localeData';
import weekOfYear from 'moment/plugin/weekOfYear';
import utc from 'moment/plugin/utc';
import advancedFormat from 'moment/plugin/advancedFormat';
import customParseFormat from 'moment/plugin/customParseFormat';
import badMutable from 'moment/plugin/badMutable';
import 'moment/locale/zh-cn';
import 'moment/locale/en-gb';

moment.extend(localeData);
moment.extend(weekOfYear);
moment.extend(utc);
moment.extend(advancedFormat);
moment.extend(customParseFormat);
moment.extend(badMutable);
export default moment;
