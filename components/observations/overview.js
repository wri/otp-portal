import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

import { useIntl } from 'react-intl';
import Spinner from 'components/ui/spinner';
import Icon from 'components/ui/icon';

// Components
const TotalObservationsByOperatorByCategory = dynamic(() => import('components/operators-detail/observations/by-category'), { ssr: false });

const toChartRows = (observations) => (observations || []).map((obs) => ({
  id: obs.id,
  details: obs.details,
  level: obs.severity && obs.severity.level,
  category: obs?.subcategory?.category?.name || '',
  illegality: obs?.subcategory?.name || '',
  date: new Date(obs['observation-report'] && obs['observation-report']['publication-date']),
}));

function Overview({ loading, observations, onShowMap, onShowObservations }) {
  const intl = useIntl();
  const parsedObservations = useMemo(() => toChartRows(observations), [observations]);
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
  observations: PropTypes.array,
  loading: PropTypes.bool,
  onShowObservations: PropTypes.func,
  onShowMap: PropTypes.func,
};

export default Overview;
