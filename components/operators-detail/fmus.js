import React from 'react';

// Constants
import { MAP_OPTIONS_OPERATORS_DETAIL, MAP_LAYERS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import Map from 'components/map/map';

export default class OperatorsDetailFMUs extends React.Component {
  render() {
    return (
      <div className="c-map-container -static">
        <Map
          mapOptions={MAP_OPTIONS_OPERATORS_DETAIL}
          layers={MAP_LAYERS_OPERATORS_DETAIL}
        />
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
};
