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
const getObservationsLayer = createSelector(
  observations,
  (_observations) => {
    if (_observations.data) {
      const features = _observations.data.filter(o => {
        return getLocation(o);
      });

      return {
        id: 'observations',
        type: 'geojson',
        source: {
          type: 'geojson',
          data: {
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
          },
          maxzoom: 24,
          cluster: true,
          clusterMaxZoom: 23,
          clusterRadius: 45
        },
        render: {
          layers: [
            {
              metadata: {
                cluster: true,
                position: 'top'
              },
              type: 'circle',
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': '#FFF',
                'circle-stroke-width': 2,
                'circle-stroke-color': [
                  'case',
                  [
                    'boolean',
                    ['feature-state', 'hover'],
                    false
                  ],
                  '#000',
                  '#5ca2d1'
                ],
                'circle-radius': 12
              }
            },
            {
              metadata: {
                cluster: true,
                position: 'top'
              },
              type: 'symbol',
              filter: ['has', 'point_count'],
              layout: {
                'text-allow-overlap': true,
                'text-ignore-placement': true,
                'text-field': '{point_count_abbreviated}',
                'text-size': 12
              }
            },
            {
              metadata: {
                position: 'top'
              },
              type: 'circle',
              filter: ['!has', 'point_count'],
              paint: {
                'circle-radius': 6,
                'circle-color': [
                  'match',
                  ['get', 'level'],
                  0,
                  '#9B9B9B',
                  1,
                  '#005b23',
                  2,
                  '#333333',
                  3,
                  '#e98300',
                  /* other */
                  '#ccc'
                ]
              }
            }
          ]
        }
      };
    }

    return [];
  }
);

export { getObservationsLayer };
