import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getObservations } from 'modules/observations';


class ObservationsPage extends Page {

  componentDidMount() {
    const { observations } = this.props;
    if (isEmpty(observations.data)) {
      this.props.getObservations();
    }
  }

  render() {
    const { url, session, observations } = this.props;
    console.info(observations);

    return (
      <Layout
        title="Observations"
        description="Observations description..."
        url={url}
        session={session}
      >
        <StaticHeader
          title="Observations"
          background="/static/images/static-header/bg-help.jpg"
        />
        <div className="c-section">
          <div className="l-container">
            <div className="row custom-row">
              <div className="columns small-12 medium-4">
                {/* Filters */}
              </div>

              <div className="columns small-12 medium-6 medium-offset-1">
                {/* Overview by category graphs */}
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* Observations details */}
        </div>
      </Layout>
    );
  }
}

ObservationsPage.propTypes = {
  session: PropTypes.object.isRequired
};

export default withRedux(
  store,
  state => ({
    observations: state.observations
  }),
  { getObservations }
)(ObservationsPage);
