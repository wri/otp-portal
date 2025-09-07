import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import sumBy from 'lodash/sumBy';
import sortBy from 'lodash/sortBy';
import advancedFormat from 'dayjs/plugin/advancedFormat'
import dayjs from 'dayjs';

import Spinner from 'components/ui/spinner';

import { useIntl } from 'react-intl';

dayjs.extend(advancedFormat)

const LegendAnalysisIntegratedAlerts = (props) => {
  const { activeLayer, analysis } = props;
  const language = useSelector(state => state.language);
  const intl = useIntl();
  const { decodeParams } = activeLayer;
  const { startDate, trimEndDate } = decodeParams;
  const { data, loading, error } = analysis;
  const totalCount = sumBy((data || []), 'count') || 0;
  const defaultMessages = {
    highest: 'Highest confidence: {count}',
    high: 'High confidence: {count}',
    nominal: 'Detected by single alert system: {count}',
  };
  const formatDate = (date) => {
    if (language === 'fr') {
      return dayjs(date).locale(language).format('Do MMMM YYYY');
    }

    return dayjs(date).locale(language).format('MMMM Do, YYYY');
  }
  let alertText;
  if (data && totalCount > 0) {
    alertText = intl.formatMessage({
      id: 'analysis.integrated',
      defaultMessage: 'There were {alerts} deforestation alerts between {startDate} and {trimEndDate} of which:',
    }, {
      alerts: totalCount.toLocaleString(),
      startDate: formatDate(startDate),
      trimEndDate: formatDate(trimEndDate)
    });
  } else {
    alertText = intl.formatMessage({
      id: 'analysis.integrated-zero',
      defaultMessage: 'There were 0 deforestation alerts between {startDate} and {trimEndDate}',
    }, {
      startDate: formatDate(startDate),
      trimEndDate: formatDate(trimEndDate)
    });
  }

  return (
    <div className="c-legend-analysis">
      {loading && <Spinner className="-transparent -tiny -relative" isLoading={loading} />}

      {!loading && error &&
        'Oops!! There was an error during the analysis.'
      }

      {!loading && data && (
        <div>
          {alertText}
          {sortBy(data, (d) => Object.keys(defaultMessages).indexOf(d.gfw_integrated_alerts__confidence)).map((d) => (
            <div key={d.gfw_integrated_alerts__confidence}>
              {intl.formatMessage({
                id: `analysis.integrated.${d.gfw_integrated_alerts__confidence}`,
                defaultMessage: defaultMessages[d.gfw_integrated_alerts__confidence]
              }, { count: d.count.toLocaleString() })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

LegendAnalysisIntegratedAlerts.propTypes = {
  activeLayer: PropTypes.shape({}).isRequired,
  analysis: PropTypes.shape({}).isRequired
}

export default LegendAnalysisIntegratedAlerts;
