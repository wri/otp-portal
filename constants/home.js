const MAP_OPTIONS_HOME = {
  zoom: 5,
  center: [18, 0],
  scrollZoom: false,
  interactive: false
};

const MAP_LAYERS_HOME = [
  {
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
        'fill-color': '#e98300',
        'fill-opacity': 0.8,
        'fill-outline-color': '#d07500'
      }
    }]
  },


  {
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
        'fill-color': '#005b23',
        'fill-opacity': 0.8,
        'fill-outline-color': '#004219'
      }
    }]
  }
];

export { MAP_OPTIONS_HOME, MAP_LAYERS_HOME };
