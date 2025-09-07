import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

// Redux
import { useSelector, useDispatch } from 'react-redux';

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

const DocumentsDatabasePage = ({ router }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const database = useSelector(state => state.database);
  const parsedFilters = useSelector(state => getParsedFilters(state));
  
  const [tab, setTab] = useState(router.query.subtab || 'documentation-list');
  const { page } = database;
  const previousPage = usePrevious(page);

  useEffect(() => {
    if (isEmpty(database.filters.options)) {
      dispatch(getFilters());
    }
  }, [dispatch, database.filters.options]);

  useDeepCompareEffect(() => {
    dispatch(getDocumentsDatabase({ reload: page === previousPage })); // reloading if changing filters, page is the same
  }, [parsedFilters.data, page, dispatch, previousPage]);

  useEffect(() => {
    dispatch(getDocumentsDatabaseUrl(router));
  }, [router.asPath, dispatch, router]);

  const triggerChangeTab = (tabValue) => {
    setTab(tabValue);
  };


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
        setFilters={(filters) => dispatch(setFilters(filters))}
        loading={database.filters.loading}
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
  router: PropTypes.object.isRequired
};

DocumentsDatabasePage.getInitialProps = async ({ store, query }) => {
  store.dispatch(getDocumentsDatabaseUrl({ query }));
  return {};
}

export default withRouter(DocumentsDatabasePage);
