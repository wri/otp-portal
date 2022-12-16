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
        const doc = requiredDoc['gov-documents'][0]
        const docType = requiredDoc['document-type'];
        let url;
        if (docType === 'link') url = doc.link;
        if (docType === 'file') url = doc.attachment?.url;
        const parentCategory = requiredDoc['required-gov-document-group'].parent;

        return {
          id: doc.id,
          docId: doc.id,
          docType,
          requiredDocId: requiredDoc.id,
          url,
          type: doc.type,
          title: requiredDoc.name,
          explanation: requiredDoc.explanation,
          position: requiredDoc.position,
          category: parentCategory ? parentCategory.name : requiredDoc['required-gov-document-group'].name,
          categoryPosition: parentCategory ? parentCategory.position : requiredDoc['required-gov-document-group'].position,
          subCategory: parentCategory ? requiredDoc['required-gov-document-group'].name : null,
          subCategoryPosition: parentCategory ? requiredDoc['required-gov-document-group'].position : null,
          status: doc.status,
          reason: doc.reason,
          startDate: new Date(doc['start-date']).toJSON().slice(0, 10).replace(/-/g, '/'),
          endDate: doc['expire-date'] ?
            new Date(doc['expire-date']).toJSON().slice(0, 10).replace(/-/g, '/') :
            null,

          link: doc.link,
          units: doc.units,
          value: doc.value
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
