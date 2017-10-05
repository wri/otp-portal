import { createSelector } from 'reselect';
import sortBy from 'lodash/sortBy';
import compact from 'lodash/compact';

// Get the datasets and filters from state
const operatorsDetail = state => state.operatorsDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedDocumentation = createSelector(
  operatorsDetail,
  (_operatorsDetail) => {
    let countryDocumentation = [];
    let fmuDocumentation = [];

    if (_operatorsDetail.data['operator-document-countries']) {
      countryDocumentation = _operatorsDetail.data['operator-document-countries'].map((doc) => {
        if (doc['required-operator-document-country']) {
          return {
            id: doc.id,
            requiredDocId: doc['required-operator-document-country'].id,
            url: doc.attachment.url,
            type: doc.type,
            title: doc['required-operator-document-country'].name,
            category: doc['required-operator-document-country']['required-operator-document-group'].name,
            status: doc.status,
            startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/')
          };
        }
        return null;
      });
    }

    if (_operatorsDetail.data['operator-document-fmus']) {
      fmuDocumentation = _operatorsDetail.data['operator-document-fmus'].map((doc) => {
        if (doc['required-operator-document-fmu']) {
          return {
            id: doc.id,
            requiredDocId: doc['required-operator-document-fmu'].id,
            url: doc.attachment.url,
            type: doc.type,
            title: doc['required-operator-document-fmu'].name,
            category: doc['required-operator-document-fmu']['required-operator-document-group'].name,
            status: doc.status,
            fmu: doc.fmu,
            startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/')
          };
        }
        return null;
      });

      return [...compact(fmuDocumentation), ...compact(countryDocumentation)];
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
      return compact(sortBy(documentation.filter(d => d.status !== 'doc_not_provided').map((doc) => {
        if (doc['required-operator-document']) {
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
        }

        return null;
      }), 'title'));
    }

    return [];
  }
);

export { getParsedDocumentation, getAllParsedDocumentation };
