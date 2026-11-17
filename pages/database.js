import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import { FILTERS_REFS, FILTER_RULES } from 'constants/documents-database';
import Filters from 'components/ui/database-filters';
import DatabaseTable from 'components/database/table';
import StaticTabs from 'components/ui/static-tabs';

import useApi from 'hooks/use-api';
import useFilterOptions from 'hooks/use-filter-options';
import useUrlFilters from 'hooks/use-url-filters';
import { fetchApi } from 'services/fetch-api';
import { parseObjectSelectOptions, getApiFiltersParams } from 'utils/general';

const PAGE_SIZE = 30;
const DOCUMENT_INCLUDES = [
  'operator',
  'operator.country',
  'fmu',
  'operator-document-annexes',
  'required-operator-document',
  'required-operator-document.required-operator-document-group',
].join(',');
const DEFAULT_COLUMNS = ['country', 'document', 'forest-type', 'document-name', 'status', 'operator', 'fmu'];
const NO_OPTIONS = {};
// react-table needs -1 while the page count is unknown
const NO_RESULTS = { data: [], meta: { 'page-count': -1 } };

function fetchDocuments(filters, page, locale) {
  return fetchApi('operator-documents', {
    locale,
    meta: true,
    params: {
      'page[number]': page + 1,
      'page[size]': PAGE_SIZE,
      include: DOCUMENT_INCLUDES,
      'fields[fmus]': 'name,forest-type',
      'fields[operators]': 'name,slug,country,fa-id,is-active',
      'fields[countries]': 'name,iso',
      ...getApiFiltersParams(filters)
    }
  });
}

function fetchFilterOptions(locale) {
  return fetchApi('operator_document_filters_tree', { locale, deserialize: false, cache: true })
    .then(parseObjectSelectOptions);
}

const DocumentsDatabasePage = () => {
  const intl = useIntl();
  const router = useRouter();
  const [tab, setTab] = useState(router.query.subtab || 'documentation-list');
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [filters, setFilters] = useUrlFilters();

  // a page number belongs to the filters it was picked under; new filters start at the first page
  const [paging, setPaging] = useState({ filters, page: 0 });
  const page = paging.filters === filters ? paging.page : 0;
  const setPage = (nextPage) => setPaging({ filters, page: nextPage });

  const filterOptions = useApi(`database-filters:${intl.locale}`, () => fetchFilterOptions(intl.locale));
  const documents = useApi(
    `documents:${intl.locale}:${page}:${JSON.stringify(filters)}`,
    () => fetchDocuments(filters, page, intl.locale)
  );
  const results = documents.data || NO_RESULTS;
  const options = useFilterOptions(filters, filterOptions.data || NO_OPTIONS, FILTER_RULES);

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
        options={options}
        filters={filters}
        setFilters={setFilters}
        loading={filterOptions.loading}
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

      <DatabaseTable
        documents={results.data}
        loading={documents.loading}
        page={page}
        pageCount={results.meta['page-count']}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        columns={columns}
        onColumnsChange={setColumns}
      />
    </Layout>
  );
};

export default DocumentsDatabasePage;
