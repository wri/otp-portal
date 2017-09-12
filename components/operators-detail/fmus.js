/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { substitution } from 'utils/text';

// Constants
import { MAP_OPTIONS_OPERATORS_DETAIL, MAP_LAYERS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import Map from 'components/map/map';
import FMUCard from 'components/ui/fmu-card';

class OperatorsDetailFMUs extends React.Component {
  render() {
    const { url, operatorsDetail } = this.props;
    const { fmus } = operatorsDetail && operatorsDetail.data ? operatorsDetail.data : {};
    const layers = JSON.parse(substitution(
      JSON.stringify(MAP_LAYERS_OPERATORS_DETAIL),
      [{ key: 'OPERATOR_ID', value: url.query.id }]
    ));

    return (
      <div className="c-map-container -static">
        <Map
          mapOptions={MAP_OPTIONS_OPERATORS_DETAIL}
          layers={layers}
        />
        {fmus && fmus.length &&
          <div className="l-container">
            <FMUCard
              title={this.props.intl.formatMessage({ id: 'forest-management-units' })}
              fmus={fmus}
            />
          </div>}
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
  intl: intlShape.isRequired,
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object.isRequired
};

export default injectIntl(OperatorsDetailFMUs);
