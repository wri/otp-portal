import { createSelector } from '@reduxjs/toolkit';

import { isEmpty } from 'utils/general';
import sortBy from 'lodash/sortBy';

// Get the datasets and filters from state
const filters = state => state.observations.filters.data;
const filterOptions = state => state.observations.filters.options;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedFilters = createSelector(
  filters, filterOptions,
  (_filters, _filterOptions) => {
    let newFilterOptions = _filterOptions;

    if (_filters.country_id && !!_filters.country_id.length && !isEmpty(_filterOptions)) {
      const activeCountries = _filterOptions.country_id
        .filter(c => _filters.country_id.map(i => +i).includes(c.id));

      newFilterOptions = {
        ...newFilterOptions,
        operator: sortBy(
          activeCountries.map(c => _filterOptions.operator.filter(o => c.operators.includes(o.id))).flat(),
          'name'
        ),
        observer_id: sortBy(
          activeCountries.map(c => _filterOptions.observer_id.filter(o => c.observers.includes(o.id))).flat(),
          'name'
        ),
        fmu_id: sortBy(
          activeCountries.map(c => _filterOptions.fmu_id.filter(f => c.fmus.includes(f.id))).flat(),
          'name'
        )
      };
    }

    if (_filters.operator && !!_filters.operator.length && !isEmpty(_filterOptions)) {
      const activeOperators = _filterOptions.operator
        .filter(c => _filters.operator.map(i => +i).includes(c.id));

      newFilterOptions = {
        ...newFilterOptions,
        fmu_id: sortBy(
          activeOperators.map(o => _filterOptions.fmu_id.filter(f => o.fmus.includes(f.id))).flat(),
          'name'
        )
      };
    }

    if (_filters.category_id && !!_filters.category_id.length && !isEmpty(_filterOptions)) {
      const activeCategories = _filterOptions.category_id
        .filter(c => _filters.category_id.map(i => +i).includes(c.id));

      newFilterOptions = {
        ...newFilterOptions,
        subcategory_id: sortBy(
          activeCategories.map(o => _filterOptions.subcategory_id.filter(f => o.subcategories.includes(f.id))).flat(),
          'name'
        )
      };
    }

    return {
      data: _filters,
      options: newFilterOptions
    };
  }
);

export { getParsedFilters };
