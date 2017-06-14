import { createSelector } from 'reselect';
import groupBy from 'lodash/groupBy';

// Get the datasets and filters from state
const operatorsDetail = state => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getObservationsByCategory = (_operatorsDetail) => {
  console.log(_operatorsDetail.data.observations);
  return _operatorsDetail;
};

// Export the selector
export default createSelector(
  operatorsDetail,
  getObservationsByCategory
);
