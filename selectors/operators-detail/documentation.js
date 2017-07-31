import { createSelector } from 'reselect';

// Get the datasets and filters from state
const operatorsDetail = state => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedDocumentation = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    let countryDocumentation = [];
    let fmuDocumentation = [];

    if (_operatorsDetail.data['operator-document-countries']) {
      countryDocumentation = _operatorsDetail.data['operator-document-countries'].map(doc => ({
        id: doc.id,
        type: doc.type,
        title: doc['required-operator-document-country'].name,
        category: doc['required-operator-document-country']['required-operator-document-group'].name,
        status: doc.status,
        documents: doc.documents,
        date: new Date(doc['updated-at']).toJSON().slice(0, 10).replace(/-/g, '/')
      }));
    }

    if (_operatorsDetail.data['operator-document-fmus']) {
      fmuDocumentation = _operatorsDetail.data['operator-document-fmus'].map(doc => ({
        id: doc.id,
        type: doc.type,
        title: doc['required-operator-document-fmu'].name,
        category: doc['required-operator-document-fmu']['required-operator-document-group'].name,
        status: doc.status,
        documents: doc.documents,
        fmu: doc.fmu,
        date: new Date(doc['updated-at']).toJSON().slice(0, 10).replace(/-/g, '/')
      }));

      return [...fmuDocumentation, ...countryDocumentation];
    }

    return [];
  }
);

export { getParsedDocumentation };
