import { memoizeOne } from 'utils/memoize';

const getParsedChartObservations = memoizeOne(
  (observations) => {
    if (observations && observations.length) {
      return observations.map((obs) => ({
        id: obs.id,
        details: obs.details,
        level: obs.severity && obs.severity.level,
        category: obs?.subcategory?.category?.name || '',
        illegality: obs?.subcategory?.name || '',
        date: new Date(obs['observation-report'] && obs['observation-report']['publication-date']),
      }));
    }

    return [];
  }
);

export { getParsedChartObservations };
