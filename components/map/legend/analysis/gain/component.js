import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { injectIntl } from 'react-intl';

import Spinner from 'components/ui/spinner';

class LegendAnalysisGain extends PureComponent {
  static propTypes = {
    analysis: PropTypes.shape({}).isRequired,
    intl: PropTypes.object
  }

  render() {
    const { analysis, intl } = this.props;
    const { data, loading, error } = analysis;

    return (
      <div className="c-legend-analysis">
        {loading && <Spinner className="-transparent -tiny -relative" isLoading={loading} />}

        {!loading && error &&
          'Oops!! There was an error during the analysis.'
        }

        {!loading && data &&
          intl.formatMessage({ id: 'analysis.gain' }, { alerts: data.gain.toLocaleString() })
        }
      </div>
    );
  }
}

export default injectIntl(LegendAnalysisGain);
