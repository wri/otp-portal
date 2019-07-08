import { createSelector } from 'reselect';
import sortBy from 'lodash/sortBy';
import compact from 'lodash/compact';

// Get the datasets and filters from state
const countriesDetail = state => state.countriesDetail;

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedDocumentation = createSelector(
  countriesDetail,
  (_countriesDetail) => {
    let countryDocumentation = [];
    let fmuDocumentation = [];

    if (_countriesDetail.data['country-document-countries']) {
      countryDocumentation = _countriesDetail.data['country-document-countries'].map((doc) => {
        if (doc['required-country-document-country']) {
          return {
            id: doc.id,
            requiredDocId: doc['required-country-document-country'].id,
            url: doc.attachment.url,
            type: doc.type,
            title: doc['required-country-document-country'].name,
            explanation: doc['required-country-document-country'].explanation,
            category: doc['required-country-document-country']['required-country-document-group'].name,
            categoryPosition: doc['required-country-document-country']['required-country-document-group'].position,
            status: doc.status,
            reason: doc.reason,
            startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            annexes: doc['country-document-annexes'] ? doc['country-document-annexes'] : []
          };
        }
        return null;
      });
    }

    if (_countriesDetail.data['country-document-fmus']) {
      fmuDocumentation = _countriesDetail.data['country-document-fmus'].map((doc) => {
        if (doc['required-country-document-fmu']) {
          return {
            id: doc.id,
            requiredDocId: doc['required-country-document-fmu'].id,
            url: doc.attachment.url,
            type: doc.type,
            title: doc['required-country-document-fmu'].name,
            explanation: doc['required-country-document-fmu'].explanation,
            category: doc['required-country-document-fmu']['required-country-document-group'].name,
            categoryPosition: doc['required-country-document-fmu']['required-country-document-group'].position,
            status: doc.status,
            reason: doc.reason,
            fmu: doc.fmu,
            startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
            annexes: doc['country-document-annexes'] ? doc['country-document-annexes'] : []
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
  countriesDetail,
  (_countriesDetail) => {
    const documentation = _countriesDetail.documentation.data;

    if (documentation && !!documentation.length) {
      return compact(sortBy(documentation.filter(d => d.status !== 'doc_not_provided').map((doc) => {
        if (doc['required-country-document']) {
          return {
            id: doc.id,
            requiredDocId: doc['required-country-document'].id,
            type: doc.type,
            title: doc['required-country-document'].name,
            category: doc['required-country-document']['required-country-document-group'].name,
            categoryPosition: doc['required-country-document']['required-country-document-group'].position,
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
