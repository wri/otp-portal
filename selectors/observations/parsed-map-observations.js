// Constants
import { PALETTE_COLOR_1, LEGEND_SEVERITY } from 'constants/rechart';
import isEmpty from 'lodash/isEmpty';
import { createSelector } from 'reselect';
import { spiderifyCluster } from 'components/map-new/layer-manager/utils';

const FMU_LEGEND = [
  {
    name: 'Cameroon',
    iso: 'CMR',
    color: '#007A5E',
    items: [
      { name: 'ventes_de_coupe', color: '#8BC2B5' },
      { name: 'ufa', color: '#007A5E' },
      { name: 'communal', color: '#00382B' }
    ]
  },
  {
    name: 'Central African Republic',
    iso: 'CAF',
    color: '#e9D400'
  },
  {
    name: 'Congo',
    iso: 'COG',
    color: '#7B287D'
  },
  {
    name: 'Democratic Republic of the Congo',
    iso: 'COD',
    color: '#5ca2d1'
  },
  {
    name: 'Gabon',
    iso: 'GAB',
    color: '#e95800',
    items: [
      { name: 'CPAET', color: '#e95800' },
      { name: 'CFAD', color: '#e9A600' }
    ]
  }
];

// Get the datasets and filters from state
const observations = state => state.observations.data;
const cluster = state => state.observations.cluster;
const zoom = state => state.observations.map.zoom;

const getLocation = (obs = {}) => {
  if (obs.lat && obs.lng) {
    return [
      Number(obs.lng),
      Number(obs.lat),
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
const getObservationsLayers = createSelector(
  observations, cluster, zoom,
  (_observations, _cluster, _zoom) => {
    if (_observations) {
      let clusterLayers = [];
      const features = _observations.filter(o => {
        return getLocation(o);
      });

      if (!isEmpty(_cluster)) {
        const spider = spiderifyCluster({ ..._cluster, zoom: _zoom });
        clusterLayers = Object.keys(spider).map((key) => {
          return {
            id: `observations-${key}`,
            type: 'geojson',
            source: {
              type: 'geojson',
              data: spider[key]
            },
            render: {
              ...key === 'leaves' && {
                layers: [
                  {
                    metadata: {
                      position: 'top'
                    },
                    type: 'circle',
                    paint: {
                      'circle-radius': 6,
                      'circle-stroke-width': 1,
                      'circle-stroke-color': '#333',
                      'circle-color': [
                        'match',
                        ['get', 'level'],
                        0,
                        PALETTE_COLOR_1[0].fill,
                        1,
                        PALETTE_COLOR_1[1].fill,
                        2,
                        PALETTE_COLOR_1[2].fill,
                        3,
                        PALETTE_COLOR_1[3].fill,
                        /* other */
                        '#ccc'
                      ]
                    }
                  }
                ]
              },
              ...key === 'legs' && {
                layers: [
                  {
                    metadata: {
                      position: 'top'
                    },
                    type: 'line',
                    paint: {
                      'line-width': 1,
                      'line-color': 'rgba(128, 128, 128, 0.5)'
                    }
                  }
                ]
              }
            }
          };
        });
      }

      return [
        ...clusterLayers,
        {
          id: 'fmus',
          type: 'vector',
          source: {
            type: 'vector',
            tiles: [`${process.env.OTP_API}/fmus/tiles/{z}/{x}/{y}`],
            promoteId: 'id'
          },
          render: {
            layers: [
              {
                type: 'fill',
                'source-layer': 'layer0',
                filter: [
                  'all',
                  ['in', ['get', 'iso3_fmu'], ['literal', process.env.OTP_COUNTRIES]],
                  ['==', ['get', 'iso3_fmu'], 'COD']
                ],
                paint: {
                  'fill-color': '#5ca2d1',
                  'fill-opacity': 0.9
                }
              },
              {
                type: 'fill',
                'source-layer': 'layer0',
                filter: [
                  'all',
                  ['in', ['get', 'iso3_fmu'], ['literal', process.env.OTP_COUNTRIES]],
                  ['==', ['get', 'iso3_fmu'], 'COG']
                ],
                paint: {
                  'fill-color': '#7B287D',
                  'fill-opacity': 0.9
                }
              },
              {
                type: 'fill',
                'source-layer': 'layer0',
                filter: [
                  'all',
                  ['in', ['get', 'iso3_fmu'], ['literal', process.env.OTP_COUNTRIES]],
                  ['==', ['get', 'iso3_fmu'], 'CMR']
                ],
                paint: {
                  'fill-color': {
                    property: 'fmu_type_label',
                    type: 'categorical',
                    stops: [
                      ['ventes_de_coupe', '#8BC2B5'],
                      ['ufa', '#007A5E'],
                      ['communal', '#00382B']
                    ],
                    default: '#007A5E'
                  },
                  'fill-opacity': 0.9
                }
              },
              {
                type: 'fill',
                'source-layer': 'layer0',
                filter: [
                  'all',
                  ['in', ['get', 'iso3_fmu'], ['literal', process.env.OTP_COUNTRIES]],
                  ['==', ['get', 'iso3_fmu'], 'GAB']
                ],
                paint: {
                  'fill-color': {
                    property: 'fmu_type_label',
                    type: 'categorical',
                    stops: [
                      ['CPAET', '#e95800'],
                      ['CFAD', '#e9A600']
                    ],
                    default: '#e95800'
                  },

                  'fill-opacity': 0.9
                }
              },
              {
                type: 'fill',
                'source-layer': 'layer0',
                filter: [
                  'all',
                  ['in', ['get', 'iso3_fmu'], ['literal', process.env.OTP_COUNTRIES]],
                  ['==', ['get', 'iso3_fmu'], 'CAF']
                ],
                paint: {
                  'fill-color': '#e9D400',
                  'fill-opacity': 0.9
                }
              },
              {
                type: 'line',
                'source-layer': 'layer0',
                filter: [
                  'all',
                  ['in', ['get', 'iso3_fmu'], ['literal', process.env.OTP_COUNTRIES]]
                ],
                paint: {
                  'line-color': '#000000',
                  'line-opacity': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    0.1
                  ],
                  'line-width': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    2,
                    1
                  ],
                  'line-dasharray': [3, 1]
                }
              }
            ]
          }
        },
        {
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
                  category: obs?.subcategory?.category?.name,
                  observation: obs.details,
                  level: obs.severity && obs.severity.level,
                  fmu: !!obs.fmu && obs.fmu.name,
                  report: obs['observation-report'] ? obs['observation-report'].attachment.url : null,
                  'operator-type': obs.operator && obs.operator.type,
                  subcategory: obs?.subcategory?.name,
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
                  'circle-stroke-width': 1,
                  'circle-stroke-color': '#333',
                  'circle-color': [
                    'match',
                    ['get', 'level'],
                    0,
                    PALETTE_COLOR_1[0].fill,
                    1,
                    PALETTE_COLOR_1[1].fill,
                    2,
                    PALETTE_COLOR_1[2].fill,
                    3,
                    PALETTE_COLOR_1[3].fill,
                    /* other */
                    '#ccc'
                  ]
                }
              }
            ]
          }
        }
      ];
    }

    return [];
  }
);


const getObservationsLegend = createSelector(
  observations,
  (_observations) => {
    return [
      {
        id: 'fmus',
        dataset: 'fmus',
        name: 'fmus',
        layers: [
          {
            opacity: 1,
            active: true,
            name: 'fmus',
            legendConfig: {
              type: 'basic',
              color: '#e98300',
              items: process.env.OTP_COUNTRIES.map(iso => FMU_LEGEND.find(i => i.iso === iso))
            }
          }
        ]
      },
      {
        id: 'severity',
        dataset: 'severity',
        name: 'severity',
        layers: [
          {
            opacity: 1,
            active: true,
            name: 'severity',
            legendConfig: {
              type: 'basic',
              items: LEGEND_SEVERITY.list.map(l => (
                { name: l.label, color: l.fill }
              ))
            }
          }
        ]
      }
    ]
  }
);




export { getObservationsLayers, getObservationsLegend };
