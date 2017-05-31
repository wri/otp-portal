import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Constants
import { MAP_OPTIONS_OPERATORS, MAP_LAYERS_OPERATORS } from 'constants/operators';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';

const Map = dynamic(
  import('components/map/map'),
  { ssr: false }
);


class OperatorsPage extends Page {

  render() {
    const { url, session } = this.props;

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        session={session}
        className="-fullscreen"
      >
        <div className="c-section -map">
          <div className="c-sidebar"></div>
          <div className="c-map-container">
            <Map
              mapOptions={MAP_OPTIONS_OPERATORS}
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
  store
)(OperatorsPage);
