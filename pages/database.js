import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

// Redux
import { connect } from 'react-redux';

import { withRouter } from 'next/router';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import { FILTERS_REFS } from 'constants/documents-database';
import Filters from 'components/ui/database-filters';
import DatabaseTable from 'components/database/table';
import StaticTabs from 'components/ui/static-tabs';

// Selectors
import { getParsedFilters } from 'selectors/database/filters';

// Modules
import {
  getDocumentsDatabase,
  getFilters,
  setFilters,
  getDocumentsDatabaseUrl,
  setActiveColumns,
} from 'modules/documents-database';

class DocumentsDatabasePage extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
  }

  constructor(props) {
    super(props);

    this.state = {
      tab: this.props.url.query.subtab || 'documentation-list'
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  componentDidMount() {
    const { database, url } = this.props;

    this.props.getDocumentsDatabaseUrl(url);

    if (isEmpty(database.filters.options)) {
      this.props.getFilters();
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.parsedFilters.data, prevProps.parsedFilters.data)) {
      this.props.getDocumentsDatabase({ reload: true });
    }

    if (!isEqual(this.props.router.query, prevProps.router.query)) {
      this.props.getDocumentsDatabaseUrl(this.props.router);
    }
  }

  setActiveColumns(value) {
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
            id: 'producers_documents_database',
          })}
          background="/static/images/static-header/bg-observations.jpg"
        />
        <Filters
          options={parsedFilters.options}
          filters={parsedFilters.data}
          setFilters={this.props.setFilters}
          loading={this.props.database.filters.loading}
          filtersRefs={FILTERS_REFS}
        />

        <StaticTabs
          options={[
            {
              label: this.props.intl.formatMessage({
                id: 'documentation.tab.documentation-list',
              }),
              value: 'documentation-list',
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
  router: PropTypes.object.isRequired,
  url: PropTypes.object.isRequired,
  database: PropTypes.object,
  intl: intlShape.isRequired,
  parsedFilters: PropTypes.object,

  getFilters: PropTypes.func.isRequired,
  getDocumentsDatabase: PropTypes.func.isRequired,
  getDocumentsDatabaseUrl: PropTypes.func.isRequired,
  setActiveColumns: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired,
};

export default withRouter(
  withIntl(
    connect(
      (state) => ({
        database: state.database,
        parsedFilters: getParsedFilters(state),
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
