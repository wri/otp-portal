import { memoizeOne } from 'utils/memoize';

import { FILTER_RULES } from 'constants/documents-database';
import { narrowFilterOptions } from 'utils/filter-options';

// Narrows the dependent filter options to the current selection
export const getParsedFilters = memoizeOne(
  (filters, options) => ({
    data: filters,
    options: narrowFilterOptions(filters, options, FILTER_RULES)
  })
);
