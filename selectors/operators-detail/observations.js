import { createSelector } from 'reselect';
import { parseObservations } from 'utils/observations';

// Get the datasets and filters from state
const operatorsDetail = (state) => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedObservations = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    if (_operatorsDetail.observations.data.length > 0) {
      return parseObservations(_operatorsDetail.observations.data);
    }

    return [];
  }
);

export { getParsedObservations };
