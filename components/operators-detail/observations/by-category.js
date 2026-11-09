import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Constants
import { PALETTE_COLOR_1, LEGEND_SEVERITY } from 'constants/charts';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// Components
import ChartLegend from 'components/ui/chart-legend';

const SEVERITIES = [
  { key: 'hight', fill: PALETTE_COLOR_1[3].fill },
  { key: 'medium', fill: PALETTE_COLOR_1[2].fill },
  { key: 'low', fill: PALETTE_COLOR_1[1].fill },
  { key: 'unknown', fill: PALETTE_COLOR_1[0].fill }
];

const TotalObservationsByOperatorByCategory = ({ data, year, horizontal }) => {
  const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data, year);
  const max = HELPERS_OBS.getMaxValue(groupedByCategory);

  const className = classnames({
    'c-chart-container': true,
    '-horizontal': !!horizontal,
  });

  const classColumns = classnames({
    columns: true,
    'small-12': horizontal,
    'small-6 medium-4 large-2': !horizontal,
  });

  const classChart = classnames({
    chart: true,
    '-max-width-100': !horizontal,
  });

  const classTitle = classnames({
    'c-title': true,
    '-default': true,
  });

  return (
    <div className={className}>
      {/* Legend */}
      <ChartLegend
        title={LEGEND_SEVERITY.title}
        list={LEGEND_SEVERITY.list}
        className="-horizontal"
      />

      {/* Charts */}
      <div className="row l-row">
        {Object.keys(groupedByCategory).map((category) => {
          const [groupedBySeverity] = HELPERS_OBS.getGroupedBySeverity(
            groupedByCategory[category],
            false,
            'level'
          );

          return (
            <div key={category} className={classColumns}>
              <div className="c-chart">
                <div className={classChart}>
                  <div className={classnames('c-severity-bars', { '-horizontal': horizontal })}>
                    {SEVERITIES.map(({ key, fill }) => {
                      const value = groupedBySeverity[key];
                      return (
                        <div key={key} className="c-severity-bars__track">
                          <div
                            className="c-severity-bars__bar"
                            style={{ '--value': max ? value / max : 0, background: fill }}
                          >
                            {!!value && <span className="c-severity-bars__label">{value}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <h3 className={classTitle}>{category}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

TotalObservationsByOperatorByCategory.propTypes = {
  data: PropTypes.array,
  year: PropTypes.number,
  horizontal: PropTypes.bool,
};

export default TotalObservationsByOperatorByCategory;
