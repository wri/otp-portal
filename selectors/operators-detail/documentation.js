import { createSelector } from 'reselect';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import { parseDocument } from 'utils/documents';

// Get the datasets and filters from state
const operatorDocumentation = (state) => state.operatorsDetail.documentation;
export const getFMUs = (state) => state.operatorsDetail.data.fmus;
export const getOperatorDocumentationFMU = (state) => state.operatorsDetail.fmu;
export const getOperatorDocumentationDate = (state) =>
  state.operatorsDetail.date;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedDocumentation = createSelector(
  [operatorDocumentation, getOperatorDocumentationFMU],
  (documentation, fmu) => {
    if (!documentation.data) return null;

    return documentation.data
      .filter((doc) => !doc['required-operator-document']['contract-signature'])
      .filter((doc) => !fmu || (doc.fmu && doc.fmu.id === fmu.id))
      .map((doc) => {
        try {
          return parseDocument(doc);
        } catch (error) {
          return null;
        }
      });
  }
);

const getContractSignatureDocumentation = (state) => state.operatorsDetail.publicationAuthorization || {};

const getHistoricFMUs = createSelector(
  [operatorDocumentation],
  (documentation) => {
    if (!documentation.data) return [];

    const FMUS = uniqBy(documentation.data
      .filter(d => d.fmu)
      .map(d => d.fmu), 'id');

    return sortBy(FMUS, 'name');
  }
);

export { getParsedDocumentation, getContractSignatureDocumentation, getHistoricFMUs };
