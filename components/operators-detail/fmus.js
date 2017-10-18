/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { setMapLocation } from 'modules/operators-detail-fmus';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { substitution } from 'utils/text';

// Constants
import { MAP_LAYERS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import Map from 'components/map/map';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import FMUCard from 'components/ui/fmu-card';

class OperatorsDetailFMUs extends React.Component {
  render() {
    const { url, operatorsDetail, operatorsDetailFmus } = this.props;
    const { fmus } = operatorsDetail && operatorsDetail.data ? operatorsDetail.data : {};
    const layers = JSON.parse(substitution(
      JSON.stringify(MAP_LAYERS_OPERATORS_DETAIL),
      [{ key: 'OPERATOR_ID', value: url.query.id }]
    ));

    return (
      <div className="c-map-container -static">
        <Map
          mapOptions={operatorsDetailFmus.map}
          mapListeners={{
            moveend: (map) => {
              this.props.setMapLocation({
                zoom: map.getZoom(),
                center: map.getCenter()
              });
            }
          }}
          layers={layers}
        />

        {/* MapControls */}
        <MapControls>
          <ZoomControl
            zoom={operatorsDetailFmus.map.zoom}
            onZoomChange={(zoom) => {
              this.props.setMapLocation({
                ...operatorsDetailFmus.map,
                ...{ zoom }
              });
            }}
          />
        </MapControls>

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
  operatorsDetail: PropTypes.object.isRequired,
  operatorsDetailFmus: PropTypes.object.isRequired,
  setMapLocation: PropTypes.func.isRequired
};

export default connect(
  state => ({
    operatorsDetailFmus: state.operatorsDetailFmus
  }),
  {
    setMapLocation
  }
)(injectIntl(OperatorsDetailFMUs));
