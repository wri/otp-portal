const MAP_SAWMILL_LAYER = {
  id: 'sawmill',
  source: 'sawmill',
  name: 'Sawmill',
  type: 'circle',
  paint: {
    'circle-color': '#e98300',
    'circle-radius': 5
  }
};

const MAP_SAWMILL_SOURCE_DEFAULT = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: []
      }
    }
  ]
};

export {
  MAP_SAWMILL_LAYER,
  MAP_SAWMILL_SOURCE_DEFAULT
};
