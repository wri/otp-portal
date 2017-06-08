import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Filters from 'components/ui/filters';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getObservations, getFilters, setFilters, setObservationsUrl, getObservationsUrl } from 'modules/observations';


class ObservationsPage extends Page {

  componentDidMount() {
    const { observations, url } = this.props;

    if (isEmpty(observations.data)) {
      this.props.getObservations();
    }

    if (isEmpty(observations.filters.data)) {
      this.props.getFilters();
    }

    this.props.getObservationsUrl(url);
  }

  render() {
    const { url, session, observations } = this.props;
    console.info(observations.filters);

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
                <Filters
                  // options={[]}
                  filters={observations.filters.data}
                  setFilters={this.props.setFilters}
                />
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
  session: PropTypes.object.isRequired,
  observations: PropTypes.object,
  filters: PropTypes.object
};

export default withRedux(
  store,
  state => ({
    observations: state.observations
  }),
  dispatch => ({
    getObservations,
    getFilters,
    getObservationsUrl(url) { dispatch(getObservationsUrl(url)); },
    setFilters(filter) {
      dispatch(setFilters(filter));
      dispatch(setObservationsUrl());
    }
  })
)(ObservationsPage);
