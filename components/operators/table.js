import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import { connect } from 'react-redux';

// Next
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Intl
import { useIntl } from 'react-intl';

import { getTable } from 'selectors/operators-ranking';

import Tooltip from 'rc-tooltip';

import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';
import DynamicLoading from 'components/ui/dynamic-loading';

const TableExpandedRow = dynamic(() => import('./table-expanded-row'), { ssr: false, loading: DynamicLoading });

const OperatorsTable = ({ operators, operatorsTable, isLoading, filters }) => {
  const intl = useIntl();
  const [sortColumn, setSortColumn] = useState('documentation');
  const [sortDirection, setSortDirection] = useState(-1);
  const [expandedOperatorIds, setExpandedOperatorIds] = useState([]);

  const sortTableBy = (column) => {
    setSortColumn(column);
    setSortDirection(sortDirection * -1);
  };

  const handleRowToggle = (id) => {
    if (expandedOperatorIds.includes(id)) {
      setExpandedOperatorIds(expandedOperatorIds.filter((i) => i !== id));
    } else {
      setExpandedOperatorIds([...new Set([id, ...expandedOperatorIds].sort())]);
    }
  };

  const { fmu: fmuSearch } = filters;

  const sortedTable = sortBy(
    operatorsTable,
    (o) => sortDirection * o[sortColumn]
  );

  if (isLoading) {
    return <Spinner isLoading />;
  }

  if (!operators.loading) {
    return (
      <div className="c-ranking">
        <table>
          <thead>
            <tr>
              <th
                className="td-documentation -ta-center -sort"
                onClick={() => {
                  sortTableBy('documentation');
                }}
              >
                {intl.formatMessage({
                  id: 'operators.table.upload_docs',
                })}
                {sortDirection === -1 && (
                  <Icon name="icon-arrow-down" className="-tiny" />
                )}
                {sortDirection === 1 && (
                  <Icon name="icon-arrow-up" className="-tiny" />
                )}
              </th>

              <th className="-ta-left">
                {intl.formatMessage({
                  id: 'operators.table.name',
                })}
              </th>

              <th className="-ta-left -contextual">
                {intl.formatMessage({
                  id: 'country',
                })}
              </th>

              {/* Other styles */}
              <th className="-ta-center -contextual">
                {intl.formatMessage({
                  id: 'operators.table.obs_visit',
                })}
                <Tooltip
                  placement="top"
                  overlay={
                    <div style={{ maxWidth: 200 }}>
                      {intl.formatMessage({
                        id: 'obs_per_visit_explanation'
                      })}
                    </div>
                  }
                  overlayClassName="c-tooltip no-pointer-events"
                >
                  <button className="c-button -icon -primary" aria-label="Show observation per visit explanation">
                    <Icon name="icon-info" className="-smaller" />
                  </button>
                </Tooltip>
              </th>
              <th className="-contextual">
                {intl.formatMessage({
                  id: 'operators.table.fmus',
                })}
              </th>
              <th className="-contextual">
                {intl.formatMessage({
                  id: 'operators.table.certification',
                })}
              </th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {sortedTable.map((r, i) => {
              const expanded =
                (fmuSearch && fmuSearch.length > 1) ||
                expandedOperatorIds.includes(r.id);

              return <React.Fragment key={`${r.slug}-ranking`}>
                <tr>
                  <td
                    id={`td-documentation-${r.id}`}
                    className="td-documentation -ta-left"
                  >
                    {r.documentation}%
                  </td>

                  <td className="-ta-left">
                    <Link href={`/operators/${r.slug}/overview`}>
                      {r.name}
                    </Link>
                  </td>

                  <td className="-ta-left">{r.country}</td>
                  <td className="-ta-center">
                    {!!r.obsPerVisit && (
                      <span>{r.obsPerVisit.toFixed(2)}</span>
                    )}
                    {!r.obsPerVisit && (
                      <div className="stoplight-dot -state-0}" />
                    )}
                  </td>
                  <td className="-ta-right">{r.fmusLenght}</td>
                  <td className="-ta-right">{r.certification}</td>
                  <td className="-ta-right">
                    {r.fmusLenght > 0 && (
                      <button
                        className={`expand-row-btn${expanded ? ' -green' : ''
                          }`}
                        aria-label="Expand row and show details"
                        onClick={() => handleRowToggle(r.id)}
                      >
                        {expanded ? (
                          <Icon name="icon-arrow-up" />
                        ) : (
                          <Icon name="icon-arrow-down" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded && (
                  <TableExpandedRow operator={r} fmuSearch={fmuSearch} />
                )}
              </React.Fragment>;
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return <Spinner isLoading />;
};

OperatorsTable.propTypes = {
  operators: PropTypes.array.isRequired,
  operatorsTable: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  fmuSearch: PropTypes.string
};

export default connect((state) => ({
  operators: state.operatorsRanking.data,
  isLoading: state.operatorsRanking.loading,
  operatorsTable: getTable(state),
  filters: state.operatorsRanking.filters.data,
}))(OperatorsTable);
