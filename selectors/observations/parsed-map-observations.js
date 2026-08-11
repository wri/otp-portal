// Constants
import { PALETTE_COLOR_1, LEGEND_SEVERITY } from 'constants/rechart';
import { LAYERS } from 'constants/layers';
import { isEmpty } from 'utils/general';
import sortBy from 'lodash/sortBy';
import { createSelector } from '@reduxjs/toolkit';
import { spiderifyCluster, getStyleLayerId } from 'components/map/layer-manager/utils';

import { parseObservation } from 'utils/observations';
import { omitBy } from 'utils/general';

// The spider leaves declare their own style layer id, so the page can test a clicked feature
// against it
export const OBSERVATIONS_LEAVES_LAYER_ID = 'observations-leaves';

// Layers whose style layers respond to clicks. The FMU layer and the spider legs are drawn but
// not interactive.
const INTERACTIVE_LAYERS = ['observations', OBSERVATIONS_LEAVES_LAYER_ID];

const intl = (state, props) => props && props.intl;

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

/**
 * The spider legs and leaves for an expanded cluster. Depends on zoom because the leaves are
 * positioned in world coordinates.
 */
const getClusterLayers = createSelector(
  cluster, zoom,
  (_cluster, _zoom) => {
    if (isEmpty(_cluster)) return [];

    const spider = spiderifyCluster({ ..._cluster, zoom: _zoom });

    return Object.keys(spider).map((key) => {
      return {
        id: `observations-${key}`,
        type: 'geojson',
        source: {
          type: 'geojson',
          data: spider[key]
        },
        render: {
          ...(key === 'leaves' && {
            layers: [
              {
                metadata: {
                  position: 'top'
                },
                id: OBSERVATIONS_LEAVES_LAYER_ID,
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
          }),
          ...(key === 'legs' && {
            layers: [
              {
                metadata: {
                  // position: 'top'
                },
                type: 'line',
                paint: {
                  'line-width': 1,
                  'line-color': 'rgba(128, 128, 128, 0.5)'
                }
              }
            ]
          })
        }
      };
    });
  }
);

const FMUS_LAYER = LAYERS.find(l => l.id === 'fmus');

/**
 * The FMU layer fades in as you zoom, so this is the only part of the map that zoom should
 * rebuild. Keeping it separate is what stops a zoom change from re-deriving every observation.
 */
const getFmusLayer = createSelector(
  zoom,
  (_zoom) => ({
    ...FMUS_LAYER,
    ...FMUS_LAYER.config,
    opacity: _zoom / 8 > 1 ? 1 : _zoom / 4 / 8,
    params: {
      country_iso_codes: process.env.OTP_COUNTRIES.split(',')
    }
  })
);

/**
 * Walks every observation, so it depends on the data alone. Holding its identity steady also lets
 * react-map-gl's `deepEqual` bail out immediately rather than comparing the whole FeatureCollection
 * on each render.
 */
const getObservationsLayer = createSelector(
  observations,
  (_observations) => ({
    id: 'observations',
    type: 'geojson',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: (_observations || []).filter(o => getLocation(o)).map(obs => ({
          type: 'Feature',
          properties: omitBy({
            ...parseObservation(obs),
            'observer-organizations': obs.observers.map(o => o.name).join(', '),
            fmu: !!obs.fmu && obs.fmu.name
          }, val => val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0)),
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
            'circle-radius': 8,
            'circle-stroke-width': 2,
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
  })
);

// Assembled from three separately memoised parts so that panning and zooming, which only affect
// the cluster and FMU layers, no longer re-derive the observation features
const getObservationsLayers = createSelector(
  observations, getClusterLayers, getFmusLayer, getObservationsLayer,
  (_observations, _clusterLayers, _fmusLayer, _observationsLayer) => {
    if (!_observations) return [];

    return [..._clusterLayers, _fmusLayer, _observationsLayer];
  }
);


/**
 * Style layer ids to hand to the map as `interactiveLayerIds`, derived from the same specs that
 * produce the layers rather than spelled out by hand — the ids are generated, so a change to a
 * render layer's type or position would otherwise break clicking with no error.
 *
 * The spider leaves only exist while a cluster is open, so they drop out of the list on their own.
 */
const getObservationsInteractiveLayersIds = createSelector(
  getObservationsLayers,
  (_layers) => _layers
    .filter(l => INTERACTIVE_LAYERS.includes(l.id))
    .flatMap(l => (l.render.layers || []).map((rl, i) => getStyleLayerId(l.id, rl, i)))
);


const getObservationsLegend = createSelector(
  observations, intl,
  (_observations, _intl) => {

    if (!_intl) return [];

    const FMUS_LAYER = (LAYERS.find(l => l.id === 'fmus'));
    const { legendConfig } = FMUS_LAYER;

    return [
      {
        id: 'fmus',
        dataset: 'fmus',
        name: _intl.formatMessage({ id: 'fmus' }),
        layers: [
          {
            opacity: 1,
            active: true,
            name: _intl.formatMessage({ id: 'fmus' }),
            legendConfig: {
              ...legendConfig,
              ...(legendConfig.items && {
                items: sortBy(legendConfig.items.map(i => ({
                  ...i,
                  ...(i.name && { name: _intl.formatMessage({ id: i.name || '-' }) }),
                  ...(i.items && {
                    items: i.items.map(ii => ({
                      ...ii,
                      ...(ii.name && { name: _intl.formatMessage({ id: ii.name || '-' }) })
                    }))
                  })
                })), 'name')
              })
            }
          }
        ]
      },
      {
        id: 'severity',
        dataset: 'severity',
        name: _intl.formatMessage({ id: 'severity' }),
        layers: [
          {
            opacity: 1,
            active: true,
            name: _intl.formatMessage({ id: 'severity' }),
            legendConfig: {
              type: 'basic',
              items: LEGEND_SEVERITY.list.map(l => ({
                name: _intl.formatMessage({ id: l.label }),
                color: l.fill
              }))
            }
          }
        ]
      }
    ];
  }
);




export { getObservationsLayers, getObservationsInteractiveLayersIds, getObservationsLegend };
