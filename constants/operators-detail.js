import React from 'react';
import { render } from 'react-dom';
import Popup from 'components/map/popup';

const TABS_OPERATORS_DETAIL = [{
  label: 'overview',
  value: 'overview'
}, {
  label: 'documentation',
  value: 'documentation',
  number: '65%'
}, {
  label: 'observations',
  value: 'observations',
  number: 120
}, {
  label: 'operator-detail.tabs.fmus',
  value: 'fmus',
  number: 7
}];


const TABS_DOCUMENTATION_OPERATORS_DETAIL = [{
  label: 'Operator documents',
  value: 'operator-documents'
}, {
  label: 'FMUs documents',
  value: 'fmus-documents'
}, {
  label: 'Chronological view',
  value: 'chronological-view'
}];

const MAP_LAYERS_OPERATORS_DETAIL = [
  {
    id: 'loss',
    provider: 'raster',
    source: {
      type: 'raster',
      tiles: [
        '/loss-layer/{z}/{x}/{y}'
      ],
      tileSize: 256
    },
    layers: [{
      id: 'loss_layer',
      type: 'raster',
      source: 'loss',
      minzoom: 0,
      paint: {
        'raster-opacity': 1,
        'raster-hue-rotate': 0,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
        'raster-saturation': 0,
        'raster-contrast': 0
      }
    }]
  },
  {
    id: 'gain',
    provider: 'raster',
    source: {
      type: 'raster',
      tiles: [
        'http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'
      ],
      tileSize: 256
    },
    layers: [{
      id: 'gain_layer',
      type: 'raster',
      source: 'gain',
      minzoom: 0,
      paint: {
        'raster-opacity': 1,
        'raster-hue-rotate': 0,
        'raster-brightness-min': 0,
        'raster-brightness-max': 1,
        'raster-saturation': 0,
        'raster-contrast': 0
      }
    }]
  },

  {
    id: 'forest_concession',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: `${process.env.OTP_API}/fmus?country_ids=7,47&operator_ids={{OPERATOR_ID}}&format=geojson`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY
        }
      }
    },
    layers: [{
      id: 'forest_concession_layer_selected',
      name: 'Forest managment units',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': '#d07500',
        'fill-opacity': 1,
        'fill-outline-color': 'green'
      },
      filter: ['==', 'id', ''],
      update(filters) {
        this.map.setFilter('forest_concession_layer_selected', ['==', 'id', parseInt(filters.FMU_ID, 10)]);
      }
    }, {
      id: 'forest_concession_layer_hover',
      name: 'Forest managment units',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': '#d07500',
        'fill-opacity': 0.4,
        'fill-outline-color': '#d07500'
      },
      filter: ['==', 'cartodb_id', '']
    }, {
      id: 'forest_concession_layer',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': '#e98300',
        'fill-opacity': 0.4,
        'fill-outline-color': '#d07500'
      },
      fitBounds: true,
      interactivity: {
        click(e, callback) {
          // Remove always the popup if exists and you are using 'closeOnClick'
          // You will prevent a bug that doesn't show the popup again
          // this.popup && this.popup.remove();
          // this.popup = new this.Popup();

          // this.map.setFilter('forest_concession_layer_selected', ['==', 'id', e.features[0].properties.id]);

          // const props = e.features[0].properties;
          // this.popup.setLngLat(e.lngLat)
          //   .setDOMContent(
          //     render(
          //       Popup({
          //         title: props.fmu_name
          //       }),
          //       window.document.createElement('div')
          //     )
          //   )
          //   .addTo(this.map);

          callback(e);
        },
        mouseenter() {
          this.map.getCanvas().style.cursor = 'pointer';
        },
        mousemove(e) {
          this.map.getCanvas().style.cursor = 'pointer';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', e.features[0].properties.cartodb_id]);
        },
        mouseleave() {
          this.map.getCanvas().style.cursor = '';
          this.map.setFilter('forest_concession_layer_hover', ['==', 'cartodb_id', '']);
        }
      }
    }]
  }
];

export {
  TABS_OPERATORS_DETAIL,
  TABS_DOCUMENTATION_OPERATORS_DETAIL,
  MAP_LAYERS_OPERATORS_DETAIL
};
