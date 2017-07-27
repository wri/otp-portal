import React from 'react';

// Next
import Link from 'next/link';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators, setOperatorsMapLocation, setOperatorsUrl, getOperatorsUrl } from 'modules/operators';

// Constants
import { MAP_LAYERS_OPERATORS } from 'constants/operators';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import Sidebar from 'components/ui/sidebar';
import Spinner from 'components/ui/spinner';
import Map from 'components/map/map';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';

import Table from 'components/ui/table';

class OperatorsPage extends Page {

  static parseData(operators = []) {
    return {
      table: operators.map((o) => {
        const certifications = ['FSC', 'PEFC', 'OLB', '-'];
        const index = Math.floor(Math.random() * certifications.length);

        return {
          id: o.id,
          name: o.name,
          certification: certifications[index],
          observations: (o.observations) ? o.observations.length : 0,
          documentation: HELPERS_DOC.getPercentage(o),
          fmus: (o.fmus) ? o.fmus.length : 0
        };
      }),
      max: Math.max(...operators.map(o => o.observations.length))
    };
  }

  constructor(props) {
    super(props);

    this.state = OperatorsPage.parseData(props.operators.data);
  }

  /* Component Lifecycle */
  componentDidMount() {
    const { url, operators } = this.props;

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }

    // Set location
    this.props.setOperatorsMapLocation(getOperatorsUrl(url));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.operators.data.length !== this.props.operators.data.length) {
      this.setState(OperatorsPage.parseData(nextProps.operators.data));
    }
  }

  /**
   * HELPERS
   * - getOperatorsTable
  */
  getOperatorsTable() {
    const operators = this.props.operators.data;
    if (operators && operators.length) {
      return (
        <Table
          data={this.state.table}
          className="-striped -secondary"
          options={{
            columns: [{
              Header: <span className="sortable">Name</span>,
              accessor: 'name',
              minWidth: 200,
              resizable: false,
              Cell: ({ original }) => {
                return (
                  <Link
                    href={{ pathname: '/operators-detail', query: { id: original.id } }}
                    as={`/operators/${original.id}`}
                  >
                    <a>{original.name}</a>
                  </Link>
                );
              }
            }, {
              Header: <span className="sortable">Observations</span>,
              accessor: 'observations',
              className: '-a-center',
              headerClassName: '-a-center',
              minWidth: 120,
              resizable: false,
              Cell: ({ original }) => {
                let stoplight = '';
                if (original.observations > (this.state.max / 4) * 2) {
                  stoplight = '-red';
                } else if (original.observations > (this.state.max / 4)) {
                  stoplight = '-orange';
                } else {
                  stoplight = '-green';
                }

                return (
                  <div className={`stoplight-dot ${stoplight}`} />
                );
              }
            }, {
              Header: <span className="sortable">FMUs</span>,
              accessor: 'fmus',
              className: '-a-right',
              headerClassName: '-a-right',
              minWidth: 70,
              resizable: false
            }, {
              Header: <span className="sortable">Certification</span>,
              accessor: 'certification',
              minWidth: 100,
              resizable: false
            }, {
              Header: <span className="sortable">Upl. docs (%)</span>,
              accessor: 'documentation',
              minWidth: 130,
              className: '-a-right',
              headerClassName: '-a-right',
              resizable: false
            }],
            pageSize: operators.length,
            pagination: false,
            previousText: '<',
            nextText: '>',
            noDataText: 'No rows found',
            showPageSizeOptions: false,
            onPageChange: page => this.onPageChange(page)
          }}
        />
      );
    }
    return <Spinner isLoading />;
  }

  render() {
    const { url, operators } = this.props;

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        className="-fullscreen"
        footer={false}
        searchList={operators.data}
      >
        <div className="c-section -map">
          <Sidebar>
            {this.getOperatorsTable()}
          </Sidebar>

          <div className="c-map-container">
            {/* Map */}
            <Map
              mapOptions={operators.map}
              mapListeners={{
                moveend: (map) => {
                  this.props.setOperatorsMapLocation({
                    zoom: map.getZoom(),
                    center: map.getCenter()
                  });
                }
              }}
              layers={MAP_LAYERS_OPERATORS}
            />

            {/* MapControls */}
            <MapControls>
              <ZoomControl
                zoom={operators.map.zoom}
                onZoomChange={(zoom) => {
                  this.props.setOperatorsMapLocation({
                    ...operators.map,
                    ...{ zoom }
                  });
                }}
              />
            </MapControls>
          </div>
        </div>
      </Layout>
    );
  }
}

OperatorsPage.propTypes = {
};

export default withRedux(
  store,
  state => ({
    operators: state.operators
  }),
  dispatch => ({
    getOperators() {
      dispatch(getOperators());
    },
    setOperatorsMapLocation(mapLocation) {
      dispatch(setOperatorsMapLocation(mapLocation));
      dispatch(setOperatorsUrl());
    }
  })
)(OperatorsPage);
