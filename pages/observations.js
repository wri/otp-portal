import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Overview from 'components/observations/overview';
import Table from 'components/ui/table';
import Filters from 'components/ui/filters';
import Spinner from 'components/ui/spinner';
import StaticTabs from 'components/ui/static-tabs';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

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

  componentWillMount() {
    const { operators } = this.props;
    if (!operators || !operators.data || !operators.data.length) {
      // Get operators
      this.props.getOperators();
    }
  }

  componentDidMount() {
    const { observations, url } = this.props;
    if (isEmpty(observations.data)) {
      this.props.getObservations(1);
    }

    if (isEmpty(observations.filters.options)) {
      this.props.getFilters();
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

  getCategories(annexOperator, annexGovernance) {
    const operatorCategories = annexOperator && annexOperator.categories ?
      annexOperator.categories.map(c => c && c.name ? c.name : '') : [];
    const governanceCategories = annexGovernance && annexGovernance.categories ?
      annexGovernance.categories.map(c => c && c.name ? c.name : '') : [];

    return [...operatorCategories, ...governanceCategories];
  }

  parseTableData() {
    const getCategories = (annexOperator, annexGovernance) => (
      this.getCategories(annexOperator, annexGovernance)
    );

    return this.props.observations.data.map(o => (
      {
        date: new Date(o['publication-date']).getFullYear(),
        country: o.country && o.country.iso,
        operator: o.operator && o.operator.name,
        fmu: 'N/A',
        category: getCategories(o['annex-operator'], o['annex-governance']).join(', '),
        observation: o.details,
        level: 2
      }
    ));
  }

  onPageChange(page) {
    this.setState({ page: page + 1 }, () => {
      this.props.getObservations(page + 1);
    });
  }

  render() {
    const { url, session, observations } = this.props;

    return (
      <Layout
        title="Observations"
        description="Observations description..."
        url={url}
        session={session}
        searchList={this.props.operators.data}
      >
        <StaticHeader
          title="Observations"
          background="/static/images/static-header/bg-observations.jpg"
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
                <Overview />
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
                  data={this.parseTableData()}
                  options={{
                    pageSize: observations.data.length ? 10 : 0,
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
  session: PropTypes.object.isRequired,
  observations: PropTypes.object,
  filters: PropTypes.object
};

export default withRedux(
  store,
  state => ({
    observations: state.observations,
    operators: state.operators
  }),
  dispatch => ({
    getOperators() { dispatch(getOperators()); },
    getObservations(page) { dispatch(getObservations(page)); },
    getFilters() { dispatch(getFilters()); },
    getObservationsUrl(url) { dispatch(getObservationsUrl(url)); },
    setFilters(filter) {
      dispatch(setFilters(filter));
      dispatch(setObservationsUrl());
    }
  })
)(ObservationsPage);
