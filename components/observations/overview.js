import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from 'react-intl';
import Spinner from 'components/ui/spinner';

// Components
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

function Overview(props) {
  const { loading, parsedObservations, intl } = props;
  const noData = !loading && parsedObservations && parsedObservations.length === 0;

  return (
    <div className="c-obs-overview">
      <Spinner isLoading={loading} className="-absolute -transparent" />

      <h2 className="c-title">
        {intl.formatMessage({ id: 'overview_by_category' })}
      </h2>

      {noData && (
        <div className="no-data">
          {intl.formatMessage({
            id: 'observations.no-data',
            defaultMessage: 'There are no observations that match your selected criteria'
          })}
        </div>
      )}

      {!noData && (
        <TotalObservationsByOperatorByCategory
          data={parsedObservations}
          horizontal
        />
      )}
    </div>
  );
}

Overview.propTypes = {
  parsedObservations: PropTypes.array,
  loading: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(Overview);
