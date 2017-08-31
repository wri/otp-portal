import { createSelector } from 'reselect';
import sortBy from 'lodash/sortBy';

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
        requiredDocId: doc['required-operator-document-country'].id,
        type: doc.type,
        title: doc['required-operator-document-country'].name,
        category: doc['required-operator-document-country']['required-operator-document-group'].name,
        status: doc.status,
        startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
        endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/')
      }));
    }

    if (_operatorsDetail.data['operator-document-fmus']) {
      fmuDocumentation = _operatorsDetail.data['operator-document-fmus'].map(doc => ({
        id: doc.id,
        requiredDocId: doc['required-operator-document-fmu'].id,
        type: doc.type,
        title: doc['required-operator-document-fmu'].name,
        category: doc['required-operator-document-fmu']['required-operator-document-group'].name,
        status: doc.status,
        fmu: doc.fmu,
        startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
        endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/')
      }));

      return [...fmuDocumentation, ...countryDocumentation];
    }

    return [];
  }
);


// Create a function to compare the current active datatasets and the current datasetsIds
const getAllParsedDocumentation = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    const documentation = _operatorsDetail.documentation.data;

    if (documentation && !!documentation.length) {
      return sortBy(documentation.filter(d => d.status !== 'doc_not_provided').map(doc => {
        return {
          id: doc.id,
          requiredDocId: doc['required-operator-document'].id,
          type: doc.type,
          title: doc['required-operator-document'].name,
          category: doc['required-operator-document']['required-operator-document-group'].name,
          status: doc.status,
          startDate: new Date(doc['start-date']),
          endDate: new Date(doc['expire-date'])
        };
      }), 'title');
    }

    return [];
  }
);

export { getParsedDocumentation, getAllParsedDocumentation };
