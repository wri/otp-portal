import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import difference from 'lodash/difference';
import capitalize from 'lodash/capitalize';

// Redux
import { connect } from 'react-redux';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Selectors
import { getParsedChartObservations } from 'selectors/observations/parsed-chart-observations';
import { getParsedTableObservations } from 'selectors/observations/parsed-table-observations';

// Components
import Layout from 'components/layout/layout';
import Overview from 'components/observations/overview';
import CheckboxGroup from 'components/form/CheckboxGroup';
import StaticHeader from 'components/ui/static-header';
import Table from 'components/ui/table';
import Filters from 'components/ui/filters';
import Spinner from 'components/ui/spinner';
import ReadMore from 'components/ui/read-more';
import Icon from 'components/ui/icon';
import MapSubComponent from 'components/ui/map-sub-component';

// Utils
import {
  getObservations,
  getFilters,
  setFilters,
  setObservationsUrl,
  getObservationsUrl,
  setActiveColumns
} from 'modules/observations';
import { logEvent } from 'utils/analytics';

// Constants
import { FILTERS_REFS } from 'constants/observations';


class ObservationsPage extends React.Component {
  static async getInitialProps({ url, store }) {
    const { observations } = store.getState();

    if (isEmpty(observations.data)) {
      await store.dispatch(getObservations());
    }

    if (isEmpty(observations.filters.options)) {
      await store.dispatch(getFilters());
    }

    return { url };
  }

  constructor(props) {
    super(props);

    this.state = {
      tab: 'observations-list',
      page: 1
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  componentDidMount() {
    const { url } = this.props;

    this.props.getObservationsUrl(url);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.observations.filters.data, nextProps.observations.filters.data)) {
      this.props.getObservations();
    }
  }

  onPageChange(page) {
    this.setState({ page: page + 1 }, () => {
      this.props.getObservations(page + 1);
    });
  }

  getPageSize() {
    const { observations } = this.props;

    if (observations.data.length) {
      // What if the page only have 5 results...
      return observations.data.length > 50 ? 50 : observations.data.length;
    }

    return 1;
  }

  setActiveColumns(value) {
    const { observations } = this.props;
    const addColumn = difference(value, observations.columns);
    const removeColumn = difference(observations.columns, value);

    if (addColumn.length) logEvent('Observations', 'Add Column', addColumn[0]);
    if (removeColumn.length) logEvent('Observations', 'Remove Column', removeColumn[0]);

    this.props.setActiveColumns(value);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  // eslint-disable-next-line no-undef
  logFilter = (action, label) => {
    logEvent('Observations', action, label);
  }

  render() {
    const { url, observations, parsedChartObservations, parsedTableObservations } = this.props;
    // Hard coded values
    const inputs = [
      'category',
      'country',
      'date',
      'evidence',
      'fmu',
      'level',
      'litigation-status',
      'location',
      'observation',
      'observer-organizations',
      'observer-types',
      'operator-type',
      'operator',
      'report',
      'subcategory'
    ];

    const changeOfLabelLookup = {
      'litigation-status': 'Litigation Status',
      'observer-organizations': 'Observer Organizations',
      'observer-types': 'Observer Types',
      'operator-type': 'Operator Type',
      fmu: 'FMU',
      level: 'Severity',
      observation: 'Detail',
      operator: 'Producer'
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
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'observer-types' })}</span>,
        accessor: 'observer-types',
        headerClassName: '-a-left',
        className: 'observer-types',
        minWidth: 250,
        Cell: attr => <ul className="cell-list">{attr.value.map(type => (<li>{type}</li>))}</ul>
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'observer-organizations' })}</span>,
        accessor: 'observer-organizations',
        headerClassName: '-a-left',
        className: 'observer-organizations',
        minWidth: 250,
        Cell: attr => <ul className="cell-list">{attr.value.map(type => (<li>{type}</li>))}</ul>
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'operator-type' })}</span>,
        accessor: 'operator-type',
        headerClassName: '-a-left',
        className: 'operator-type',
        minWidth: 250
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'subcategory' })}</span>,
        accessor: 'subcategory',
        headerClassName: '-a-left',
        className: 'subcategory',
        minWidth: 250
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'evidence' })}</span>,
        accessor: 'evidence',
        headerClassName: '-a-left',
        className: 'evidence',
        minWidth: 250
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'litigation-status' })}</span>,
        accessor: 'litigation-status',
        headerClassName: '-a-left',
        className: 'litigation-status',
        minWidth: 250
      },
      {
        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'detail' })}</span>,
        accessor: 'observation',
        headerClassName: '-a-left',
        className: 'description',
        minWidth: 250,
        Cell: attr => (
          <ReadMore lines={2}>
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
        Cell: attr => (
          <div className="report-item-wrapper">
            { attr.value ?
              <a
                href={attr.value}
                target="_blank"
                rel="noopener noreferrer"
                className="report-item"
              >
                <Icon className="" name="icon-file-empty" />
              </a>
              :
              <span className="report-item-text">-</span>
              }
          </div>
          )
      },
      {
        Header: '',
        accessor: 'location',
        headerClassName: '',
        className: 'location',
        expander: true,
        Expander: ({ isExpanded }) =>
          <div className="location-item-wrapper">
            { isExpanded ?
              <button className="c-button -small -secondary">
                <Icon name="icon-cross" />
              </button>
              :
              <button className="c-button -small -primary">
                <Icon name="icon-location" />
              </button>
            }
          </div>
      }
    ];

    return (
      <Layout
        title="Observations"
        description="Observations description..."
        url={url}
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
                  logFilter={this.logFilter}
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

        <section className="c-section -relative">
          <div className="l-container">
            <h2 className="c-title">{this.props.intl.formatMessage({ id: 'observations.tab.observations-list' }) }</h2>
            <Spinner isLoading={observations.loading} />
            <div className="c-field -fluid -valid">
              <CheckboxGroup
                className="-inline -small -single-row"
                name="observations-columns"
                onChange={value => this.setActiveColumns(value)}
                properties={{ default: observations.columns, name: 'observations-columns' }}
                options={tableOptions}
              />
            </div>

            <Table
              sortable
              data={parsedTableObservations}
              options={{
                columns: columnHeaders.filter(header =>
                  observations.columns.includes(header.accessor)),
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
                }],
                showSubComponent: observations.columns.includes('location'),
                subComponent: row => observations.columns.includes('location') &&
                  <MapSubComponent
                    id={row.original.id}
                    location={row.original.location}
                    level={row.original.level}
                  />
              }}
            />
          </div>
        </section>
      </Layout>
    );
  }
}

ObservationsPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  observations: PropTypes.object,
  filters: PropTypes.object,
  intl: intlShape.isRequired,
  parsedChartObservations: PropTypes.array,
  parsedTableObservations: PropTypes.array,

  getObservations: PropTypes.func.isRequired,
  getObservationsUrl: PropTypes.func.isRequired,
  setActiveColumns: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired
};

export default withTracker(withIntl(connect(
  state => ({
    observations: state.observations,
    parsedChartObservations: getParsedChartObservations(state),
    parsedTableObservations: getParsedTableObservations(state)
  }),
  dispatch => ({
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
)(ObservationsPage)));
