/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import flatten from 'lodash/flatten';

// Redux
import { connect } from 'react-redux';
import { setMapLocation, setFmuSelected, setAnalysis } from 'modules/operators-detail-fmus';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Constants
import { MAP_LAYERS_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import Map from 'components/map/map';
import MapControls from 'components/map/map-controls';
import MapLegend from 'components/map/map-legend';
import ZoomControl from 'components/map/controls/zoom-control';
import Sidebar from 'components/ui/sidebar';
import FMUCard from 'components/ui/fmu-card';

class OperatorsDetailFMUs extends React.Component {
  render() {
    const { url, operatorsDetail, operatorsDetailFmus } = this.props;
    const { fmus } = operatorsDetail && operatorsDetail.data ? operatorsDetail.data : {};
    const layers = MAP_LAYERS_OPERATORS_DETAIL;

    return (
      <div className="c-section -map">
        <Sidebar
          className="-fluid"
        >
          {fmus && fmus.length &&
            <FMUCard
              title={this.props.intl.formatMessage({ id: 'forest-management-units' })}
              fmus={fmus}
            />
          }
        </Sidebar>

        <div className="c-map-container -static">
          <Map
            mapOptions={operatorsDetailFmus.map}
            mapFilters={{
              OPERATOR_ID: url.query.id,
              FMU_ID: operatorsDetailFmus.fmu.id
            }}
            mapListeners={{
              moveend: (map) => {
                this.props.setMapLocation({
                  zoom: map.getZoom(),
                  center: map.getCenter()
                });
              }
            }}
            layers={layers}
            onLayerEvent={(eventName, layerId, e) => {
              switch (`${eventName}-${layerId}`) {
                case 'click-forest_concession_layer': {
                  const fmu = fmus.find(f => parseInt(f.id, 10) === e.features[0].properties.id);

                  this.props.setFmuSelected(fmu);

                  if (!operatorsDetailFmus.analysis.data[fmu.id]) {
                    this.props.setAnalysis(fmu);
                  }
                  break;
                }
                default:

              }
            }}
          />

          <MapLegend
            layers={flatten(MAP_LAYERS_OPERATORS_DETAIL.map(layer =>
                layer.layers.filter(l => l.legendConfig)
              ))}
            activeLayers={[]}
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
        </div>
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
  intl: intlShape.isRequired,
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object.isRequired,
  operatorsDetailFmus: PropTypes.object.isRequired,
  setMapLocation: PropTypes.func.isRequired,
  setFmuSelected: PropTypes.func.isRequired,
  setAnalysis: PropTypes.func.isRequired
};

export default connect(
  state => ({
    operatorsDetailFmus: state.operatorsDetailFmus
  }),
  {
    setMapLocation, setFmuSelected, setAnalysis
  }
)(injectIntl(OperatorsDetailFMUs));
