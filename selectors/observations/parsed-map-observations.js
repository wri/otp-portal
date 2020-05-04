import { createSelector } from 'reselect';

// Get the datasets and filters from state
const observations = state => state.observations;

const getLocation = (obs = {}) => {
  if (obs.lat && obs.lng) {
    return [
      Number(obs.lat),
      Number(obs.lng)
    ];
  }


  // if (obs.fmu) {
  //   console.log(obs);
  // }

  // if (obs.country && obs.country['country-centroid']) {
  //   const centroid = obs.country['country-centroid'];

  //   return [
  //     centroid.coordinates[0],
  //     centroid.coordinates[1]
  //   ];
  // }
  return null;
};

// Create a function to compare the current active datatasets and the current datasetsIds
const getParsedMapObservations = createSelector(
  observations,
  (_observations) => {
    if (_observations.data && _observations.data.length) {
      const features = _observations.data.filter(o => {
        return getLocation(o);
      });

      return {
        type: 'FeatureCollection',
        features: features.map(obs => ({
          type: 'Feature',
          properties: {
            id: obs.id,
            date: new Date(obs['publication-date']).getFullYear(),
            country: obs.country.iso,
            operator: !!obs.operator && obs.operator.name,
            category: obs.subcategory.category.name,
            observation: obs.details,
            level: obs.severity.level,
            fmu: !!obs.fmu && obs.fmu.name,
            report: obs['observation-report'] ? obs['observation-report'].attachment.url : null,
            'operator-type': obs.operator && obs.operator.type,
            subcategory: obs.subcategory.name,
            evidence: obs.evidence,
            'litigation-status': obs['litigation-status'],
            'observer-types': obs.observers.map(observer => observer['observer-type']),
            'observer-organizations': obs.observers.map(observer => observer.organization)
          },
          geometry: {
            type: 'Point',
            coordinates: getLocation(obs)
          }
        }))
      };
    }

    return [];
  }
);

export { getParsedMapObservations };
