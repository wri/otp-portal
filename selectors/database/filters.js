import { createSelector } from '@reduxjs/toolkit';

import { FILTER_RULES } from 'constants/documents-database';
import { narrowFilterOptions } from 'utils/filter-options';

const getFilters = (state) => state.database.filters.data;
const getFilterOptions = (state) => state.database.filters.options;

export const getParsedFilters = createSelector(
  getFilters,
  getFilterOptions,
  (filters, options) => ({
    data: filters,
    options: narrowFilterOptions(filters, options, FILTER_RULES)
  })
);
