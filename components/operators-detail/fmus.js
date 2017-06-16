/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { substitution } from 'utils/text';

// Constants
import { MAP_OPTIONS_OPERATORS_DETAIL, MAP_LAYERS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import Map from 'components/map/map';

export default class OperatorsDetailFMUs extends React.Component {
  render() {
    const { url } = this.props;
    return (
      <div className="c-map-container -static">
        <Map
          mapOptions={MAP_OPTIONS_OPERATORS_DETAIL}
          layers={JSON.parse(substitution(JSON.stringify(MAP_LAYERS_OPERATORS_DETAIL), [{ key: 'OPERATOR_ID', value: url.query.id }]))}
        />
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
  url: PropTypes.object.isRequired
};
