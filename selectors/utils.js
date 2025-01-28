import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { isEmpty } from 'utils/general';

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

export function getLayerId(layer) {
  const { id, config, interactionConfig } = layer;
  if (isEmpty(config) || isEmpty(interactionConfig)) return null;

  const { render = {} } = config;
  const { layers } = render;
  if (!layers) return null;

  return layers.map((l, i) => {
    const {
      id: vectorLayerId,
      type: vectorLayerType
    } = l;

    return vectorLayerId || `${id}-${vectorLayerType}-${i}`;
  });
}

export function getActiveInteractiveLayersSelector(layers, interactions) {
  if (!layers || isEmpty(interactions)) return [];

  const allLayers = uniqBy(layers, 'id');

  const interactiveLayerKeys = Object.keys(interactions);
  const interactiveLayers = allLayers.filter(l => interactiveLayerKeys.includes(l.id));

  return interactiveLayers.map(l => ({ ...l, data: interactions[l.id] }));
}

export function getPopupSelector(latlng) {
  if (isEmpty(latlng) || !latlng.lat || !latlng.lng) {
    return {};
  }

  const popup = {
    latitude: latlng.lat,
    longitude: latlng.lng
  };

  return popup;
}
