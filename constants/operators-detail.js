import { render } from 'react-dom';
import Popup from 'components/map/popup';

const TABS_OPERATORS_DETAIL = [{
  label: 'Overview',
  value: 'overview'
}, {
  label: 'Documentation',
  value: 'documentation',
  number: '65%'
}, {
  label: 'Observations',
  value: 'observations',
  number: 120
}, {
  label: 'FMUs',
  value: 'fmus',
  number: 7
}];


const TABS_DOCUMENTATION_OPERATORS_DETAIL = [{
  label: 'Documents list',
  value: 'documents-list'
}, {
  label: 'Chronological view',
  value: 'chronological-view'
}];


const MAP_OPTIONS_OPERATORS_DETAIL = {
  zoom: 5,
  center: [18, 0],
  scrollZoom: false
};

const MAP_LAYERS_OPERATORS_DETAIL = [
  {
    id: 'forest_concession',
    provider: 'cartodb',
    source: {
      type: 'geojson',
      data: `${process.env.OTP_API}/fmus?operator_ids={{OPERATOR_ID}}`
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


// TODO: replace this const to an API call
const DOCUMENTATION_OPERATORS_DETAIL = [{
  id: 1,
  title: 'Sample document title lorem ipsum',
  date: 'Oct 2015',
  status: 'valid',
  fmus: 7,
  category: 'Use rights'
}, {
  id: 2,
  title: 'Sample document title lorem ipsum title lorem ipsum title lorem ipsum',
  date: 'Apr 2015',
  status: 'not-valid',
  fmus: 15,
  category: 'Use rights'
}, {
  id: 3,
  title: 'Sample document title lorem',
  date: 'Sep 2015',
  status: 'not-provided',
  fmus: 5,
  category: 'Use rights'
}, {
  id: 4,
  title: 'Sample document title lorem ipsum',
  date: 'Oct 2015',
  status: 'valid',
  fmus: 65,
  category: 'Legal registration'
}, {
  id: 5,
  title: 'Sample document title lorem ipsum title lorem ipsum title lorem ipsum',
  date: 'Apr 2015',
  status: 'not-provided',
  fmus: 15,
  category: 'Legal registration'
}, {
  id: 7,
  title: 'Sample document title lorem',
  date: 'Sep 2015',
  status: 'not-provided',
  fmus: 5,
  category: 'Harvesting'
}, {
  id: 8,
  title: 'Sample document title lorem',
  date: 'Sep 2015',
  status: 'not-provided',
  fmus: 5,
  category: 'Harvesting'
}, {
  id: 9,
  title: 'Sample document title lorem',
  date: 'Sep 2015',
  status: 'not-provided',
  fmus: 5,
  category: 'Forest Management'
}, {
  id: 10,
  title: 'Sample document title lorem',
  date: 'Sep 2015',
  status: 'not-provided',
  fmus: 5,
  category: 'Forest Management'
}];


// TODO: replace this const to an API call
const OBSERVATIONS_OPERATORS_DETAIL = [{
  id: 1,
  title: 'Sample observations title lorem ipsum',
  year: 2017,
  severity: 1,
  category: 'Use rights',
  illegality: 'Harvesting without concession title'
}, {
  id: 2,
  title: 'Sample observations title lorem ipsum title lorem ipsum title lorem ipsum',
  year: 2017,
  severity: 1,
  category: 'Use rights',
  illegality: 'Harvesting without a permit'
}, {
  id: 3,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 3,
  category: 'Use rights',
  illegality: 'Harvesting without concession title'
}, {
  id: 4,
  title: 'Sample observations title lorem ipsum',
  year: 2017,
  severity: 3,
  category: 'Legal registration',
  illegality: 'Harvesting without a permit'
}, {
  id: 5,
  title: 'Sample observations title lorem ipsum title lorem ipsum title lorem ipsum',
  year: 2016,
  severity: 3,
  category: 'Legal registration',
  illegality: 'Harvesting without concession title'
}, {
  id: 7,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 2,
  category: 'Harvesting',
  illegality: 'Harvesting without concession title'
}, {
  id: 8,
  title: 'Sample observations title lorem',
  year: 2015,
  severity: 0,
  category: 'Harvesting',
  illegality: 'Harvesting without a permit'
}, {
  id: 9,
  title: 'Sample observations title lorem',
  year: 2015,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 10,
  title: 'Sample observations title lorem',
  year: 2015,
  severity: 3,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 11,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 3,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 12,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 3,
  category: 'Forest Management',
  illegality: 'Illegal sub-contrating'
}, {
  id: 13,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 1,
  category: 'Forest Management',
  illegality: 'Illegal sub-contrating'
}, {
  id: 14,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 1,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 15,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 16,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 17,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Illegal sub-contrating'
}, {
  id: 18,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Illegal sub-contrating'
}, {
  id: 19,
  title: 'Sample observations title lorem',
  year: 2014,
  severity: 1,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 20,
  title: 'Sample observations title lorem ipsum title lorem ipsum title lorem ipsum',
  year: 2017,
  severity: 1,
  category: 'Use rights',
  illegality: 'Harvesting without concession title'
}, {
  id: 21,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 3,
  category: 'Use rights',
  illegality: 'Harvesting without concession title'
}, {
  id: 22,
  title: 'Sample observations title lorem ipsum',
  year: 2017,
  severity: 3,
  category: 'Legal registration',
  illegality: 'Harvesting without concession title'
}, {
  id: 23,
  title: 'Sample observations title lorem ipsum title lorem ipsum title lorem ipsum',
  year: 2016,
  severity: 3,
  category: 'Legal registration',
  illegality: 'Harvesting without concession title'
}, {
  id: 24,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 2,
  category: 'Harvesting',
  illegality: 'Illegal sub-contrating'
}, {
  id: 25,
  title: 'Sample observations title lorem',
  year: 2015,
  severity: 0,
  category: 'Harvesting',
  illegality: 'Illegal sub-contrating'
}, {
  id: 26,
  title: 'Sample observations title lorem',
  year: 2015,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 27,
  title: 'Sample observations title lorem',
  year: 2015,
  severity: 3,
  category: 'Forest Management',
  illegality: 'Infraction title a'
}, {
  id: 28,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 3,
  category: 'Forest Management',
  illegality: 'Infraction title a'
}, {
  id: 29,
  title: 'Sample observations title lorem',
  year: 2013,
  severity: 3,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 30,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 1,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 31,
  title: 'Sample observations title lorem',
  year: 2017,
  severity: 1,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 32,
  title: 'Sample observations title lorem',
  year: 2016,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 33,
  title: 'Sample observations title lorem',
  year: 2013,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 34,
  title: 'Sample observations title lorem',
  year: 2013,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}, {
  id: 35,
  title: 'Sample observations title lorem',
  year: 2013,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Infraction title a'
}, {
  id: 36,
  title: 'Sample observations title lorem',
  year: 2014,
  severity: 0,
  category: 'Forest Management',
  illegality: 'Harvesting without concession title'
}];

export {
  TABS_OPERATORS_DETAIL,
  TABS_DOCUMENTATION_OPERATORS_DETAIL,
  DOCUMENTATION_OPERATORS_DETAIL,
  OBSERVATIONS_OPERATORS_DETAIL,
  MAP_OPTIONS_OPERATORS_DETAIL,
  MAP_LAYERS_OPERATORS_DETAIL
};
