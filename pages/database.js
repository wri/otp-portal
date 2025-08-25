import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';
import isEqual from 'react-fast-compare';

// Redux
import { connect } from 'react-redux';

import { withRouter } from 'next/router';

// Intl
import { injectIntl } from 'react-intl';

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

const DocumentsDatabasePage = (props) => {
  const [tab, setTab] = useState(props.router.query.subtab || 'documentation-list');

  useEffect(() => {
    const { database, router } = props;

    props.getDocumentsDatabaseUrl(router);

    if (isEmpty(database.filters.options)) {
      props.getFilters();
    }
  }, []);

  useEffect(() => {
    props.getDocumentsDatabase({ reload: true });
  }, [props.parsedFilters.data]);

  useEffect(() => {
    props.getDocumentsDatabaseUrl(props.router);
  }, [props.router.query]);

  const setActiveColumns = (value) => {
    props.setActiveColumns(value);
  };

  const triggerChangeTab = (tabValue) => {
    setTab(tabValue);
  };

  const { parsedFilters } = props;

  return (
    <Layout
      title="Producers' documents database"
      description="DocumentsDatabase description..."
    >
      <StaticHeader
        title={props.intl.formatMessage({
          id: 'producers_documents_database',
        })}
        background="/static/images/static-header/bg-observations.jpg"
      />
      <Filters
        options={parsedFilters.options}
        filters={parsedFilters.data}
        setFilters={props.setFilters}
        loading={props.database.filters.loading}
        filtersRefs={FILTERS_REFS}
      />

      <StaticTabs
        options={[
          {
            label: props.intl.formatMessage({
              id: 'documentation.tab.documentation-list',
            }),
            value: 'documentation-list',
          },
        ]}
        defaultSelected={tab}
        onChange={triggerChangeTab}
      />

      <DatabaseTable />
    </Layout>
  );
};

DocumentsDatabasePage.propTypes = {
  router: PropTypes.object.isRequired,
  database: PropTypes.object,
  intl: PropTypes.object.isRequired,
  parsedFilters: PropTypes.object,

  getFilters: PropTypes.func.isRequired,
  getDocumentsDatabase: PropTypes.func.isRequired,
  getDocumentsDatabaseUrl: PropTypes.func.isRequired,
  setActiveColumns: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired,
};

export default withRouter(
  injectIntl(
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
