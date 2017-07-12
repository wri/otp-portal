/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { substitution } from 'utils/text';

// Constants
import { MAP_OPTIONS_OPERATORS_DETAIL, MAP_LAYERS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import Map from 'components/map/map';
import FMUCard from 'components/ui/fmu-card';

export default class OperatorsDetailFMUs extends React.Component {
  render() {
    const { url, operatorsDetail } = this.props;
    const { fmus } = operatorsDetail && operatorsDetail.data ? operatorsDetail.data : {};
    return (
      <div className="c-map-container -static">
        <Map
          mapOptions={MAP_OPTIONS_OPERATORS_DETAIL}
          layers={JSON.parse(substitution(JSON.stringify(MAP_LAYERS_OPERATORS_DETAIL), [{ key: 'OPERATOR_ID', value: url.query.id }]))}
        />
        {fmus && fmus.length &&
          <div className="l-container">
            <FMUCard
              title="Forest Management Units"
              fmus={fmus}
            />
          </div>}
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object.isRequired
};
