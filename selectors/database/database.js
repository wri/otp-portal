import { createSelector } from 'reselect';

// Get the datasets and filters from state
const getDatabase = (state) => state.database;

export const getParsedChartDocuments = createSelector(
  getDatabase,
  (documentsDatabase) => {
    if (documentsDatabase.data && documentsDatabase.data.length) {
      return documentsDatabase.data.map((doc) => ({
        id: doc.id,
        details: doc.details,
        severity: doc.severity && doc.severity.level,
        category: doc?.subcategory?.category?.name || '',
        illegality: doc?.subcategory?.name || '',
        date: new Date(doc['publication-date']),
      }));
    }

    return [];
  }
);

const getLocation = (doc = {}) => {
  if (doc.lat && doc.lng) {
    return {
      lat: Number(doc.lat),
      lng: Number(doc.lng),
    };
  }

  if (doc.country && doc.country['country-centroid']) {
    const centroid = doc.country['country-centroid'];

    return {
      lat: centroid.coordinates[0],
      lng: centroid.coordinates[1],
    };
  }

  return {};
};

export const getParsedTableDocuments = createSelector(
  getDatabase,
  (documentsDatabase) => {
    if (documentsDatabase.data && documentsDatabase.data.length) {
      return documentsDatabase.data.map((doc) => {
        const evidence =
          doc['evidence-type'] !== 'Evidence presented in the report'
            ? doc['observation-documents']
            : doc['evidence-on-report'];

        return {
          id: doc.id,
          date: new Date(doc['publication-date']).getFullYear(),
          country: doc.country.iso,
          operator: !!doc.operator && doc.operator.name,
          category: doc?.subcategory?.category?.name || '',
          observation: doc.details,
          level: doc.severity && doc.severity.level,
          fmu: !!doc.fmu && doc.fmu.name,
          report: doc['observation-report']
            ? doc['observation-report'].attachment.url
            : null,
          location: getLocation(doc),
          'location-accuracy': doc['location-accuracy'],
          'operator-type': doc.operator && doc.operator['operator-type'],
          subcategory: doc?.subcategory?.name || '',
          evidence,
          status: doc['validation-status-id'],
          'litigation-status': doc['litigation-status'],
          'observer-types': doc.observers.map(
            (observer) => observer['observer-type']
          ),
          'observer-organizations': doc.observers,
          'relevant-operators': doc['relevant-operators'].map((o) => o.name),
        };
      });
    }

    return [];
  }
);
