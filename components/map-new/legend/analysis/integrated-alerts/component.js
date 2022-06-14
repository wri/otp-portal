import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import sumBy from 'lodash/sumBy';

import Spinner from 'components/ui/spinner';

import { injectIntl, intlShape } from 'react-intl';

class LegendAnalysisIntegratedAlerts extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.shape({}).isRequired,
    analysis: PropTypes.shape({}).isRequired,
    intl: intlShape
  }

  render() {
    const { activeLayer, analysis, intl } = this.props;
    const { decodeParams } = activeLayer;
    const { startDate, trimEndDate } = decodeParams;
    const { data, loading, error } = analysis;
    const totalCount = sumBy((data || []), 'count');
    const defaultMessages = {
      high: 'High confidence: {count}',
      highest: 'Highest confidence: {count}',
      nominal: 'Detected by single alert system: {count}'
    };

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
            }, { alerts: totalCount, startDate, trimEndDate })}
            {data.map((d) => (
              <div key={d.gfw_integrated_alerts__confidence}>
                {intl.formatMessage({
                  id: `analysis.integrated.${d.gfw_integrated_alerts__confidence}`,
                  defaultMessage: defaultMessages[d.gfw_integrated_alerts__confidence]
                }, { count: d.count })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default injectIntl(LegendAnalysisIntegratedAlerts);
