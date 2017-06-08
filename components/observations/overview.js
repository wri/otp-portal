import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Components
import ChartLegend from 'components/ui/chart-legend';

// Constants
import { LEGEND_SEVERITY } from 'constants/rechart';


export default class Overview extends React.Component {
  render() {
    const classNames = classnames({
      'c-obs-overview': true,
      [`-${status}`]: !!status
    });

    return (
      <div className={classNames}>
        <h2 className="c-title">Overview by category</h2>

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

Overview.propTypes = {
  status: PropTypes.string
};
