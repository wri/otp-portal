import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import isEmpty from 'lodash/isEmpty';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

// Constants
import { MAP_OPTIONS_OPERATORS, MAP_LAYERS_OPERATORS } from 'constants/operators';

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
    const { operators } = this.props;
    if (isEmpty(operators.data)) {
      this.props.getOperators();
    }
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
      >
        <div className="c-section -map">
          <Sidebar>
            <h2>Sidebar</h2>
          </Sidebar>

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
  store,
  state => ({
    operators: state.operators
  }),
  { getOperators }
)(OperatorsPage);
