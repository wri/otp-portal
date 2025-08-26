import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

// Redux
import { connect } from 'react-redux';

import { withRouter } from 'next/router';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import { FILTERS_REFS } from 'constants/documents-database';
import Filters from 'components/ui/database-filters';
import DatabaseTable from 'components/database/table';
import StaticTabs from 'components/ui/static-tabs';

import useDeepCompareEffect from 'hooks/use-deep-compare-effect';
import usePrevious from 'hooks/use-previous';

// Selectors
import { getParsedFilters } from 'selectors/database/filters';

// Modules
import {
  getDocumentsDatabase,
  getFilters,
  setFilters,
  getDocumentsDatabaseUrl,
} from 'modules/documents-database';

const DocumentsDatabasePage = (props) => {
  const intl = useIntl();
  const [tab, setTab] = useState(props.router.query.subtab || 'documentation-list');
  const { page } = props.database;
  const previousPage = usePrevious(page);

  useEffect(() => {
    const { database } = props;

    if (isEmpty(database.filters.options)) {
      props.getFilters();
    }
  }, []);

  useDeepCompareEffect(() => {
    props.getDocumentsDatabase({ reload: page === previousPage }); // reloading if changing filters, page is the same
  }, [props.parsedFilters.data, page]);

  useEffect(() => {
    props.getDocumentsDatabaseUrl(props.router);
  }, [props.router.asPath]);

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
        title={intl.formatMessage({
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
            label: intl.formatMessage({
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
  parsedFilters: PropTypes.object,

  getFilters: PropTypes.func.isRequired,
  getDocumentsDatabase: PropTypes.func.isRequired,
  getDocumentsDatabaseUrl: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired,
};

DocumentsDatabasePage.getInitialProps = async ({ store, query }) => {
  store.dispatch(getDocumentsDatabaseUrl({ query }));
  return {};
}

export default withRouter(
  connect(
    (state) => ({
      database: state.database,
      parsedFilters: getParsedFilters(state),
    }),
    {
      getDocumentsDatabase,
      getFilters,
      getDocumentsDatabaseUrl,
      setFilters
    }
  )(DocumentsDatabasePage)
);
