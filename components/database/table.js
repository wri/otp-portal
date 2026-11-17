import React, { useMemo } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

// Components
import CheckboxGroup from 'components/form/CheckboxGroup';
import Table from 'components/ui/table';
import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

// Intl
import { useIntl } from 'react-intl';


// One table row per document, leaving out publication authorizations
const toTableRows = (documents) => {
  if (documents && documents.length) {

    return documents
      .filter((doc) => !doc['required-operator-document']['contract-signature'])
      .map((doc) => ({
        id: doc.id,
        status: doc.status,
        country: doc.operator.country && doc.operator.country.name,
        operator: doc.operator.name,
        'operator-slug': (doc.operator['fa-id']?.length && doc.operator['is-active'])
          ? doc.operator.slug
          : null,
        'forest-type': doc.fmu && doc.fmu['forest-type'],
        fmu: doc.fmu || '',
        'start-date': doc['start-date'],
        'expire-date': doc['expire-date'],
        source: doc['source-type'],
        sourceInfo: doc['source-info'],
        document: doc.attachment,
        reason: doc.reason || '',
        annexes: doc['operator-document-annexes'],
        'document-name':
          (doc['required-operator-document'] &&
            doc['required-operator-document'].name) ||
          '',
        'legal-category':
          (doc['required-operator-document'] &&
            doc['required-operator-document'][
              'required-operator-document-group'
            ] &&
            doc['required-operator-document'][
              'required-operator-document-group'
            ].name) ||
          '',
      })
    );
  }

  return [];
};

function DatabaseTable({
  documents,
  loading,
  page,
  pageCount,
  pageSize,
  onPageChange,
  columns,
  onColumnsChange
}) {
  const intl = useIntl();
  const rows = useMemo(() => toTableRows(documents), [documents]);
  const inputs = [
    'country',
    'operator',
    'forest-type',
    'fmu',
    'document-name',
    'document',
    'status',
    'legal-category',
    'start-date',
    'expire-date',
    'source',
    'reason',
    'annexes',
  ];

  const columnHeaders = [
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'country' })}
        </span>
      ),
      accessor: 'country',
      className: 'description',
      minWidth: 100,
      maxWidth: 220,
      autoWidth: true,
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'operator' })}
        </span>
      ),
      accessor: 'operator',
      className: 'description',
      minWidth: 120,
      Cell: (attr) => {
        const slug = attr.original['operator-slug'];

        if (slug) {
          return <Link href={`/operators/${slug}/overview`}>{attr.value}</Link>;
        }

        return attr.value;
      },
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'forest-type' })}
        </span>
      ),
      accessor: 'forest-type',
      className: 'description',
      minWidth: 150,
      Cell: (attr) => (attr.value && intl.formatMessage({
        id: attr.value,
      })),
    },
    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'fmu' })}</span>
      ),
      accessor: 'fmu',
      className: 'description',
      minWidth: 100,
      Cell: (attr) => (
        <span>
          {attr.value ? attr.value.name : ''}
        </span>
      ),
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'document-name' })}
        </span>
      ),
      accessor: 'document-name',
      className: 'description',
      minWidth: 200,
    },

    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'document' })}
        </span>
      ),
      accessor: 'document',
      headerClassName: '',
      className: 'report',
      minWidth: 120,
      Cell: (attr) => (
        <div className="report-item-wrapper">
          {(attr.value && attr.value.url) ? (
            <a
              href={attr.value.url}
              target="_blank"
              className="report-item"
              aria-label="Download document"
            >
              <Icon className="" name="icon-file-empty" />
            </a>
          ) : (
            <span className="report-item-text">-</span>
          )}
        </div>
      ),
    },

    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'status' })}</span>
      ),
      accessor: 'status',
      minWidth: 150,
      className: 'status',
      Cell: (attr) => (
        <span>
          {attr.value && intl.formatMessage({
            id: attr.value,
          })}
        </span>
      ),
    },

    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'category' })}
        </span>
      ),
      accessor: 'legal-category',
      headerClassName: '-a-left',
      className: 'description',
      minWidth: 120,
    },

    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'doc.start_date' })}
        </span>
      ),
      accessor: 'start-date',
      minWidth: 150,
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'doc.expiry_date' })}
        </span>
      ),
      accessor: 'expire-date',
      minWidth: 150,
    },
    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'source' })}</span>
      ),
      accessor: 'source',
      minWidth: 200,
      Cell: (attr) => (
        <span className="-source">
          {attr.value && attr.value !== 'other_source'
            ? intl.formatMessage({ id: attr.value })
            : attr.original.sourceInfo}
        </span>
      ),
    },
    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'reason' })}</span>
      ),
      accessor: 'reason',
      className: 'description',
      minWidth: 200,
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'annexes' })}
        </span>
      ),
      accessor: 'annexes',
      headerClassName: '-a-left',
      className: 'evidence description',
      minWidth: 200,
      Cell: (attr) => (
        <div className="evidence-item-wrapper">
          {Array.isArray(attr.value) &&
            attr.value.map((v) => (
              <a
                href={v.attachment ? v.attachment.url : ''}
                key={v.id}
                target="_blank"
                className="evidence-item"
                aria-label="Download evidence document"
              >
                <Icon className="" name="icon-file-empty" />
              </a>
            ))}

          {!Array.isArray(attr.value) && (
            <span className="evidence-item-text">{attr.value}</span>
          )}
        </div>
      ),
    },
  ];

  const tableOptions = inputs.map((column) => ({
    label: intl.formatMessage({ id: column }),
    value: column,
  }));

  return (
    <section className="c-section -relative c-db-table" data-test-id="database-table">
      <div className="l-container">
        <h2 className="c-title">
          {intl.formatMessage({
            id: 'select-table-content',
          })}
        </h2>
        <Spinner isLoading={loading} />
        <CheckboxGroup
          className="-inline"
          name="observations-columns"
          onChange={onColumnsChange}
          properties={{
            default: columns,
            name: 'observations-columns',
          }}
          options={tableOptions}
        />

        <Table
          className="database-table -fit-to-page"
          data={rows}
          options={{
            columns: columnHeaders.filter((header) =>
              columns.includes(header.accessor)
            ),
            pagination: true,
            manual: true,
            sortable: false,
            multiSort: false,
            page,
            pageSize,
            pages: pageCount,
            loading,
            onFetchData: (state) => {
              if (state.page !== page) onPageChange(state.page);
            },
            previousText: '<',
            nextText: '>',
            noDataText: intl.formatMessage({
              id: 'operator-documents.no-data',
              defaultMessage: 'There are no documents that match you selected criteria'
            }),
            showPageSizeOptions: false
          }}
        />
      </div>
    </section>
  );
}

DatabaseTable.propTypes = {
  documents: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  page: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  onColumnsChange: PropTypes.func.isRequired
};

export default DatabaseTable;
