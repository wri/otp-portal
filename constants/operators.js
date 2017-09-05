import { render } from 'react-dom';
import Popup from 'components/map/popup';

const MAP_LAYERS_OPERATORS = [
  // RASTER LAYERS (LOSS & GAIN)
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
      name: 'Tree cover loss',
      type: 'raster',
      source: 'loss',
      minzoom: 0,
      legendConfig: {
        type: 'basic',
        items: [
          { name: 'Tree cover loss', color: '#FF6699' }
        ]
      },
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
      name: 'Tree cover gain',
      type: 'raster',
      source: 'gain',
      minzoom: 0,
      legendConfig: {
        type: 'basic',
        items: [
          { name: 'Tree cover gain', color: '#6D6DE5' }
        ]
      },
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

  // PROTECTED AREAS
  // {
  //   id: 'protected_areas',
  //   provider: 'cartodb',
  //   cartodb: {
  //     account: 'wri-01',
  //     minzoom: 0,
  //     maxzoom: 20,
  //     version: '1.3.0',
  //     stat_tag: 'API',
  //     layers: [
  //       {
  //         type: 'cartodb',
  //         options: {
  //           sql: 'SELECT the_geom_webmercator, the_geom,iucn_cat, desig_eng, iso3 as country, name, wdpaid as id, wdpa_protected_areas as layer FROM wdpa_protected_areas',
  //           cartocss: '#wdpa_protected_areas { polygon-opacity: 0.5; polygon-fill: #5ca2d1; line-width: 0.2; line-opacity: 1;}',
  //           // cartocss: '#wdpa_protected_areas { polygon-opacity: 0.5; line-width: 0.2; line-opacity: 1;}#wdpa_protected_areas[iucn_cat="Ia"] { polygon-fill: #5ca2d1; line-color: #5ca2d1;}#wdpa_protected_areas[iucn_cat="Ib"] { polygon-fill: #3e7bb6; line-color: #3e7bb6;}#wdpa_protected_areas[iucn_cat="II"] { polygon-fill: #0f3b82; line-color: #0f3b82;}#wdpa_protected_areas[iucn_cat="III"] { polygon-fill: #c9ddff; line-color: #c9ddff;}#wdpa_protected_areas[iucn_cat="IV"] { polygon-fill: #b9b2a1; line-color: #b9b2a1;}#wdpa_protected_areas[iucn_cat="V"] { polygon-fill: #ae847e; line-color: #ae847e;}#wdpa_protected_areas[iucn_cat="VI"] { polygon-fill: #daa89b; line-color: #daa89b;}#wdpa_protected_areas[iucn_cat="Not Applicable"] { polygon-fill: #eed54c; line-color: #eed54c;}#wdpa_protected_areas[iucn_cat="Not Assigned"] { polygon-fill: #e7ab36; line-color: #e7ab36;}#wdpa_protected_areas[iucn_cat="Not Reported"] { polygon-fill: #fa894b; line-color: #fa894b;}',
  //           cartocss_version: '2.3.0'
  //         }
  //       }
  //     ]
  //
  //   },
  //   source: {
  //     type: 'raster',
  //     tiles: [
  //       // to be loaded
  //     ],
  //     tileSize: 256
  //   },
  //   layers: [{
  //     id: 'protected_areas_layer',
  //     name: 'Protected areas',
  //     type: 'raster',
  //     source: 'protected_areas',
  //     before: ['loss_layer', 'gain_layer', 'forest_concession_layer', 'forest_concession_layer_hover'],
  //     minzoom: 0,
  //     legendConfig: {
  //       type: 'basic',
  //       items: [
  //         { name: 'Protected areas', color: '#5ca2d1' }
  //       ]
  //     },
  //     paint: {
  //       'raster-opacity': 1,
  //       'raster-hue-rotate': 0,
  //       'raster-brightness-min': 0,
  //       'raster-brightness-max': 1,
  //       'raster-saturation': 0,
  //       'raster-contrast': 0
  //     }
  //   }]
  // },

  {
    id: 'protected_areas',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: `https://simbiotica.carto.com/api/v2/sql?q=${encodeURIComponent('SELECT * FROM wdpa_protected_areas WHERE iso3 IN (\'COG\', \'COD\')')}&format=geojson`,
        method: 'GET'
      }
    },
    layers: [{
      id: 'protected_areas_layer',
      name: 'Protected areas',
      type: 'fill',
      source: 'protected_areas',
      before: ['loss_layer', 'gain_layer', 'forest_concession_layer', 'forest_concession_layer_hover'],
      minzoom: 0,
      legendConfig: {
        type: 'basic',
        items: [
          { name: 'Protected areas', color: '#5ca2d1' }
        ]
      },
      paint: {
        'fill-color': '#5ca2d1',
        'fill-opacity': 0.4,
        'fill-outline-color': '#5ca2d1'
      }
    }]
  },

  // FMUS
  {
    id: 'forest_concession',
    provider: 'geojson',
    source: {
      type: 'geojson',
      data: {
        url: `${process.env.OTP_API}/fmus?country_ids=7,47`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'OTP-API-KEY': process.env.OTP_API_KEY
        }
      }
    },
    layers: [{
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
      name: 'Forest managment units',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      legendConfig: {
        type: 'basic',
        items: [
          { name: 'FMUs', color: '#e98300' }
        ]
      },
      before: ['loss_layer', 'gain_layer'],
      paint: {
        'fill-color': '#e98300',
        'fill-opacity': 0.4,
        'fill-outline-color': '#d07500'
      },
      fitBounds: true,
      interactivity: {
        click(e) {
          // Remove always the popup if exists and you are using 'closeOnClick'
          // You will prevent a bug that doesn't show the popup again
          this.popup && this.popup.remove();
          this.popup = new this.Popup();

          const props = e.features[0].properties;
          this.popup.setLngLat(e.lngLat)
            .setDOMContent(
            render(
              Popup({
                title: props.fmu_name,
                operator: {
                  id: props.operator_id,
                  name: props.company_na
                },
                list: [{
                  label: 'Company',
                  value: props.company_na
                }, {
                  label: 'CCF status',
                  value: props.ccf_status
                }, {
                  label: 'Type',
                  value: props.fmu_type
                }]
              }),
              window.document.createElement('div')
            )
            )
            .addTo(this.map);
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
  // {
  //   id: 'harvestable_areas',
  //   provider: 'geojson',
  //   source: {
  //     type: 'geojson',
  //     data: `${process.env.OTP_API}/harvestable_areas?country_ids=7,47`
  //     data: `https://simbiotica.carto.com/api/v2/sql?q=${encodeURIComponent('SELECT * FROM harvestable_areas')}&format=geojson`
  //   },
  //   layers: [{
  //     id: 'harvestable_areas_layer',
  //     type: 'fill',
  //     source: 'harvestable_areas',
  //     layout: {},
  //     paint: {
  //       'fill-color': '#005b23',
  //       'fill-opacity': 0.8,
  //       'fill-outline-color': '#004219'
  //     },
  //     interactivity: {
  //       click(e) {
  //         // Remove always the popup if exists and you are using 'closeOnClick'
  //         this.popup && this.popup.remove();
  //         this.popup = new this.Popup();
  //
  //         const props = e.features[0].properties;
  //
  //         this.popup.setLngLat(e.lngLat)
  //           .setDOMContent(
  //             render(
  //               Popup({
  //                 title: props.num_ccf,
  //                 list: []
  //               }),
  //               window.document.createElement('div')
  //             )
  //           )
  //           .addTo(this.map);
  //       }
  //     }
  //   }]
  // }
];

export { MAP_LAYERS_OPERATORS };
