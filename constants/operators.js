const MAP_OPTIONS_OPERATORS = {
  zoom: 5,
  center: [18, 0]
};

const MAP_LAYERS_OPERATORS = [{
  id: 'forest_concession',
  provider: 'cartodb',
  source: {
    type: 'geojson',
    data: `https://simbiotica.carto.com/api/v2/sql?q=${encodeURIComponent('SELECT * FROM forest_concession')}&format=geojson`
  },
  layer: [{
    id: 'forest_concession_layer',
    type: 'fill',
    source: 'forest_concession',
    layout: {},
    paint: {
      'fill-color': '#A50',
      'fill-opacity': 0.8
    }
  }]
}, {
  id: 'harvestable_areas',
  provider: 'cartodb',
  source: {
    type: 'geojson',
    data: `https://simbiotica.carto.com/api/v2/sql?q=${encodeURIComponent('SELECT * FROM harvestable_areas')}&format=geojson`
  },
  layer: [{
    id: 'harvestable_areas_layer',
    type: 'fill',
    source: 'harvestable_areas',
    layout: {},
    paint: {
      'fill-color': '#090',
      'fill-opacity': 0.8
    }
  }]
}];

export { MAP_OPTIONS_OPERATORS, MAP_LAYERS_OPERATORS };
