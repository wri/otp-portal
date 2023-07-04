import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
export const dateDiffInDays = (startDate, endDate) => {
  const a = new Date(endDate);
  const b = new Date(startDate);
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
};

export const getDayRange = (params = {}) => {
  const { startDate, endDate, minDate, minDataDate, maxDate } = params || {};
  const min = minDataDate < minDate ? minDataDate : minDate;

  if (!startDate || !endDate || !min || !maxDate) return null;

  const minDateTime = new Date(min);
  const maxDateTime = new Date(maxDate);
  const numberOfDays = dateDiffInDays(maxDateTime, minDateTime);

  // timeline or hover effect active range
  const startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);
  const activeStartDay = numberOfDays - dateDiffInDays(maxDateTime, startDateTime);
  const activeEndDay = numberOfDays - dateDiffInDays(maxDateTime, endDateTime);

  // get start and end day
  const startDayIndex = activeStartDay || 0;
  const endDayIndex = activeEndDay || numberOfDays;

  return {
    startDayIndex,
    endDayIndex,
    numberOfDays
  };
};

export const getParams = (config = [], params = {}) => {
  const defaultParams = config.reduce((acc, v) => {
    const key = v.key;
    const value = v.default;

    return {
      ...acc,
      [key]: value
    };
  }, {});

  const newParams = {
    ...defaultParams,
    ...params
  };

  const {
    startDate,
    endDate,
    trimEndDate,
    maxAbsoluteDate
  } = newParams;

  const start = startDate;
  const end = endDate > maxAbsoluteDate ? maxAbsoluteDate : endDate;
  const trim = trimEndDate > maxAbsoluteDate ? maxAbsoluteDate : trimEndDate;

  return {
    ...newParams,
    ...(!!start && {
      startYear: dayjs(start).year(),
      startMonth: dayjs(start).month(),
      startDay: dayjs(start).dayOfYear()
    }),
    ...(!!endDate && {
      endYear: dayjs(end).year(),
      endMonth: dayjs(end).month(),
      endDay: dayjs(end).dayOfYear()
    }),
    ...(!!trimEndDate && {
      trimEndYear: dayjs(trim).year(),
      trimEndMonth: dayjs(trim).month(),
      trimEndDay: dayjs(trim).dayOfYear()
    }),
    ...getDayRange(newParams)
  };
}
;
