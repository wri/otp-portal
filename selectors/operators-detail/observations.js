import { createSelector } from 'reselect';

// Get the datasets and filters from state
const operatorsDetail = state => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedObservations = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    if (_operatorsDetail.data.observations) {
      const observations = _operatorsDetail.data.observations.map(obs => ({
        id: obs.id,
        details: obs.details,
        severity: obs.severity.level,
        category: obs.subcategory.category.name,
        illegality: obs.subcategory.name,
        date: new Date(obs['publication-date']),
        report: obs['observation-report']
      }));

      return observations;
    }

    return [];
  }
);

export { getParsedObservations };
