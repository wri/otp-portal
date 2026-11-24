import { isEmpty, sortBy } from 'utils/general';

/**
 * Narrows dependent filter options to the selected parents, e.g. only the FMUs of the selected
 * countries. `rules` maps a filter key to { optionKey: parent => ids that parent allows }; rules
 * apply in order, each on top of the previous ones.
 */
export function narrowFilterOptions(filters, options, rules) {
  if (isEmpty(options)) return options;

  return Object.entries(rules).reduce((narrowed, [filterKey, dependents]) => {
    const selected = (filters[filterKey] || []).map(Number);
    if (!selected.length) return narrowed;

    const parents = options[filterKey].filter((parent) => selected.includes(parent.id));
    const changes = Object.entries(dependents).map(([optionKey, allowedIds]) => [
      optionKey,
      sortBy(parents.flatMap((parent) => narrowed[optionKey].filter((o) => allowedIds(parent).includes(o.id))), 'name')
    ]);
    return { ...narrowed, ...Object.fromEntries(changes) };
  }, options);
}
