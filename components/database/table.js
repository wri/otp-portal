import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

// Components
import Table from 'components/ui/table';
import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';
import ColumnsModal from 'components/database/columns-modal';
import Pagination from 'components/database/pagination';

// Redux and HOC
import { connect } from 'react-redux';
// Intl
import { useIntl } from 'react-intl';

import modal from 'services/modal';
import { COLUMN_GROUPS } from 'constants/documents-database';
import { getParsedTableDocuments } from 'selectors/database/database';
import { setActiveColumns, setPage } from 'modules/documents-database';

const TOTAL_COLUMNS = COLUMN_GROUPS.flatMap((g) => g.columns).length;

function DatabaseTable({
  database,
  parsedTableDocuments,
  setActiveColumns: _setActiveColumns,
  setPage: _setPage
}) {
  const intl = useIntl();

  const columnHeaders = [
    {
      Header: intl.formatMessage({ id: 'country' }),
      accessor: 'country',
      className: 'description',
      minWidth: 100,
      maxWidth: 220,
      autoWidth: true,
    },
    {
      Header: intl.formatMessage({ id: 'operator' }),
      accessor: 'operator',
      className: 'description',
      minWidth: 140,
      Cell: (attr) => {
        const profileId = attr.original['operator-profile-id'];

        if (profileId) {
          return <Link href={`/operators/${profileId}`}>{attr.value}</Link>;
        }

        return attr.value;
      },
    },
    {
      Header: intl.formatMessage({ id: 'forest-type' }),
      accessor: 'forest-type',
      className: 'description',
      minWidth: 130,
      Cell: (attr) => (attr.value
        ? intl.formatMessage({ id: attr.value })
        : <span className="-empty">-</span>),
    },
    {
      Header: intl.formatMessage({ id: 'fmu' }),
      accessor: 'fmu',
      className: 'description',
      minWidth: 110,
      Cell: (attr) => (attr.value && attr.value.name
        ? attr.value.name
        : <span className="-empty">-</span>),
    },
    {
      Header: intl.formatMessage({ id: 'document-name' }),
      accessor: 'document-name',
      className: 'description',
      minWidth: 220,
      maxWidth: 420,
    },
    {
      Header: intl.formatMessage({ id: 'document' }),
      accessor: 'document',
      className: 'report',
      minWidth: 110,
      Cell: (attr) => (
        (attr.value && attr.value.url) ? (
          <a
            href={attr.value.url}
            target="_blank"
            rel="noopener noreferrer"
            className="c-db-file-link"
          >
            <Icon name="icon-file-empty" />
            {intl.formatMessage({ id: 'database.view_document' })}
          </a>
        ) : (
          <span className="-empty">-</span>
        )
      ),
    },
    {
      Header: intl.formatMessage({ id: 'status' }),
      accessor: 'status',
      minWidth: 170,
      className: 'status',
      Cell: (attr) => attr.value && (
        <span className={`c-db-status -${attr.value}`}>
          {intl.formatMessage({ id: attr.value })}
        </span>
      ),
    },
    {
      Header: intl.formatMessage({ id: 'category' }),
      accessor: 'legal-category',
      className: 'description',
      minWidth: 140,
    },
    {
      Header: intl.formatMessage({ id: 'doc.start_date' }),
      accessor: 'start-date',
      minWidth: 120,
    },
    {
      Header: intl.formatMessage({ id: 'doc.expiry_date' }),
      accessor: 'expire-date',
      minWidth: 120,
    },
    {
      Header: intl.formatMessage({ id: 'source' }),
      accessor: 'source',
      className: 'description',
      minWidth: 160,
      Cell: (attr) => (
        attr.value && attr.value !== 'other_source'
          ? intl.formatMessage({ id: attr.value })
          : attr.original.sourceInfo
      ),
    },
    {
      Header: intl.formatMessage({ id: 'reason' }),
      accessor: 'reason',
      className: 'description',
      minWidth: 200,
      maxWidth: 420,
    },
    {
      Header: intl.formatMessage({ id: 'annexes' }),
      accessor: 'annexes',
      className: 'evidence description',
      minWidth: 160,
      Cell: (attr) => (
        <div className="evidence-item-wrapper">
          {Array.isArray(attr.value) &&
            attr.value.map((v) => (
              <a
                href={v.attachment ? v.attachment.url : ''}
                key={v.id}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-item"
                aria-label="Download evidence document"
              >
                <Icon name="icon-file-empty" />
              </a>
            ))}

          {!Array.isArray(attr.value) && (
            <span className="evidence-item-text">{attr.value}</span>
          )}
        </div>
      ),
    },
  ];

  const openColumnsModal = () => {
    modal.toggleModal(true, {
      children: ColumnsModal,
      childrenProps: {
        selected: database.columns,
        onApply: _setActiveColumns,
      },
    });
  };

  return (
    <section className="c-section -relative c-db-table">
      <div className="l-container -wide">
        <div className="c-db-table__toolbar">
          <div>
            <h2 className="c-db-table__title">
              {intl.formatMessage({ id: 'documents' })}
            </h2>
            {database.pageCount > 0 && (
              <p className="c-db-table__meta">
                {intl.formatMessage(
                  { id: 'database.page_of' },
                  { page: database.page + 1, pages: database.pageCount }
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            className="c-db-table__customize"
            onClick={openColumnsModal}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16M15 4v16" />
            </svg>
            {intl.formatMessage({ id: 'database.customize_table' })}
            <span className="c-db-table__count">
              {database.columns.length} / {TOTAL_COLUMNS}
            </span>
          </button>
        </div>

        <div className="c-db-table__card">
          <Spinner isLoading={database.loading} />
          <Table
            className="database-table -fit-to-page"
            data={parsedTableDocuments}
            options={{
              columns: columnHeaders.filter((header) =>
                database.columns.includes(header.accessor)
              ),
              pagination: true,
              manual: true,
              sortable: false,
              multiSort: false,
              page: database.page,
              pageSize: 30,
              pages: database.pageCount,
              loading: database.loading,
              onFetchData: ((state) => {
                _setPage(state.page);
              }),
              PaginationComponent: Pagination,
              noDataText: intl.formatMessage({
                id: 'operator-documents.no-data',
                defaultMessage: 'There are no documents that match you selected criteria'
              }),
              showPageSizeOptions: false
            }}
          />
        </div>
      </div>
    </section>
  );
}

DatabaseTable.propTypes = {
  database: PropTypes.object,
  parsedTableDocuments: PropTypes.array,
  setActiveColumns: PropTypes.func,
  setPage: PropTypes.func
};

export default connect(
  (state) => ({
    database: state.database,
    parsedTableDocuments: getParsedTableDocuments(state),
  }),
  { setActiveColumns, setPage }
)(DatabaseTable);
