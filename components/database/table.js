import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Components
import Tooltip from 'rc-tooltip/dist/rc-tooltip';
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
import { getObservations, setActiveColumns } from 'modules/observations';

import { PALETTE_COLOR_1 } from 'constants/rechart';

function DatabaseTable({
  observations,
  parsedTableDocuments,
  getObservations: _getObservations,
  setActiveColumns: _setActiveColumns,
  intl,
}) {
  const [page, setPage] = useState(1);
  // Hard coded values
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

  const changeOfLabelLookup = {
    level: 'severity',
    observation: 'detail',
  };

  const tableOptions = inputs.map((column) => ({
    label: Object.keys(changeOfLabelLookup).includes(column)
      ? intl.formatMessage({ id: changeOfLabelLookup[column] })
      : intl.formatMessage({ id: column }),
    value: column,
  }));

  const columnHeaders = [
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'documents' })}
        </span>
      ),
      accessor: 'report',
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
        <span className="sortable">{intl.formatMessage({ id: 'date' })}</span>
      ),
      accessor: 'date',
      minWidth: 75,
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
            id: `observations.status-${attr.value}`,
          })}

          {[7, 8, 9].includes(attr.value) && (
            <Tooltip
              placement="bottom"
              overlay={
                <div style={{ maxWidth: 200 }}>
                  {intl.formatMessage({
                    id: `observations.status-${attr.value}.info`,
                  })}
                </div>
              }
              overlayClassName="c-tooltip no-pointer-events"
            >
              <button className="c-button -icon -primary">
                <Icon name="icon-info" className="-smaller" />
              </button>
            </Tooltip>
          )}
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
          {intl.formatMessage({ id: 'category' })}
        </span>
      ),
      accessor: 'category',
      headerClassName: '-a-left',
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
        <span className="sortable">
          {intl.formatMessage({ id: 'evidence' })}
        </span>
      ),
      accessor: 'evidence',
      headerClassName: '-a-left',
      className: 'evidence description',
      minWidth: 250,
      Cell: (attr) => (
        <div className="evidence-item-wrapper">
          {Array.isArray(attr.value) &&
            attr.value.map((v) => (
              <a
                href={v.attachment.url}
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
          {intl.formatMessage({ id: 'litigation-status' })}
        </span>
      ),
      accessor: 'litigation-status',
      headerClassName: '-a-left',
      className: 'litigation-status',
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
          {intl.formatMessage({ id: 'severity' })}
        </span>
      ),
      accessor: 'level',
      headerClassName: 'severity-th',
      className: 'severity',
      Cell: (attr) => {
        return (
          <span
            className={`severity-item -sev-${attr.value}`}
            // TODO: fix this
            // style={{ color: PALETTE_COLOR_1[+attr.value].fill }}
          >
            {attr.value}
          </span>
        );
      },
    },
    {
      Header: (
        <span className="sortable">
          {intl.formatMessage({ id: 'location-accuracy' })}
        </span>
      ),
      accessor: 'location-accuracy',
      headerClassName: '-a-left',
      className: 'location-accuracy',
      minWidth: 250,
    },
    {
      Header: '',
      accessor: 'location',
      headerClassName: '',
      className: 'location',
      expander: true,
      // eslint-disable-next-line react/prop-types
      Expander: ({ isExpanded }) => (
        <div className="location-item-wrapper">
          {isExpanded ? (
            <button className="c-button -small -secondary">
              <Icon name="icon-cross" />
            </button>
          ) : (
            <button className="c-button -small -primary">
              <Icon name="icon-location" />
            </button>
          )}
        </div>
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

  function getPageSize() {
    if (observations.data.length) {
      return observations.data.length > 50 ? 50 : observations.data.length;
    }

    return 1;
  }

  function onPageChange(p) {
    setPage(p + 1);
    _getObservations(p + 1);
  }

  return (
    <section className="c-section -relative c-db-table">
      <div className="l-container">
        <h2 className="c-title">
          {intl.formatMessage({
            id: 'select-table-content',
          })}
        </h2>
        <Spinner isLoading={observations.loading} />
        <CheckboxGroup
          className="-inline -single-row"
          name="observations-columns"
          onChange={(value) => _setActiveColumns(value)}
          properties={{
            default: observations.columns,
            name: 'observations-columns',
          }}
          options={tableOptions}
        />

        <Table
          sortable
          data={parsedTableDocuments}
          options={{
            columns: columnHeaders.filter((header) =>
              observations.columns.includes(header.accessor)
            ),
            pageSize: getPageSize(),
            pagination: true,
            previousText: '<',
            nextText: '>',
            noDataText: 'No rows found',
            showPageSizeOptions: false,
            onPageChange: (p) => onPageChange(p),
            defaultSorted: [
              {
                id: 'date',
                desc: false,
              },
            ],
            showSubComponent: observations.columns.includes('location'),
            subComponent: (row) =>
              observations.columns.includes('location') && (
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
  observations: PropTypes.object,
  intl: intlShape.isRequired,
  parsedTableDocuments: PropTypes.array,
  getObservations: PropTypes.func,
  setActiveColumns: PropTypes.func,
};

export default withIntl(
  connect(
    (state) => ({
      observations: state.observations,
      parsedTableDocuments: getParsedTableDocuments(state),
    }),
    { getObservations, setActiveColumns }
  )(DatabaseTable)
);
