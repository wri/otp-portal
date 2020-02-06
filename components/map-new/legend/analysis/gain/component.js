import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Spinner from 'components/ui/spinner';

class LegendAnalysisGain extends PureComponent {
  static propTypes = {
    analysis: PropTypes.shape({}).isRequired
  }

  render() {
    const { analysis } = this.props;
    const { data, loading } = analysis;

    return (
      <div className="c-legend-analysis">
        {loading && <Spinner className="-transparent -tiny -relative" isLoading={loading} />}

        {!loading && data &&
          `There were ${data.gain.toLocaleString()} ha of tree cover gain`
        }
      </div>
    );
  }
}

export default LegendAnalysisGain;
