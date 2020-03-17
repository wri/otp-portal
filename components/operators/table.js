import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Next
import Link from 'next/link';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

// Chart
import OperatorsRanking from 'components/operators/ranking';

class OperatorsTable extends React.Component {
  state = {
    sortColumn: 'documentation',
    sortDirection: -1,
    table: []
  }

  sortBy = (column) => {
    this.setState({
      sortColumn: column,
      sortDirection: this.state.sortDirection * -1
    });
  };

  render() {
    const { operators, operatorsTable } = this.props;
    const { sortColumn, sortDirection, table } = this.state;

    if (!operators.loading) {
      return (
        <div className="c-ranking">
          <table>
            <thead>
              <tr>
                <th />
                <th />
                <th
                  className="td-documentation -ta-center -sort"
                  onClick={() => {
                    this.sortBy('documentation');
                  }}
                >
                  {this.props.intl.formatMessage({
                    id: 'operators.table.upload_docs'
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
                    id: 'operators.table.name'
                  })}
                </th>

                <th className="-ta-left -contextual">
                  {this.props.intl.formatMessage({
                    id: 'country'
                  })}
                </th>


                {/* Other styles */}
                <th className="-ta-center -contextual">
                  {this.props.intl.formatMessage({
                    id: 'operators.table.obs_visit'
                  })}
                </th>
                <th className="-contextual">
                  {this.props.intl.formatMessage({
                    id: 'operators.table.fmus'
                  })}
                </th>
                <th className="-contextual">
                  {this.props.intl.formatMessage({
                    id: 'operators.table.certification'
                  })}
                </th>
              </tr>
            </thead>

            <tbody>
              {sortBy(operatorsTable, o => sortDirection * o[sortColumn]).map((r, i) => (
                <tr key={`${r.id}-ranking`}>
                  {i === 0 && (
                    <td className="-ta-center" rowSpan={table.length}>
                      <OperatorsRanking
                        key={`update-${r.id}`}
                        data={table.map(o => ({
                          id: o.id,
                          value: parseInt(o.documentation, 10)
                        }))}
                        sortDirection={sortDirection}
                      />
                    </td>
                  )}
                  <td
                    id={`td-ranking-${r.id}`}
                    className="td-ranking -ta-left"
                  >
                    {i + 1}.
                  </td>

                  <td
                    id={`td-documentation-${r.id}`}
                    className="td-documentation -ta-left"
                  >
                    {r.documentation}%
                  </td>

                  <td className="-ta-left">
                    <Link
                      href={{
                        pathname: '/operators-detail',
                        query: { id: r.id }
                      }}
                      as={`/operators/${r.id}`}
                    >
                      <a>{r.name}</a>
                    </Link>
                  </td>

                  <td className="-ta-left">
                    {r.country}
                  </td>

                  <td className="-ta-center">
                    {!!r.obs_per_visit && r.obs_per_visit}
                    {!r.obs_per_visit && (
                      <div className="stoplight-dot -state-0}" />
                    )}
                  </td>
                  <td className="-ta-right"> {r.fmus} </td>
                  <td className="-ta-right">{r.certification}</td>
                </tr>
              ))}
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
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsTable);
