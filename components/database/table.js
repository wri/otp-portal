import React from 'react';
import PropTypes from 'prop-types';

// Components
import CheckboxGroup from 'components/form/CheckboxGroup';
import Table from 'components/ui/table';
import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

// Redux and HOC
import { connect } from 'react-redux';
// Intl
import { injectIntl, intlShape } from 'react-intl';

import { getParsedTableDocuments } from 'selectors/database/database';
import { setActiveColumns } from 'modules/documents-database';

function DatabaseTable({
  database,
  parsedTableDocuments,
  setActiveColumns: _setActiveColumns,
  intl,
}) {
  const inputs = [
    'document',
    'document-name',
    'annexes',
    'start-date',
    'expire-date',
    'status',
    'country',
    'operator',
    'fmu',
    'forest-type',
    'source',
    'reason',
  ];

  const columnHeaders = [
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
          {attr.value ? (
            <a
              href={attr.value}
              target="_blank"
              rel="noopener noreferrer"
              className="report-item"
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
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-item"
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
        <span className="sortable">
          {intl.formatMessage({ id: 'forest-type' })}
        </span>
      ),
      accessor: 'forest-type',
      className: '-uppercase',
      minWidth: 100,
    },
    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'source' })}</span>
      ),
      accessor: 'source',
      minWidth: 200,
      Cell: (attr) => (
        <span className="-source">
          {attr.value !== 'other_source'
            ? intl.formatMessage({ id: attr.value })
            : attr.original.sourceInfo}
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
        <span className="sortable">{intl.formatMessage({ id: 'status' })}</span>
      ),
      accessor: 'status',
      minWidth: 150,
      className: 'status',
      Cell: (attr) => (
        <span>
          {intl.formatMessage({
            id: attr.value,
          })}
        </span>
      ),
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'country' })}
        </span>
      ),
      accessor: 'country',
      className: '-uppercase',
      minWidth: 100,
    },
    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'reason' })}</span>
      ),
      accessor: 'reason',
      className: 'description',
      minWidth: 120,
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'operator' })}
        </span>
      ),
      accessor: 'operator',
      className: '-uppercase description',
      minWidth: 120,
    },
    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'fmu' })}</span>
      ),
      accessor: 'fmu',
      className: 'description',
      minWidth: 120,
      Cell: (attr) => (
        <span>
          {attr.value
            ? intl.formatMessage({
                id: attr.value.name,
              })
            : ''}
        </span>
      ),
    },
  ];

  const tableOptions = inputs.map((column) => ({
    label: intl.formatMessage({ id: column }),
    value: column,
  }));

  let pageSize = 1;
  if (database.data.length) {
    pageSize = database.data.length > 30 ? 30 : database.data.length;
  }

  return (
    <section className="c-section -relative c-db-table">
      <div className="l-container">
        <h2 className="c-title">
          {intl.formatMessage({
            id: 'select-table-content',
          })}
        </h2>
        <Spinner isLoading={database.loading} />
        <CheckboxGroup
          className="-inline -single-row"
          name="observations-columns"
          onChange={(value) => _setActiveColumns(value)}
          properties={{
            default: database.columns,
            name: 'observations-columns',
          }}
          options={tableOptions}
        />

        <Table
          className="database-table"
          sortable
          data={parsedTableDocuments}
          options={{
            columns: columnHeaders.filter((header) =>
              database.columns.includes(header.accessor)
            ),
            // page,
            // onPageChange: (p) => setPage(p + 1),
            pageSize,
            pagination: true,
            previousText: '<',
            nextText: '>',
            noDataText: 'No rows found',
            showPageSizeOptions: false,
            defaultSorted: [
              {
                id: 'operator_id', // include doc name
                desc: false,
              },
            ],
          }}
        />
      </div>
    </section>
  );
}

DatabaseTable.propTypes = {
  database: PropTypes.object,
  intl: intlShape.isRequired,
  parsedTableDocuments: PropTypes.array,
  setActiveColumns: PropTypes.func,
};

export default injectIntl(
  connect(
    (state) => ({
      database: state.database,
      parsedTableDocuments: getParsedTableDocuments(state),
    }),
    { setActiveColumns }
  )(DatabaseTable)
);
