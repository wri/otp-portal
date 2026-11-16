// Flattens a country's required gov documents into the cards the documentation tab renders.
export function parseCountryDocumentation(country) {
  let countryDocumentation = [];

  if (country['required-gov-documents']) {
    countryDocumentation = country['required-gov-documents'].map((requiredDoc) => {
      const doc = requiredDoc['gov-documents'][0]
      const docType = requiredDoc['document-type'];
      let url;
      if (docType === 'link' || docType === 'stats') url = doc.link;
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
