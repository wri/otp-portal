import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Components
// import ChartLegend from 'components/ui/chart-legend';
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

// Constants
// import { LEGEND_SEVERITY } from 'constants/rechart';
import { OBSERVATIONS_OPERATORS_DETAIL } from 'constants/operators-detail';


export default class Overview extends React.Component {
  render() {
    const { status } = this.props;
    const classNames = classnames({
      'c-obs-overview': true,
      [`-${status}`]: !!status
    });

    return (
      <div className={classNames}>
        <h2 className="c-title">Overview by category</h2>

        <TotalObservationsByOperatorByCategory data={OBSERVATIONS_OPERATORS_DETAIL} horizontal />
      </div>
    );
  }
}

Overview.propTypes = {
  status: PropTypes.string
};
