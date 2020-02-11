import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Spinner from 'components/ui/spinner';

class LegendAnalysisGLAD extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.shape({}).isRequired,
    analysis: PropTypes.shape({}).isRequired
  }

  render() {
    const { activeLayer, analysis } = this.props;
    const { decodeParams } = activeLayer;
    const { startDate, trimEndDate } = decodeParams;
    const { data, loading, error } = analysis;

    return (
      <div className="c-legend-analysis">
        {loading && <Spinner className="-transparent -tiny -relative" isLoading={loading} />}

        {!loading && error &&
          'Oops!! There was an error during the analysis.'
        }

        {!loading && data &&
          `There were ${data.value.toLocaleString()} GLAD alerts from ${startDate} to ${trimEndDate}`
        }
      </div>
    );
  }
}

export default LegendAnalysisGLAD;
