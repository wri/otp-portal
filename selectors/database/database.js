import { createSelector } from 'reselect';

// Get the datasets and filters from state
const getDatabase = (state) => state.database;

export const getParsedTableDocuments = createSelector(
  getDatabase,
  (documentsDatabase) => {
    if (documentsDatabase.data && documentsDatabase.data.length) {
      return documentsDatabase.data.map((doc) => ({
        id: doc.id,
        status: doc.status,
        country: doc.operator.country && doc.operator.country.iso,
        operator: doc.operator.name,
        // 'forest-type': null,
        fmu: doc.fmu || '',
        'start-date': doc['start-date'],
        'expire-date': doc['expire-date'],
        source: doc['source-type'],
        sourceInfo: doc['source-info'],
        document: doc.attachment,
        reason: doc.reason || '',
      }));
    }

    return [];
  }
);
