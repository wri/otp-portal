import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Tabs from 'components/ui/tabs';
import Table from 'components/ui/table';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getObservations } from 'modules/observations';

// Constants
import { TABS_OBSERVATIONS } from 'constants/observations';


class ObservationsPage extends Page {

  componentDidMount() {
    const { observations } = this.props;
    if (isEmpty(observations.data)) {
      this.props.getObservations();
    }
  }

  render() {
    const { url, session, observations } = this.props;
    const tab = url.query.tab || 'observations-list';
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
          {/* Observations table details */}
          <Tabs
            href={{
              pathname: url.pathname,
              query: {},
              as: url.pathname
            }}
            options={TABS_OBSERVATIONS}
            defaultSelected={tab}
            selected={tab}
            collapse
          />

          {tab === 'observations-list' &&
            <Table />
          }

          {tab === 'map' &&
            <div>Map</div>
          }
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
