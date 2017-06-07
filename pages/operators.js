import React from 'react';
import PropTypes from 'prop-types';

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
import Map from 'components/map/map';

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
   * - getOperatorsTable
  */
  getOperatorsTable() {
    const { operators } = this.props.operators.data;
    if (operators) {
      return (
        <ul>
          {Object.keys(operators).map(o =>
            <li key={o}>{operators[o].attributes.name}</li>
          )}
        </ul>
      );
    }
    return null;
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
            <h2>Sidebar</h2>
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
