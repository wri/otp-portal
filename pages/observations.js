import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';


// Selectors
import { getParsedObservations } from 'selectors/observations/observations';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Overview from 'components/observations/overview';
import Table from 'components/ui/table';
import Filters from 'components/ui/filters';
import Spinner from 'components/ui/spinner';
import StaticTabs from 'components/ui/static-tabs';

// Utils
import {
  getObservations,
  getFilters,
  setFilters,
  setObservationsUrl,
  getObservationsUrl
} from 'modules/observations';

// Constants
import { FILTERS_REFS, TABS_OBSERVATIONS } from 'constants/observations';


class ObservationsPage extends Page {
  constructor(props) {
    super(props);

    this.state = {
      tab: 'observations-list',
      page: 1
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  componentDidMount() {
    const { observations, operators, url } = this.props;
    if (isEmpty(observations.data)) {
      this.props.getObservations();
    }

    if (isEmpty(observations.filters.options)) {
      this.props.getFilters();
    }

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }

    this.props.getObservationsUrl(url);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.observations.filters.data, nextProps.observations.filters.data)) {
      this.props.getObservations(1);
    }
  }

  parseTableData() {
    return this.props.observations.data.map(o => (
      {
        date: new Date(o['publication-date']).getFullYear(),
        country: o.country && o.country.iso,
        operator: o.operator && o.operator.name,
        category: o.subcategory.category.name,
        observation: o.details,
        level: o.severity && o.severity.level
      }
    ));
  }

  onPageChange(page) {
    this.setState({ page: page + 1 }, () => {
      this.props.getObservations(page + 1);
    });
  }

  render() {
    const { url, observations, parsedObservations } = this.props;

    return (
      <Layout
        title="Observations"
        description="Observations description..."
        url={url}
        searchList={this.props.operators.data}
      >
        <StaticHeader
          title="Observations"
          background="/static/images/static-header/bg-observations.jpg"
        />
        <div className="c-section">
          <div className="l-container">
            <div className="row l-row">
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
                <Overview
                  parsedObservations={parsedObservations}
                />
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

          <div className="c-section -relative">
            <div className="l-container">
              <Spinner isLoading={observations.loading} className="" />

              {this.state.tab === 'observations-list' &&
                <Table
                  sortable
                  data={this.parseTableData()}
                  options={{
                    pageSize: observations.data.length ? 50 : 0,
                    pagination: true,
                    previousText: '<',
                    nextText: '>',
                    noDataText: 'No rows found',
                    showPageSizeOptions: false,
                    // Api pagination & sort
                    // pages: observations.totalSize,
                    // page: this.state.page - 1,
                    // manual: true
                    onPageChange: page => this.onPageChange(page)
                  }}
                />
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
  observations: PropTypes.object,
  filters: PropTypes.object
};

export default withRedux(
  store,
  state => ({
    observations: state.observations,
    parsedObservations: getParsedObservations(state),
    operators: state.operators
  }),
  dispatch => ({
    getOperators() {
      dispatch(getOperators());
    },
    getObservations() {
      dispatch(getObservations());
    },
    getFilters() {
      dispatch(getFilters());
    },
    getObservationsUrl(url) {
      dispatch(getObservationsUrl(url));
    },
    setFilters(filter) {
      dispatch(setFilters(filter));
      dispatch(setObservationsUrl());
    }
  })
)(ObservationsPage);
