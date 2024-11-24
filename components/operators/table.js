import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import { connect } from 'react-redux';

// Next
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Intl
import { injectIntl } from 'react-intl';

import { getTable } from 'selectors/operators-ranking';

import Tooltip from 'rc-tooltip';

import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

const TableExpandedRow = dynamic(() => import('./table-expanded-row'), { ssr: false });

class OperatorsTable extends React.Component {
  state = {
    sortColumn: 'documentation',
    sortDirection: -1,
    expandedOperatorIds: [],
  };

  sortBy = (column) => {
    this.setState({
      sortColumn: column,
      sortDirection: this.state.sortDirection * -1,
    });
  };

  handleRowToggle = (id) => {
    if (this.state.expandedOperatorIds.includes(id)) {
      this.setState({
        expandedOperatorIds: this.state.expandedOperatorIds.filter(
          (i) => i !== id
        ),
      });
    } else {
      this.setState({
        expandedOperatorIds: [...new Set(
          [id, ...this.state.expandedOperatorIds].sort()
        )],
      });
    }
  };

  render() {
    const { operators, operatorsTable, isLoading, filters, intl } = this.props;
    const { fmu: fmuSearch } = filters;
    const { sortColumn, sortDirection, expandedOperatorIds } = this.state;

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
                    this.sortBy('documentation');
                  }}
                >
                  {this.props.intl.formatMessage({
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
                  {this.props.intl.formatMessage({
                    id: 'operators.table.name',
                  })}
                </th>

                <th className="-ta-left -contextual">
                  {this.props.intl.formatMessage({
                    id: 'country',
                  })}
                </th>

                {/* Other styles */}
                <th className="-ta-center -contextual">
                  {this.props.intl.formatMessage({
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
                    <button className="c-button -icon -primary">
                      <Icon name="icon-info" className="-smaller" />
                    </button>
                  </Tooltip>
                </th>
                <th className="-contextual">
                  {this.props.intl.formatMessage({
                    id: 'operators.table.fmus',
                  })}
                </th>
                <th className="-contextual">
                  {this.props.intl.formatMessage({
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
                      <Link
                        href={{
                          pathname: '/operators/detail',
                          query: { id: r.slug },
                        }}
                        as={`/operators/${r.slug}`}
                      >
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
                          onClick={() => this.handleRowToggle(r.id)}
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
  }
}

OperatorsTable.propTypes = {
  operators: PropTypes.array.isRequired,
  operatorsTable: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  fmuSearch: PropTypes.string,
  intl: PropTypes.object.isRequired
};

export default connect((state) => ({
  operators: state.operatorsRanking.data,
  isLoading: state.operatorsRanking.loading,
  operatorsTable: getTable(state),
  filters: state.operatorsRanking.filters.data,
}))(injectIntl(OperatorsTable));
