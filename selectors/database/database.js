import { createSelector } from '@reduxjs/toolkit';

// Get the datasets and filters from state
const getDatabase = (state) => state.database;

export const getParsedTableDocuments = createSelector(
  getDatabase,
  (documentsDatabase) => {
    if (documentsDatabase.data && documentsDatabase.data.length) {

      return documentsDatabase.data
        .filter((doc) => !doc['required-operator-document']['contract-signature'])
        .map((doc) => ({
          id: doc.id,
          status: doc.status,
          country: doc.operator.country && doc.operator.country.iso,
          operator: doc.operator.name,
          'forest-type': doc.fmu && doc.fmu['forest-type'],
          fmu: doc.fmu || '',
          'start-date': doc['start-date'],
          'expire-date': doc['expire-date'],
          source: doc['source-type'],
          sourceInfo: doc['source-info'],
          document: doc.attachment,
          reason: doc.reason || '',
          annexes: doc['operator-document-annexes'],
          'document-name':
            (doc['required-operator-document'] &&
              doc['required-operator-document'].name) ||
            '',
          'legal-category':
            (doc['required-operator-document'] &&
              doc['required-operator-document'][
                'required-operator-document-group'
              ] &&
              doc['required-operator-document'][
                'required-operator-document-group'
              ].name) ||
            '',
        })
      );
    }

    return [];
  }
);
