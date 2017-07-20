import React from 'react';
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
  label: 'Operator documents',
  value: 'operator-documents'
}, {
  label: 'FMUs documents',
  value: 'fmus-documents'
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


const TABLE_HEADERS_ILLEGALITIES = [
  {
    Header: <span className="sortable">date</span>,
    accessor: 'date',
    headerClassName: '-a-left',
    className: '-a-left',
    minWidth: 75,
    Cell: (attr) => {
      const date = new Date(attr.value);
      const monthName = date ? date.toLocaleString('en-us', { month: 'short' }) : '-';
      const year = date ? date.getFullYear() : '-';
      return <span>{`${monthName} ${year}`}</span>;
    }
  },
  {
    Header: <span className="sortable">Severity</span>,
    accessor: 'severity',
    headerClassName: '-a-center',
    className: '-a-left severity',
    minWidth: 150,
    Cell: attr => <span className={`severity-item -sev-${attr.value}`}>{attr.value}</span>
  },
  {
    Header: <span>Description</span>,
    accessor: 'details',
    headerClassName: '-a-left',
    className: 'description',
    sortable: false,
    minWidth: 420,
    Cell: attr => <p>{attr.value}</p>
  },
  // not ready
  {
    Header: <span>Evidences</span>,
    accessor: 'documents',
    sortable: false,
    headerClassName: '-a-left',
    minWidth: 150,
    Cell: attr => <a className="evidence-link" href={attr.link || '#'} target="_blank"rel="noopener noreferrer">document sample</a>
  }
];

export {
  TABS_OPERATORS_DETAIL,
  TABS_DOCUMENTATION_OPERATORS_DETAIL,
  MAP_OPTIONS_OPERATORS_DETAIL,
  MAP_LAYERS_OPERATORS_DETAIL,
  TABLE_HEADERS_ILLEGALITIES
};
