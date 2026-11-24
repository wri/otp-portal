import { createSelector } from '@reduxjs/toolkit';

import { FILTER_RULES } from 'constants/observations';
import { narrowFilterOptions } from 'utils/filter-options';

const filters = (state) => state.observations.filters.data;
const filterOptions = (state) => state.observations.filters.options;

const getParsedFilters = createSelector(
  filters, filterOptions,
  (_filters, _filterOptions) => ({
    data: _filters,
    options: narrowFilterOptions(_filters, _filterOptions, FILTER_RULES)
  })
);

export { getParsedFilters };
