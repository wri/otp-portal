/**
 * Param interpolation for layer specs.
 *
 * Ported from layer-manager v3 (`src/utils/query.js`), which was applied to
 * `JSON.stringify(source | render)` before parsing the result back. Keys are written as
 * `{key}` or `{{key}}` in the layer definitions in `constants/layers.js`.
 *
 * The quoted variants matter: `['literal', '{country_iso_codes}']` has to become
 * `['literal', ['CMR', 'COG']]`, not `['literal', 'CMR,COG']`, so an array or object value
 * replaces the surrounding quotes too. Same for numbers, so `['==', 'id', '{clickId}']`
 * compares against a number rather than a string.
 *
 * The `sqlParams` / `concatenation` half of the original module is not ported: no layer in
 * this app uses it.
 */
import isObject from 'lodash/isObject';

const QUOTES = ['"', "'", '`'];

export const substitution = (originalStr, params = {}) => {
  let str = originalStr;

  Object.keys(params).forEach((key) => {
    const value = params[key];

    // Replace the quoted placeholder, dropping the quotes, so the value keeps its JSON type
    if (Array.isArray(value) || isObject(value) || typeof value === 'number' || typeof value === 'boolean') {
      const replacement = isObject(value) || Array.isArray(value) ? JSON.stringify(value) : value;

      QUOTES.forEach((q) => {
        str = str
          .replace(new RegExp(`${q}{{${key}}}${q}`, 'g'), replacement)
          .replace(new RegExp(`${q}{${key}}${q}`, 'g'), replacement);
      });
    }

    // Anything left over is interpolated as a plain string
    str = str
      .replace(new RegExp(`{{${key}}}`, 'g'), value)
      .replace(new RegExp(`{${key}}`, 'g'), value);
  });

  return str;
};

export const replace = (originalStr, params = {}) => {
  if (typeof originalStr !== 'string') return originalStr;

  return substitution(originalStr, params);
};

/**
 * Interpolate params into a layer spec fragment (`source` or `render`).
 * `parse: false` opts a fragment out, matching layer-manager's behaviour.
 */
export const parseSpec = (spec = {}, params) => {
  if (spec.parse === false) return spec;

  return JSON.parse(replace(JSON.stringify(spec), params));
};
