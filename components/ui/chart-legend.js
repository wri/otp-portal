import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { injectIntl, intlShape } from 'react-intl';

function ChartLegend({ title, list, className, intl }) {
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <div className={`c-chart-legend ${classNames}`}>
      {title &&
        <h4 className="c-title -default -proximanova chart-legend-title">
          {intl.formatMessage({ id: 'legend.title' })}:
        </h4>}

      <ul className="chart-legend-list">
        {list.map(item => (
          <li key={item.label} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: item.fill, border: `2px solid ${item.stroke}` }} />
            <span className="chart-legend-label">
              {intl.formatMessage({ id: item.label })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

ChartLegend.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array,
  className: PropTypes.string,
  intl: intlShape.isRequired
};

export default injectIntl(ChartLegend);
