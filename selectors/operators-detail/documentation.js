import { createSelector } from '@reduxjs/toolkit';
import { sortBy, uniqBy } from 'utils/general';
import { parseDocument } from 'services/documents';
import { getTodayDate } from 'utils/documentation';

// The operator's documents, or only one FMU's, without the publication authorization
export function parseOperatorDocuments(documentation, fmu) {
  if (!documentation) return null;

  return documentation
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

// FMUs that have documents on the selected date, which may differ from the operator's current ones
export function getHistoricFmus(documentation) {
  if (!documentation) return [];

  return sortBy(uniqBy(documentation.filter((d) => d.fmu).map((d) => d.fmu), 'id'), 'name');
}

// Get the datasets and filters from state
const operatorDocumentation = (state) => state.operatorsDetail.documentation;
export const getFMUs = (state) => state.operatorsDetail.data.fmus;
export const getOperatorDocumentationFMU = (state) => state.operatorsDetail.fmu;
export const getOperatorDocumentationDate = (state) =>
  state.operatorsDetail.date || getTodayDate();

const getParsedDocumentation = createSelector(
  [operatorDocumentation, getOperatorDocumentationFMU],
  (documentation, fmu) => parseOperatorDocuments(documentation.data, fmu)
);

const getContractSignatureDocumentation = (state) => state.operatorsDetail.publicationAuthorization || {};

const getHistoricFMUs = createSelector(
  [operatorDocumentation],
  (documentation) => getHistoricFmus(documentation.data)
);

export { getParsedDocumentation, getContractSignatureDocumentation, getHistoricFMUs };
