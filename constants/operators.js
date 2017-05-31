import React from 'react';
import ReactDOM from 'react-dom';

const MAP_LAYERS_OPERATORS = [
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
      },
      interactivity: {
        click(e) {
          this.popup = new this.Popup({
            closeButton: true,
            closeOnClick: true
          });

          const props = e.features[0].properties;

          const div = window.document.createElement('div');
          const html = (
            <ul>
              {Object.keys(props).map(p =>
                <li onClick={() => console.log(p)} key={p}>{p}: {props[p]}</li>
              )}
            </ul>
          );

          this.popup.setLngLat(e.lngLat)
            .setDOMContent(ReactDOM.render(html, div))
            .addTo(this.map);
        },
        mouseenter() {
          this.map.getCanvas().style.cursor = 'pointer';
        },
        mousemove(e) {
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', e.features[0].properties.cartodb_id]);
        },
        mouseleave() {
          this.map.getCanvas().style.cursor = '';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', '']);
        }
      }
    }, {
      id: 'forest_concession_layer_hover',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      paint: {
        'fill-color': '#d07500'
      },
      filter: ['==', 'cartodb_id', '']
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
      },
      interactivity: {
        click(e) {
          this.popup.setLngLat(e.lngLat)
            .setHTML(e.features[0].properties.num_ccf)
            .addTo(this.map);
        }
      }
    }]
  }
];

export { MAP_LAYERS_OPERATORS };
