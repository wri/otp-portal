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

    if (_countriesDetail.data['required-gov-documents']) {
      countryDocumentation = _countriesDetail.data['required-gov-documents'].map((requiredDoc) => {
        const doc = requiredDoc['gov-documents'].find(d => d.current);

        return {
          id: doc.id,
          docType: requiredDoc['document-type'],
          requiredDocId: requiredDoc.id,
          // url: doc.attachment.url,
          type: doc.type,
          title: requiredDoc.name,
          explanation: requiredDoc.explanation,
          category: requiredDoc['required-gov-document-group'].name,
          categoryPosition: requiredDoc['required-gov-document-group'].position,
          status: doc.status,
          reason: doc.reason,
          startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
          endDate: new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/'),

          link: doc.link,
          units: doc.units,
          value: doc.value,
          govFiles: doc['gov-files']
          // annexes: doc['country-document-annexes'] ? doc['country-document-annexes'] : []
        };
      });
    }

    return countryDocumentation;
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
