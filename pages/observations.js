import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import capitalize from 'lodash/capitalize';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Selectors
import { getParsedChartObservations } from 'selectors/observations/parsed-chart-observations';
import { getParsedTableObservations } from 'selectors/observations/parsed-table-observations';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Overview from 'components/observations/overview';
import Table from 'components/ui/table';
import Filters from 'components/ui/filters';
import Spinner from 'components/ui/spinner';
import StaticTabs from 'components/ui/static-tabs';
import { ReadMore } from 'react-read-more';
import Icon from 'components/ui/icon';
import CheckboxGroup from 'components/form/CheckboxGroup';

// Utils
import {
  getObservations,
  getFilters,
  setFilters,
  setObservationsUrl,
  getObservationsUrl,
  setActiveColumns
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

    this.props.getObservationsUrl(url);

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
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.observations.filters.data, nextProps.observations.filters.data)) {
      this.props.getObservations();
    }
  }

  getPageSize() {
    const { observations } = this.props;

    if (observations.data.length) {
      // What if the page only have 5 results...
      return observations.data.length > 50 ? 50 : observations.data.length;
    }

    return 1;
  }

  onPageChange(page) {
    this.setState({ page: page + 1 }, () => {
      this.props.getObservations(page + 1);
    });
  }

  render() {
    const { url, observations, parsedChartObservations, parsedTableObservations } = this.props;

    // Hard coded values
    const inputs = ['date', 'country', 'operator', 'fmu', 'category', 'observation', 'level', 'report'];
    const changeOfLabelLookup = {
      operator: 'Producer',
      fmu: 'FMU',
      observation: 'Detail',
      level: 'Severity'
    };

    const tableOptions = inputs
      .map(column => ({
        label: Object.keys(changeOfLabelLookup).includes(column) ? changeOfLabelLookup[column] :
          capitalize(column),
        value: column
      }));

    const columnHeaders = [
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'date' })}</span>,
        accessor: 'date',
        minWidth: 75
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'country' })}</span>,
        accessor: 'country',
        className: '-uppercase',
        minWidth: 100
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'operator' })}</span>,
        accessor: 'operator',
        className: '-uppercase description',
        minWidth: 120
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'fmu' })}</span>,
        accessor: 'fmu',
        className: 'description',
        minWidth: 120
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'category' })}</span>,
        accessor: 'category',
        headerClassName: '-a-left',
        className: 'description',
        minWidth: 120
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'detail' })}</span>,
        accessor: 'observation',
        headerClassName: '-a-left',
        className: 'description',
        minWidth: 250,
        Cell: attr => (
          <ReadMore lines={1} text="more">
            {attr.value}
          </ReadMore>
        )
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'severity' })}</span>,
        accessor: 'level',
        headerClassName: 'severity-th',
        className: 'severity',
        Cell: attr => <span className={`severity-item -sev-${attr.value}`}>{attr.value}</span>
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'report' })}</span>,
        accessor: 'report',
        headerClassName: '',
        className: 'report',
        Cell: attr =>
          <div className="report-item-wrapper">
            { attr.value ?
              <a href={attr.value} className="report-item">
                <Icon className="" name="icon-file-empty" />
              </a>
            :
              <span className="report-item-text">-</span>
          }
          </div>
      }
    ];

    return (
      <Layout
        title="Observations"
        description="Observations description..."
        url={url}
        searchList={this.props.operators.data}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'observations' })}
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
                  parsedObservations={parsedChartObservations}
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          {/* Observations table details */}
          <StaticTabs
            options={
              TABS_OBSERVATIONS.map(tab => ({ ...tab, ...{ label: this.props.intl.formatMessage({ id: tab.labelKey }) } }))
            }
            defaultSelected={this.state.tab}
            onChange={this.triggerChangeTab}
          />

          <div className="c-section -relative">
            <div className="l-container">
              <Spinner isLoading={observations.loading} className="" />
              <div className="c-field -fluid -valid">
                <CheckboxGroup
                  className="-inline -small -single-row"
                  name="observations-columns"
                  onChange={value => this.props.setActiveColumns(value)}
                  properties={{ default: observations.columns, name: 'observations-columns' }}
                  options={tableOptions}
                />
              </div>

              {this.state.tab === 'observations-list' &&
                <Table
                  sortable
                  data={parsedTableObservations}
                  options={{
                    columns: columnHeaders.filter(header => observations.columns.includes(header.accessor)),
                    pageSize: this.getPageSize(),
                    pagination: true,
                    previousText: '<',
                    nextText: '>',
                    noDataText: 'No rows found',
                    showPageSizeOptions: false,
                    // Api pagination & sort
                    // pages: observations.totalSize,
                    // page: this.state.page - 1,
                    // manual: true
                    onPageChange: page => this.onPageChange(page),
                    defaultSorted: [{
                      id: 'date',
                      desc: false
                    }]
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
  filters: PropTypes.object,
  intl: intlShape.isRequired
};

export default withIntl(withRedux(
  store,
  state => ({
    observations: state.observations,
    parsedChartObservations: getParsedChartObservations(state),
    parsedTableObservations: getParsedTableObservations(state),
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
    },
    setActiveColumns(activeColumns) {
      dispatch(setActiveColumns(activeColumns));
    }
  })
)(ObservationsPage));
