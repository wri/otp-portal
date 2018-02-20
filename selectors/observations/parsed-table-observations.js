import { createSelector } from 'reselect';

// Get the datasets and filters from state
const observations = state => state.observations;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedTableObservations = createSelector(
  observations,
  (_observations) => {
    if (_observations.data && _observations.data.length) {
      return _observations.data.map(obs => ({
        id: obs.id,
        date: new Date(obs['publication-date']).getFullYear(),
        country: obs.country.iso,
        operator: !!obs.operator && obs.operator.name,
        category: obs.subcategory.category.name,
        observation: obs.details,
        level: obs.severity.level,
        fmu: !!obs.fmu && obs.fmu.name,
        report: obs['observation-report'] ? obs['observation-report'].attachment.url : null,
        location: (!!obs.lat && !!obs.lng) ? { lat: Number(obs.lat), lng: Number(obs.lng) } : {}
      }));
    }

    return [];
  }
);

export { getParsedTableObservations };
