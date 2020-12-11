import { createSelector } from 'reselect';

import isEmpty from 'lodash/isEmpty';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';

// Get the datasets and filters from state
const getFilters = (state) => state.database.filters.data;
const getFilterOptions = (state) => state.database.filters.options;

// Create a function to compare the current active datatasets and the current datasetsIds
export const getParsedFilters = createSelector(
  getFilters,
  getFilterOptions,
  (filters, options) => {
    let newFilterOptions = options;

    if (
      filters.country_id &&
      !!filters.country_id.length &&
      !isEmpty(options)
    ) {
      const activeCountries = options.country_id.filter((c) =>
        filters.country_id.map((i) => +i).includes(c.id)
      );

      newFilterOptions = {
        ...newFilterOptions,
        operator: sortBy(
          flatten(
            activeCountries.map((c) =>
              options.operator.filter((o) => c.operators.includes(o.id))
            )
          ),
          'name'
        ),
        observer_id: sortBy(
          flatten(
            activeCountries.map((c) =>
              options.observer_id.filter((o) => c.observers.includes(o.id))
            )
          ),
          'name'
        ),
        fmu_id: sortBy(
          flatten(
            activeCountries.map((c) =>
              options.fmu_id.filter((f) => c.fmus.includes(f.id))
            )
          ),
          'name'
        ),
      };
    }

    if (filters.operator && !!filters.operator.length) {
      const activeOperators = options.operator.filter((c) =>
        filters.operator.map((i) => +i).includes(c.id)
      );

      newFilterOptions = {
        ...newFilterOptions,
        fmu_id: sortBy(
          flatten(
            activeOperators.map((o) =>
              options.fmu_id.filter((f) => o.fmus.includes(f.id))
            )
          ),
          'name'
        ),
      };
    }

    if (filters.category_id && !!filters.category_id.length) {
      const activeCategories = options.category_id.filter((c) =>
        filters.category_id.map((i) => +i).includes(c.id)
      );

      newFilterOptions = {
        ...newFilterOptions,
        subcategory_id: sortBy(
          flatten(
            activeCategories.map((o) =>
              options.subcategory_id.filter((f) =>
                o.subcategories.includes(f.id)
              )
            )
          ),
          'name'
        ),
      };
    }

    return {
      data: filters,
      options: newFilterOptions,
    };
  }
);
