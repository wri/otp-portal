import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Spinner from 'components/ui/spinner';

class LegendAnalysisLoss extends PureComponent {
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
          `There were ${data.loss.toLocaleString()} ha of tree cover loss`
        }
      </div>
    );
  }
}

export default LegendAnalysisLoss;
