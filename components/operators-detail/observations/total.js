import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import classnames from 'classnames';

// Constants
import { LEGEND_SEVERITY } from 'constants/rechart';

// Components
import ChartLegend from 'components/ui/chart-legend';

export default class TotalObservationsByOperator extends React.Component {

  getGroupedByYear() {
    // TODO: replace to a reseselect from the documentation asociated to an operator
    return groupBy(this.props.data, 'year');
  }

  getGroupedBySeverity(data) {
    // TODO: replace to a reseselect from the documentation asociated to an operator
    return groupBy(data, 'severity');
  }

  getMaxValue(data) {
    const arr = Object.keys(data).map(k => data[k].length);
    return Math.max(...arr);
  }

  render() {
    const groupedByYear = this.getGroupedByYear();
    const max = this.getMaxValue(groupedByYear);

    return (
      <div className="c-observations-by-operator">
        <header className="obo-year-header">
          <span className="c-title -default -proximanova -uppercase">Year</span>
          <span className="c-title -default -proximanova -uppercase">Observations (IM Visits)</span>
        </header>

        {/* YEAR LIST */}
        <ul className="obo-year-list">
          {Object.keys(groupedByYear).sort((a, b) => b - a).map((year, i) => {
            const groupedBySeverity = this.getGroupedBySeverity(groupedByYear[year]);
            const length = groupedByYear[year].length;
            const observationListClassNames = classnames({
              '-big': i === 0
            });

            return (
              <li
                key={year}
                className="obo-year-list-item"
              >
                <header className="obo-observations-header">
                  <span>{year}</span>
                  <span>301 (107)</span>
                </header>

                {/* SEVERITY LIST */}
                <ul
                  className={`obo-observations-list ${observationListClassNames}`}
                  style={{ width: `${(length / max) * 100}%` }}
                >
                  {Object.keys(groupedBySeverity).sort((a, b) => b - a).map((severity) => {
                    const lengthSeverity = groupedBySeverity[severity].length;

                    return (
                      <li
                        key={severity}
                        style={{ width: `${(lengthSeverity / length) * 100}%` }}
                        className={`obo-observations-list-item -severity-${severity}`}
                      >
                        {i === 0 && lengthSeverity}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>

        {/* Legend */}
        <ChartLegend
          title={LEGEND_SEVERITY.title}
          list={LEGEND_SEVERITY.list}
          className="-horizontal"
        />

      </div>
    );
  }
}

TotalObservationsByOperator.propTypes = {
  data: PropTypes.array
};
