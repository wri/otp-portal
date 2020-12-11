import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import difference from 'lodash/difference';

// Redux
import { connect } from 'react-redux';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Selectors
import { getParsedChartObservations } from 'selectors/observations/parsed-chart-observations';
import { getParsedTableObservations } from 'selectors/observations/parsed-table-observations';
import { getObservationsLayers } from 'selectors/observations/parsed-map-observations';
import { getParsedFilters } from 'selectors/observations/parsed-filters';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import { FILTERS_REFS } from 'constants/observations';
import Filters from 'components/ui/filters';
import DatabaseTable from 'components/database/table';

import StaticTabs from 'components/ui/static-tabs';

// Modules
import {
  getDocumentsDatabase,
  getFilters,
  setFilters,
  getDocumentsDatabaseUrl,
  setActiveColumns,
} from 'modules/documents-database';

import { logEvent } from 'utils/analytics';

class DocumentsDatabasePage extends React.Component {
  static async getInitialProps({ url, store }) {
    const { database } = store.getState();

    if (isEmpty(database.data)) {
      await store.dispatch(getDocumentsDatabase());
    }

    if (isEmpty(database.filters.options)) {
      await store.dispatch(getFilters());
    }

    return { url };
  }

  constructor(props) {
    super(props);

    this.state = {
      tab: this.props.url.query.subtab || 'observations-list',
      page: 1,
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  componentDidMount() {
    const { url } = this.props;

    this.props.getDocumentsDatabaseUrl(url);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.parsedFilters.data, nextProps.parsedFilters.data)) {
      this.props.getDocumentsDatabase();
    }
  }

  setActiveColumns(value) {
    const { observations } = this.props;
    const addColumn = difference(value, observations.columns);
    const removeColumn = difference(observations.columns, value);

    if (addColumn.length)
      logEvent('DocumentsDatabase', 'Add Column', addColumn[0]);
    if (removeColumn.length)
      logEvent('DocumentsDatabase', 'Remove Column', removeColumn[0]);

    this.props.setActiveColumns(value);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  render() {
    const { url, parsedFilters } = this.props;

    return (
      <Layout
        title="Producers’ documents database"
        description="DocumentsDatabase description..."
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({
            id: 'Producers’ documents database',
          })}
          background="/static/images/static-header/bg-observations.jpg"
        />
        <Filters
          options={parsedFilters.options}
          filters={parsedFilters.data}
          setFilters={this.props.setFilters}
          filtersRefs={FILTERS_REFS}
        />

        <StaticTabs
          options={[
            {
              label: this.props.intl.formatMessage({
                id: 'observations.tab.observations-list',
              }),
              value: 'observations-list',
            },
          ]}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        <DatabaseTable />
      </Layout>
    );
  }
}

DocumentsDatabasePage.propTypes = {
  url: PropTypes.object.isRequired,
  observations: PropTypes.object,
  intl: intlShape.isRequired,
  parsedFilters: PropTypes.object,

  getDocumentsDatabase: PropTypes.func.isRequired,
  getDocumentsDatabaseUrl: PropTypes.func.isRequired,
  setActiveColumns: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired,
};

export default withTracker(
  withIntl(
    connect(
      (state) => ({
        observations: state.observations,
        documentsDb: state.database,
        parsedFilters: getParsedFilters(state),
        parsedChartObservations: getParsedChartObservations(state),
        parsedTableObservations: getParsedTableObservations(state),
        getObservationsLayers: getObservationsLayers(state),
      }),
      {
        getDocumentsDatabase,
        getFilters,
        getDocumentsDatabaseUrl,
        setFilters,
        setActiveColumns,
      }
    )(DocumentsDatabasePage)
  )
);
