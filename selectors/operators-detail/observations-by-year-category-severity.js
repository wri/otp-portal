import { createSelector } from 'reselect';
import groupBy from 'lodash/groupBy';

// Get the datasets and filters from state
const operatorsDetail = state => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getObservationsByYearCategorySeverity = (_operatorsDetail) => {
  if (_operatorsDetail.data.observations) {
    const observations = _operatorsDetail.data.observations.map((obs) => {
      return {
        ...obs,
        // TODO: in which format id the publication-date
        date: new Date(obs['publication-date']).getFullYear()
      }
    });

    return observations;
  }

  return [];
};

// Export the selector
export default createSelector(
  operatorsDetail,
  getObservationsByYearCategorySeverity
);
