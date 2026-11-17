import { LAYERS } from 'constants/layers';
import { getInteractiveLayersIds, getParams } from 'components/map/layers';

// ISO codes of the countries the ranking filter selects, or all of them with no country filter
export const getActiveCountryIsos = (countryOptions, activeCountries) => countryOptions
  .filter((c) => !activeCountries || !activeCountries.length || activeCountries.includes(c.value))
  .map((c) => c.iso);

// Map layers for the active layer ids, restricted to the selected countries
export const buildRankingLayers = (layersActive, layersSettings, countryIsoCodes) => layersActive
  .map((id) => LAYERS.find(l => l.id === id))
  .filter(x => !!x)
  .map((l) => {
    const { id, paramsConfig, decodeConfig, decodeFunction, timelineConfig } = l;
    const interactiveLayersIds = getInteractiveLayersIds(l);
    const settings = layersSettings[id] || {};

    return {
      id,
      interactiveLayersIds,
      ...l.config,
      ...settings,

      ...(!!paramsConfig && {
        params: getParams(paramsConfig, { ...settings.params, country_iso_codes: countryIsoCodes })
      }),

      ...(!!decodeConfig && {
        decodeParams: getParams(decodeConfig, { ...timelineConfig, ...settings.decodeParams, ...settings.timelineParams }),
        decodeFunction
      })
    };
  });
