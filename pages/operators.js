import React from 'react';
import sortBy from 'lodash/sortBy';

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
import Icon from 'components/ui/icon';
import Map from 'components/map/map';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import OperatorsRanking from 'components/operators/ranking';

class OperatorsPage extends Page {

  static parseData(operators = []) {
    return {
      sortColumn: 'documentation',
      sortDirection: -1,
      table: operators.map(o => ({
        id: o.id,
        name: o.name,
        certification: o.certification,
        score: o.score || 0,
        obs_per_visit: o['obs-per-visit'] || 0,
        documentation: HELPERS_DOC.getPercentage(o),
        fmus: (o.fmus) ? o.fmus.length : 0
      })),
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
   * UI EVENTS
   * - sortBy
  */
  sortBy = (column) => {
    this.setState({
      sortColumn: column,
      sortDirection: this.state.sortDirection * -1
    });
  }

  /**
   * HELPERS
   * - getOperatorsTable
   * - getOperatorsRanking
  */
  getOperatorsTable() {
    const operators = this.props.operators;
    const { sortColumn, sortDirection, table } = this.state;

    if (!operators.loading) {
      return (
        <div className="c-ranking">
          <table>
            <thead>
              <tr>
                <th className="-ta-left">Name</th>
                <th className="-ta-center">Observations/Visit</th>
                <th>FMUs</th>
                <th>Certification</th>
                <th
                  className="td-documentation -ta-center -sort"
                  onClick={() => { this.sortBy('documentation'); }}
                >
                  Upl. docs (%)
                  {sortDirection === -1 && <Icon name="icon-arrow-down" className="-tiny" />}
                  {sortDirection === 1 && <Icon name="icon-arrow-up" className="-tiny" />}
                </th>
                <th />
              </tr>
            </thead>

            <tbody>
              {sortBy(table, o => sortDirection * o[sortColumn]).map((r, i) => {
                return (
                  <tr key={r.id}>
                    <td className="-ta-left">
                      <Link
                        href={{ pathname: '/operators-detail', query: { id: r.id } }}
                        as={`/operators/${r.id}`}
                      >
                        <a>{r.name}</a>
                      </Link>
                    </td>
                    <td className="-ta-center">
                      {!!r.obs_per_visit && r.obs_per_visit}
                      {!r.obs_per_visit &&
                        <div className="stoplight-dot -state-0}" />
                      }
                    </td>
                    <td className="-ta-right"> {r.fmus} </td>
                    <td>
                      {!!r.certification && r.certification}
                      {!r.certification && '-'}
                    </td>
                    <td
                      id={`td-documentation-${r.id}`}
                      className="td-documentation -ta-right"
                    >
                      {r.documentation}%
                    </td>

                    {i === 0 &&
                      <td className="-ta-center" rowSpan={table.length}>
                        <OperatorsRanking
                          key={`update-${r.id}`}
                          data={table.map(o => ({ id: o.id, value: o.documentation }))}
                          sortDirection={sortDirection}
                        />
                      </td>
                    }
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
