import React from 'react';
import PropTypes from 'prop-types';

// Components
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

export default function Overview(props) {
  const { parsedObservations } = props;

  return (
    <div className="c-obs-overview">
      <h2 className="c-title">Overview by category</h2>

      <TotalObservationsByOperatorByCategory
        data={parsedObservations}
        horizontal
      />
    </div>
  );
}

Overview.propTypes = {
  parsedObservations: PropTypes.array
};
