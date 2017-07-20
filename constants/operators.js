import { render } from 'react-dom';
import Popup from 'components/map/popup';

const MAP_LAYERS_OPERATORS = [
  {
    id: 'forest_concession',
    provider: 'cartodb',
    source: {
      type: 'geojson',
      data: `${process.env.OTP_API}/fmus?country_ids=7,47`
      // data: `https://simbiotica.carto.com/api/v2/sql?q=${encodeURIComponent('SELECT * FROM forest_concession')}&format=geojson`
    },
    layers: [{
      id: 'forest_concession_layer_hover',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      paint: {
        'fill-color': '#d07500',
        'fill-opacity': 0.8,
        'fill-outline-color': '#d07500'
      },
      filter: ['==', 'cartodb_id', '']
    }, {
      id: 'forest_concession_layer',
      type: 'fill',
      source: 'forest_concession',
      layout: {},
      paint: {
        'fill-color': '#e98300',
        'fill-opacity': 0.8,
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
  // ,
  //
  //
  // {
  //   id: 'harvestable_areas',
  //   provider: 'cartodb',
  //   source: {
  //     type: 'geojson',
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
  //       },
  //       mouseenter() {
  //         this.map.getCanvas().style.cursor = 'pointer';
  //         this.map.setFilter('harvestable_areas_layer_hover', ['==', 'cartodb_id', '']);
  //       },
  //       mousemove(e) {
  //         this.map.getCanvas().style.cursor = 'pointer';
  //         this.map.setFilter('harvestable_areas_layer_hover', ['==', 'cartodb_id', e.features[0].properties.cartodb_id]);
  //       },
  //       mouseleave() {
  //         this.map.getCanvas().style.cursor = '';
  //         this.map.setFilter('harvestable_areas_layer_hover', ['==', 'cartodb_id', '']);
  //       }
  //     }
  //   }, {
  //     id: 'harvestable_areas_layer_hover',
  //     type: 'fill',
  //     source: 'harvestable_areas',
  //     layout: {},
  //     paint: {
  //       'fill-color': '#004219'
  //     },
  //     filter: ['==', 'cartodb_id', '']
  //   }]
  // }
];

export { MAP_LAYERS_OPERATORS };
