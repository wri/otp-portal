import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

// Constants
import { PALETTE_COLOR_1, ANIMATION_TIMES, LEGEND_SEVERITY } from 'constants/rechart';

// Components
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import ChartLegend from 'components/ui/chart-legend';


export default class TotalObservationsByOperatorByCategory extends React.Component {

  getGroupedByYear(data) {
    return groupBy(data || this.props.data, 'year');
  }

  getGroupedByCategory(data) {
    const { year } = this.props;
    if (year) {
      const groupedByYear = this.getGroupedByYear();
      return groupBy(groupedByYear[year], 'category');
    }
    return groupBy(data || this.props.data, 'category');
  }

  getGroupedBySeverity(data) {
    const grouped = groupBy(data || this.props.data, 'severity');
    return [{
      hight: (grouped[3]) ? grouped[3].length : 0,
      medium: (grouped[2]) ? grouped[2].length : 0,
      low: (grouped[1]) ? grouped[1].length : 0,
      unknown: (grouped[0]) ? grouped[0].length : 0
    }];
  }

  getMaxValue(data) {
    const arr = flatten(Object.keys(data || this.props.data).map((k) => {
      const groupedBySeverity = groupBy(data[k], 'severity');
      return Object.keys(groupedBySeverity).map(s => groupedBySeverity[s].length);
    }));

    return Math.max(...arr);
  }

  render() {
    const groupedByCategory = this.getGroupedByCategory();
    const max = this.getMaxValue(groupedByCategory);

    return (
      <div className="c-chart-container">
        {/* Legend */}
        <ChartLegend
          title={LEGEND_SEVERITY.title}
          list={LEGEND_SEVERITY.list}
          className="-horizontal"
        />

        {/* Charts */}
        <div className="row custom-row">
          {Object.keys(groupedByCategory).map((category) => {
            const groupedBySeverity = this.getGroupedBySeverity(groupedByCategory[category]);

            return (
              <div key={category} className="columns small-6 medium-4 large-2">
                <div className="c-chart">
                  <div className="chart -max-width-100">
                    <ResponsiveContainer height={120}>
                      <BarChart
                        data={groupedBySeverity}
                        barGap={5}
                        barCategoryGap={0}
                        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        {...ANIMATION_TIMES}
                      >
                        <XAxis hide axisLine={false} />
                        <YAxis hide axisLine={false} domain={[0, max]} />

                        <Bar dataKey="hight" fill={PALETTE_COLOR_1[0].fill} minPointSize={1} />
                        <Bar dataKey="medium" fill={PALETTE_COLOR_1[1].fill} minPointSize={1} />
                        <Bar dataKey="low" fill={PALETTE_COLOR_1[2].fill} minPointSize={1} />
                        <Bar dataKey="unknown" fill={PALETTE_COLOR_1[3].fill} minPointSize={1} />

                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <h3 className="c-title -bigger">{category}</h3>

                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {/* <footer>
          <Link
            href={{
              pathname: url.pathname,
              query: { id, tab: 'observations' }
            }}
            as={`/operators/${id}/observations`}
          >
            <a className="c-button -primary">Go to observations</a>
          </Link>
        </footer> */}
      </div>
    );
  }
}

TotalObservationsByOperatorByCategory.propTypes = {
  data: PropTypes.array,
  year: PropTypes.number
};
