import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';

// Constants
import { PALETTE_COLOR_2, LEGEND_DOCUMENTATION } from 'constants/rechart';

// Components
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';
import ChartLegend from 'components/ui/chart-legend';

export default class DocumentsProvided extends React.Component {

  getGroupedByCategory() {
    // TODO: replace to a reseselect from the documentation asociated to an operator
    return groupBy(this.props.data, 'category');
  }

  getGroupedByStatus() {
    // TODO: replace to a reseselect from the documentation asociated to an operator
    const length = this.props.data.length;
    const grouped = groupBy(this.props.data, 'status');
    return [
      {
        name: 'Not provided',
        value: parseFloat(((grouped['not-provided'].length / length) * 100).toFixed(2)) || 0,
        fill: PALETTE_COLOR_2[0].fill,
        stroke: PALETTE_COLOR_2[0].stroke
      },
      {
        name: 'Provided (not valid)',
        value: parseFloat(((grouped['not-valid'].length / length) * 100).toFixed(2)) || 0,
        fill: PALETTE_COLOR_2[1].fill,
        stroke: PALETTE_COLOR_2[1].stroke
      },
      {
        name: 'Provided (valid)',
        value: parseFloat(((grouped.valid.length / length) * 100).toFixed(2)) || 0,
        fill: PALETTE_COLOR_2[2].fill,
        stroke: PALETTE_COLOR_2[2].stroke
      }
    ];
  }

  render() {
    const groupedByCategory = this.getGroupedByCategory();
    const groupedByStatus = this.getGroupedByStatus();

    console.log(groupedByStatus);

    return (
      <div className="c-doc-provided">
        <div className="row custom-row">
          <div className="columns small-6">
            <div className="c-chart">
              <ResponsiveContainer height={350}>
                <PieChart>
                  <Pie
                    data={groupedByStatus}
                    dataKey="value"
                    outerRadius={170}
                    innerRadius={162}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                    label={{
                      fill: '#333'
                    }}
                    labelLine={{
                      stroke: '#333'
                    }}
                  >
                    {groupedByStatus.map(entry =>
                      <Cell key={entry.name} fill={entry.fill} stroke={entry.stroke} />
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <ChartLegend
                list={LEGEND_DOCUMENTATION.list}
                className="-absolute"
              />
            </div>
          </div>

          <div className="columns small-6">
            <div className="c-doc-by-category">
              <ul className="doc-by-category-list">
                {Object.keys(groupedByCategory).map(category => (
                  <li
                    key={category}
                    className="doc-by-category-list-item"
                  >
                    <div className="doc-by-category-dots">
                      {groupedByCategory[category].map(dot => (
                        <div
                          key={dot.id}
                          className={`doc-by-category-dot -${dot.status}`}
                        />
                      ))}
                    </div>

                    <h3 className="c-title -default doc-by-category-title">{category}</h3>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DocumentsProvided.propTypes = {
  data: PropTypes.array
};
