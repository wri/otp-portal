import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Next
import Router from 'next/router';
import dynamic from 'next/dynamic';

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

const Map = dynamic(
  import('components/map/map'),
  { ssr: false }
);

class OperatorsPage extends Page {

  componentDidMount() {
    const { operators, url } = this.props;
    if (isEmpty(operators.data)) {
      this.props.getOperators();
    }

    const location = this.props.getOperatorsUrl(url);
    this.props.setOperatorsMapLocation(location);
  }

  render() {
    const { url, session } = this.props;

    const MAP_LISTENERS_OPERATORS = {
      moveend: (map) => {
        this.props.setOperatorsMapLocation({
          zoom: map.getZoom(),
          center: map.getCenter()
        });
      }
    };

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        session={session}
        className="-fullscreen"
      >
        <div className="c-section -map">
          <Sidebar>
            <h2>Sidebar</h2>
          </Sidebar>

          <div className="c-map-container">
            <Map
              mapOptions={this.props.operators.map}
              mapListeners={MAP_LISTENERS_OPERATORS}
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
    getOperators,
    getOperatorsUrl,
    setOperatorsMapLocation(mapLocation) {
      dispatch(setOperatorsMapLocation(mapLocation));
      dispatch(setOperatorsUrl());
    }
  })
)(OperatorsPage);
