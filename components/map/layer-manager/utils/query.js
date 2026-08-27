/**
 * Param interpolation for layer specs.
 *
 * Ported from layer-manager v3 (`src/utils/query.js`): placeholders are written as `{key}` in
 * `constants/layers.js` and substituted into `JSON.stringify(source | render)` before the result
 * is parsed back.
 *
 * A quoted placeholder loses its quotes so the value keeps its JSON type —
 * `['literal', '{country_iso_codes}']` has to become `['literal', ['CMR', 'COG']]` rather than
 * `['literal', 'CMR,COG']`, and `['==', 'id', '{clickId}']` has to compare against a number.
 * Only the `"` form needs handling, since the input is always JSON.
 *
 * Two halves of the original are deliberately not ported: `sqlParams` / `concatenation`, which no
 * layer here uses, and the `{{key}}` placeholder form, which appears in no layer spec.
 * `components/map/legend/legend-item-types/utils.js` keeps its own older copy for legend strings.
 */

const substitution = (originalStr, params = {}) =>
  Object.entries(params).reduce((str, [key, value]) => {
    const isStructured = value !== null && typeof value === 'object';
    const isScalar = typeof value === 'number' || typeof value === 'boolean';

    const typed = isStructured ? JSON.stringify(value) : isScalar ? String(value) : null;

    // Quoted first, so a typed value replaces its quotes; whatever is left interpolates as a string
    const withTypedValues = typed
      ? str.replace(new RegExp(`"\\{${key}\\}"`, 'g'), () => typed)
      : str;

    return withTypedValues.replace(new RegExp(`\\{${key}\\}`, 'g'), () => String(value));
  }, originalStr);

/**
 * Interpolate params into a layer spec fragment (`source` or `render`).
 * `parse: false` opts a fragment out, matching layer-manager's behaviour.
 *
 * With no params there is nothing to interpolate, so the fragment is handed back untouched rather
 * than round-tripped through JSON. That matters on the observations map, where the geojson source
 * holds every observation: returning the memoised selector's own object lets react-map-gl's
 * `deepEqual` bail out on identity instead of walking the whole FeatureCollection.
 *
 * Callers must therefore treat the result as read-only — it may be shared with `constants/layers.js`.
 */
export const parseSpec = (spec = {}, params) => {
  if (spec.parse === false || !params || !Object.keys(params).length) return spec;

  return JSON.parse(substitution(JSON.stringify(spec), params));
};
