import React from 'react';
import PropTypes from 'prop-types';

// Next
import Link from 'next/link';

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
import Table from 'components/ui/table';

class OperatorsPage extends Page {

  /* Component Lifecycle */
  componentDidMount() {
    const { url } = this.props;

    // Get operators
    this.props.getOperators();

    // Set location
    this.props.setOperatorsMapLocation(getOperatorsUrl(url));
  }

  /**
   * HELPERS
   * - parseTableData
   * - getMaxObservations
   * - getOperatorsTable
  */

  parseTableData() {
    const operators = this.props.operators.data;

    return operators.map(o => ({
      id: o.id,
      name: o.name,
      observations: (o.observations) ? o.observations.length : 0,
      documentation: (o.documentation) ? o.documentation.length : 'not active',
      fmus: (o.fmus) ? o.fmus.length : 0
    }));
  }

  getMaxObservations(data) {
    const arr = data.map(d => d.observations);
    return Math.max(...arr);
  }

  getOperatorsTable() {
    const operators = this.props.operators.data;
    if (operators && operators.length) {
      // GET the data parsed for the table
      const data = this.parseTableData();

      // Do stuff related to this data
      const maxObservations = this.getMaxObservations(data);

      return (
        <Table
          data={data}
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
                if (original.observations > (maxObservations / 4) * 2) {
                  stoplight = '-red';
                } else if (original.observations > (maxObservations / 4)) {
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
              resizable: false,
              Cell: ({ original }) => {
                const certifications = ['FSC', 'PEFC', 'OLB', '-'];
                const index = Math.floor(Math.random() * certifications.length);
                return certifications[index];
              }
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
    const { url, session } = this.props;

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        session={session}
        className="-fullscreen"
        footer={false}
      >
        <div className="c-section -map">
          <Sidebar>
            {this.getOperatorsTable()}
          </Sidebar>

          <div className="c-map-container">
            <Map
              mapOptions={this.props.operators.map}
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
          </div>
        </div>
      </Layout>
    );
  }
}

OperatorsPage.propTypes = {
  session: PropTypes.object.isRequired
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
