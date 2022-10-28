import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import sumBy from 'lodash/sumBy';
import sortBy from 'lodash/sortBy';
import moment from 'moment';

import Spinner from 'components/ui/spinner';

import { injectIntl, intlShape } from 'react-intl';

const LegendAnalysisIntegratedAlerts = (props) => {
  const { activeLayer, analysis, intl, language } = props;
  const { decodeParams } = activeLayer;
  const { startDate, trimEndDate } = decodeParams;
  const { data, loading, error } = analysis;
  const totalCount = sumBy((data || []), 'count');
  const defaultMessages = {
    highest: 'Highest confidence: {count}',
    high: 'High confidence: {count}',
    nominal: 'Detected by single alert system: {count}',
  };
  const formatDate = (date) => {
    if (language === 'fr') {
      return moment(date).locale(language).format('Do MMMM YYYY');
    }

    return moment(date).locale(language).format('MMMM Do, YYYY');
  }


  return (
    <div className="c-legend-analysis">
      {loading && <Spinner className="-transparent -tiny -relative" isLoading={loading} />}

      {!loading && error &&
        'Oops!! There was an error during the analysis.'
      }

      {!loading && data && data.length > 0 && (
        <div>
          {intl.formatMessage({
            id: 'analysis.integrated',
            defaultMessage: 'There were {alerts} deforestation alerts between {startDate} and {trimEndDate} of which:',
          }, {
            alerts: totalCount.toLocaleString(),
            startDate: formatDate(startDate),
            trimEndDate: formatDate(trimEndDate)
          })}
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
  language: PropTypes.string,
  activeLayer: PropTypes.shape({}).isRequired,
  analysis: PropTypes.shape({}).isRequired,
  intl: intlShape
}

export default injectIntl(
  connect(
    state => ({
      language: state.language,
    }),
    null
  )(LegendAnalysisIntegratedAlerts)
);
