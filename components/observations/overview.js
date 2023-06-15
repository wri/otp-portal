import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl } from 'react-intl';
import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

// Components
import TotalObservationsByOperatorByCategory from 'components/operators-detail/observations/by-category';

function Overview({ loading, parsedObservations, intl, onShowMap, onShowObservations }) {
  const noData = !loading && parsedObservations && parsedObservations.length === 0;

  return (
    <div className="c-obs-overview">
      <Spinner isLoading={loading} className="-absolute -transparent" />

      <h2 className="c-title">
        {intl.formatMessage({ id: 'overview_by_category' })}
      </h2>

      {noData && (
        <div className="c-obs-overview__no-data">
          {intl.formatMessage({
            id: 'observations.no-data',
            defaultMessage: 'There are no observations that match your selected criteria'
          })}
        </div>
      )}

      {!noData && (
        <>
          <div className="c-obs-overview__links">
            <div onClick={onShowObservations}>
              <Icon name="icon-arrow-down" className="-small" />
              {intl.formatMessage({ id: 'View the observations list' })}
            </div>
            <div onClick={onShowMap}>
              <Icon name="icon-arrow-down" className="-small" />
              {intl.formatMessage({ id: 'View the observations map' })}
            </div>
          </div>
          <TotalObservationsByOperatorByCategory
            data={parsedObservations}
            horizontal
          />
        </>
      )}
    </div>
  );
}

Overview.propTypes = {
  parsedObservations: PropTypes.array,
  loading: PropTypes.bool,
  onShowObservations: PropTypes.func,
  onShowMap: PropTypes.func,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(Overview);
