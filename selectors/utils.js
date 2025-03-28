import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { isEmpty } from 'utils/general';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';

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

export function getInteractiveLayersIds(layer) {
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

export function getLegendLayersSelector(layers, layersSettings, layersActive, intl) {
  if (!layers) return [];
  const legendLayers = layers.filter(l => l.legendConfig && !isEmpty(l.legendConfig));

  const layerGroups = [];

  layersActive.forEach((lid) => {
    const layer = legendLayers.find(r => r.id === lid);
    if (!layer) return false;

    const { id, name, description, metadata, legendConfig, paramsConfig, decodeConfig, timelineConfig } = layer;

    const lSettings = layersSettings[id] || {};

    const params = (!!paramsConfig) && getParams(paramsConfig, lSettings.params);
    const decodeParams = (!!decodeConfig) && getParams(decodeConfig, { ...timelineConfig, ...lSettings.decodeParams });

    layerGroups.push({
      id,
      dataset: id,
      name: intl.formatMessage({ id: name || '-' }) + (metadata && metadata.dateOfContent ? ` (${metadata.dateOfContent})` : ''),
      description,
      metadata,
      layers: [{
        ...layer,
        name: intl.formatMessage({ id: name || '-' }) + (metadata && metadata.dateOfContent ? ` (${metadata.dateOfContent})` : ''),
        opacity: 1,
        active: true,
        legendConfig: {
          ...legendConfig,
          ...(legendConfig.items && {
            items: sortBy(legendConfig.items.map(i => ({
              ...i,
              ...(i.name && { name: intl.formatMessage({ id: i.name || '-' }) }),
              ...(i.items && {
                items: i.items.map(ii => ({
                  ...ii,
                  ...(ii.name && { name: intl.formatMessage({ id: ii.name || '-' }) })
                }))
              })
            })), 'name')
          })
        },
        ...lSettings,
        ...(!!paramsConfig && {
          params
        }),

        ...(!!decodeConfig && {
          decodeParams
        }),

        ...(!!timelineConfig && {
          timelineParams: {
            ...timelineConfig,
            ...getParams(paramsConfig, lSettings.params),
            ...getParams(decodeConfig, lSettings.decodeParams),
            ...lSettings.timelineParams
          }
        })
      }],
      visibility: true,
      ...lSettings
    });
  });

  return layerGroups;
}
