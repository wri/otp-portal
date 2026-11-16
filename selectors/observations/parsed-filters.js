import { memoizeOne } from 'utils/memoize';

import { FILTER_RULES } from 'constants/observations';
import { narrowFilterOptions } from 'utils/filter-options';

// Narrows the dependent filter options (operators, observers, FMUs, subcategories) to the selection
const getParsedFilters = memoizeOne(
  (_filters, _filterOptions) => ({
    data: _filters,
    options: narrowFilterOptions(_filters, _filterOptions, FILTER_RULES)
  })
);

export { getParsedFilters };
