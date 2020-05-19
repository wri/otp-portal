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
        report: obs['observation-report'],
        status: obs['validation-status-id'],
        documents: obs['observation-documents'] || [],
        ...obs['fmu-id'] && {
          fmu: _operatorsDetail.data.fmus.find(f => +f.id === +obs['fmu-id'])
        }
      }));

      return observations;
    }

    return [];
  }
);

export { getParsedObservations };
