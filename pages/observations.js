import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Table from 'components/ui/table';
import Filters from 'components/ui/filters';
import StaticTabs from 'components/ui/static-tabs';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';

// Utils
import {
  getObservations,
  getFilters,
  setFilters,
  setObservationsUrl,
  getObservationsUrl
} from 'modules/observations';

// Constants
import { FILTERS_REFS } from 'constants/observations';

// Constants
import { TABS_OBSERVATIONS } from 'constants/observations';


class ObservationsPage extends Page {
  constructor(props) {
    super(props);

    this.state = {
      tab: 'observations-list'
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  componentDidMount() {
    const { observations, url } = this.props;

    if (isEmpty(observations.data)) {
      this.props.getObservations();
    }

    if (isEmpty(observations.filters.options)) {
      this.props.getFilters();
    }

    this.props.getObservationsUrl(url);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  render() {
    const { url, session, observations } = this.props;

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
                  options={observations.filters.options}
                  filters={observations.filters.data}
                  setFilters={this.props.setFilters}
                  filtersRefs={FILTERS_REFS}
                />
              </div>

              <div className="columns small-12 medium-6 medium-offset-1">
                {/* Overview by category graphs */}
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* Observations table details */}
          <StaticTabs
            options={TABS_OBSERVATIONS}
            defaultSelected={this.state.tab}
            onChange={this.triggerChangeTab}
          />

          <div className="c-section">
            <div className="l-container">
              {this.state.tab === 'observations-list' &&
                <Table />
              }

              {this.state.tab === 'map' &&
                <div>Map</div>
              }

            </div>
          </div>
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
    getFilters() { dispatch(getFilters()); },
    getObservationsUrl(url) { dispatch(getObservationsUrl(url)); },
    setFilters(filter) {
      dispatch(setFilters(filter));
      dispatch(setObservationsUrl());
    }
  })
)(ObservationsPage);
