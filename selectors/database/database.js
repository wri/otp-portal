import { createSelector } from 'reselect';

// Get the datasets and filters from state
const database = (state) => state.database;

// Create a function to compare the current active datatasets and the current datasetsIds
export const getParsedDatabase = createSelector(
  database,
  (documentsDatabase) => {
    console.log(documentsDatabase);
    if (documentsDatabase && documentsDatabase.data.observations) {
      const observations = documentsDatabase.data.observations.map((obs) => {
        const evidence =
          obs['evidence-type'] !== 'Evidence presented in the report'
            ? obs['observation-documents']
            : obs['evidence-on-report'];

        return {
          id: obs.id,
          details: obs.details,
          severity: obs.severity && obs.severity.level,
          category: obs.subcategory?.category?.name,
          illegality: obs.subcategory?.name,
          date: new Date(obs['publication-date']),
          report: obs['observation-report'],
          evidence,
          status: obs['validation-status-id'],
          ...(obs['fmu-id'] && {
            fmu: documentsDatabase.data.fmus.find(
              (f) => +f.id === +obs['fmu-id']
            ),
          }),
        };
      });

      return observations;
    }

    return [];
  }
);
