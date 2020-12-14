import React from 'react';
import PropTypes from 'prop-types';

// Components
import CheckboxGroup from 'components/form/CheckboxGroup';
import Table from 'components/ui/table';
import Spinner from 'components/ui/spinner';
import MapSubComponent from 'components/ui/map-sub-component';
import ReadMore from 'components/ui/read-more';
import Icon from 'components/ui/icon';

// Redux and HOC
import { connect } from 'react-redux';
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

import { getParsedTableDocuments } from 'selectors/database/database';
import { setActiveColumns } from 'modules/documents-database';

function DatabaseTable({
  database,
  parsedTableDocuments,
  setActiveColumns: _setActiveColumns,
  intl,
}) {
  const inputs = [
    'status',
    'country',
    'operator',
    // 'forest-type',
    'fmu',
    // 'category',
    'start-date',
    'expire-date',
    'source',
    'document',
    // 'reason',
  ];

  const columnHeaders = [
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'documents' })}
        </span>
      ),
      accessor: 'document',
      headerClassName: '',
      className: 'report',
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
        <span className="sortable">{intl.formatMessage({ id: 'status' })}</span>
      ),
      accessor: 'status',
      minWidth: 150,
      className: 'status',
      Cell: (attr) =>
        console.log(
          attr.value,
          intl,
          intl.formatMessage({
            id: attr.value,
          })
        ) || (
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
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'observer-types' })}
        </span>
      ),
      accessor: 'observer-types',
      headerClassName: '-a-left',
      className: 'observer-types',
      minWidth: 250,
      Cell: (attr) => (
        <ul className="cell-list">
          {attr.value.map((type, i) => (
            <li key={`${type}-${i}`}>
              {intl.formatMessage({ id: `${type}` })}
            </li>
          ))}
        </ul>
      ),
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'observer-organizations' })}
        </span>
      ),
      accessor: 'observer-organizations',
      headerClassName: '-a-left',
      className: 'observer-organizations',
      minWidth: 250,
      Cell: (attr) => (
        <ul className="cell-list">
          {attr.value.map((observer) => {
            return <li>{observer.name || observer.organization}</li>;
          })}
        </ul>
      ),
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'operator-type' })}
        </span>
      ),
      accessor: 'operator-type',
      headerClassName: '-a-left',
      className: 'operator-type',
      minWidth: 250,
      Cell: (attr) =>
        attr.value && (
          <span>{intl.formatMessage({ id: `${attr.value}` })}</span>
        ),
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'subcategory' })}
        </span>
      ),
      accessor: 'subcategory',
      headerClassName: '-a-left',
      className: 'subcategory description',
      minWidth: 250,
    },
    {
      Header: (
        <span className="sortable">{intl.formatMessage({ id: 'detail' })}</span>
      ),
      accessor: 'observation',
      headerClassName: '-a-left',
      className: 'description',
      minWidth: 200,
      Cell: (attr) => (
        <ReadMore
          lines={2}
          more={intl.formatMessage({ id: 'Read more' })}
          less={intl.formatMessage({ id: 'Show less' })}
        >
          {attr.value}
        </ReadMore>
      ),
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'relevant-operators' })}
        </span>
      ),
      accessor: 'relevant-operators',
      headerClassName: '-a-left',
      className: 'relevant-operators',
      minWidth: 250,
      Cell: (attr) => (
        <ul className="cell-list">
          {attr.value.map((operator) => (
            <li>{operator}</li>
          ))}
        </ul>
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
          sortable
          data={parsedTableDocuments}
          options={{
            columns: columnHeaders.filter((header) =>
              database.columns.includes(header.accessor)
            ),
            // page,
            pageSize,
            pagination: true,
            previousText: '<',
            nextText: '>',
            noDataText: 'No rows found',
            showPageSizeOptions: false,
            // onPageChange: (p) => setPage(p + 1),
            defaultSorted: [
              {
                id: 'date',
                desc: false,
              },
            ],
            showSubComponent: database.columns.includes('location'),
            subComponent: (row) =>
              database.columns.includes('location') && (
                <MapSubComponent
                  id={row.original.id}
                  location={row.original.location}
                  level={row.original.level}
                />
              ),
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

export default withIntl(
  connect(
    (state) => ({
      database: state.database,
      parsedTableDocuments: getParsedTableDocuments(state),
    }),
    { setActiveColumns }
  )(DatabaseTable)
);
