import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Utils
import { HELPERS } from 'utils/observations';

// Constants
import { LEGEND_SEVERITY } from 'constants/rechart';

// Components
import ChartLegend from 'components/ui/chart-legend';

export default class TotalObservationsByOperator extends React.Component {
  render() {
    const { data } = this.props;
    const groupedByYear = HELPERS.getGroupedByYear(data);
    const max = HELPERS.getMaxLength(groupedByYear);

    return (
      <div className="c-observations-by-operator">
        <header className="obo-year-header">
          <span className="c-title -default -proximanova -uppercase">Year</span>
          <span className="c-title -default -proximanova -uppercase">Observations (IM Visits)</span>
        </header>

        {/* YEAR LIST */}
        <ul className="obo-year-list">
          {Object.keys(groupedByYear).sort((a, b) => b - a).map((year, i) => {
            const groupedBySeverity = HELPERS.getGroupedBySeverity(groupedByYear[year], true);
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
                  <span>{length} ({HELPERS.getMonitorVisits(groupedByYear[year])})</span>
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