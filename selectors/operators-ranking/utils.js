import moment from 'moment';

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
    startDate: start,
    endDate,
    trimEndDate,
    maxAbsoluteDate
  } = newParams;

  const end = endDate > maxAbsoluteDate ? maxAbsoluteDate : endDate;
  const trim = trimEndDate > maxAbsoluteDate ? maxAbsoluteDate : trimEndDate;

  return {
    ...newParams,
    ...(!!start && {
      startYear: moment(start).year(),
      startMonth: moment(start).month(),
      startDay: moment(start).dayOfYear()
    }),
    ...(!!endDate && {
      endYear: moment(end).year(),
      endMonth: moment(end).month(),
      endDay: moment(end).dayOfYear()
    }),
    ...(!!trimEndDate && {
      trimEndYear: moment(trim).year(),
      trimEndMonth: moment(trim).month(),
      trimEndDay: moment(trim).dayOfYear()
    })
  };
}
;
