import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Next
import Link from 'next/link';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

// Chart
import OperatorsRanking from 'components/operators/ranking';
import OperatorsCertificationsTd from 'components/operators/certificationsTd';

class OperatorsTable extends React.Component {
  state = {
    sortColumn: 'documentation',
    sortDirection: -1,
    table: [],
    max: null
  }

  componentDidMount() {
    const { operators } = this.props;

    if (operators.length) {
      this.setState({
        sortColumn: this.state.sortColumn || 'documentation',
        sortDirection: this.state.sortDirection || -1,
        table: operators.map((o, i) => ({
          id: o.id,
          name: o.name,
          ranking: i,
          certification: <OperatorsCertificationsTd fmus={o.fmus} />,
          score: o.score || 0,
          obs_per_visit: o['obs-per-visit'] || 0,
          documentation: HELPERS_DOC.getPercentage(o),
          fmus: o.fmus ? o.fmus.length : 0
        })),
        max: Math.max(...operators.map(o => o.observations.length))
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.operators.length !== this.props.operators.length) {
      this.setState({
        sortColumn: this.state.sortColumn || 'documentation',
        sortDirection: this.state.sortDirection || -1,
        table: nextProps.operators.map(o => ({
          id: o.id,
          name: o.name,
          certification: <OperatorsCertificationsTd fmus={o.fmus} />,
          score: o.score || 0,
          obs_per_visit: o['obs-per-visit'] || 0,
          documentation: HELPERS_DOC.getPercentage(o),
          fmus: o.fmus ? o.fmus.length : 0
        })),
        max: Math.max(...nextProps.operators.map(o => o.observations.length))
      });
    }
  }

  sortBy = (column) => {
    this.setState({
      sortColumn: column,
      sortDirection: this.state.sortDirection * -1
    });
  };

  render() {
    const { operators } = this.props;
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
              {sortBy(table, o => sortDirection * o[sortColumn]).map((r, i) => (
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
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsTable);
