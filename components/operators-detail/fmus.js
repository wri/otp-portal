/* eslint-disable react/prefer-stateless-function */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import isEqual from 'lodash/isEqual';

// Redux
import { connect } from 'react-redux';
import {
  setOperatorsDetailMapLayersSettings,
  setOperatorsDetailFmu,
  setOperatorsDetailAnalysis
} from 'modules/operators-detail-fmus';
import {
  getActiveLayers,
  getActiveInteractiveLayers,
  getActiveInteractiveLayersIds,
  getLegendLayers,
  getFMUs,
  getFMU
} from 'selectors/operators-detail/fmus';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';

import Sidebar from 'components/ui/sidebar';
import Legend from 'components/map-new/legend';
import SelectInput from 'components/form/SelectInput';
// import FMUCard from 'components/ui/fmu-card';

class OperatorsDetailFMUs extends React.Component {
  componentDidMount() {
    const { fmus, fmu } = this.props;

    if (fmus.length) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
    }

    if (fmu) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }
  }

  componentDidUpdate(prevProps) {
    const { fmus: prevFmus, fmu: prevFmu } = prevProps;
    const { fmus, fmu } = this.props;

    if (!isEqual(fmus, prevFmus)) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
    }

    if (fmu.id !== prevFmu.id) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }

    if (
      fmu.loss &&
      prevFmu.loss &&
      (fmu.loss.startDate !== prevFmu.loss.startDate ||
       fmu.loss.trimeEndDate !== prevFmu.loss.trimeEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
    }

    if (
      fmu.glad &&
      prevFmu.glad &&
      (fmu.glad.startDate !== prevFmu.glad.startDate ||
        fmu.glad.trimeEndDate !== prevFmu.glad.trimeEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }
  }

  render() {
    const {
      fmus,
      operatorsDetailFmus,
      activeLayers,
      activeInteractiveLayersIds,
      legendLayers
    } = this.props;

    return (
      <div className="c-section -map">
        <Sidebar className="-fluid">
          {fmus && !!fmus.length && (
            <div>
              <SelectInput
                properties={{
                  default: fmus[0].id,
                  clearable: false
                }}
                options={fmus.map(f => ({
                  label: f.name,
                  value: f.id
                }))}
                onChange={(value) => {
                  this.props.setOperatorsDetailFmu(
                    fmus.find(f => f.id === value).id
                  );
                }}
              />
            </div>
          )}

          <Legend
            className="-relative"
            layerGroups={legendLayers}
            sortable={false}
            collapsable={false}
            // expanded={false}
            setLayerSettings={this.props.setOperatorsDetailMapLayersSettings}
          />
        </Sidebar>

        <div className="c-map-container -static">
          {/* Map */}
          <Map
            mapStyle="mapbox://styles/mapbox/light-v9"
            // viewport
            viewport={operatorsDetailFmus.map}
            onViewportChange={this.setMapocation}
            // Interaction
            interactiveLayerIds={activeInteractiveLayersIds}
            onClick={this.onClick}
            onHover={this.onHover}
            // Options
            transformRequest={(url, resourceType) => {
              if (
                resourceType == 'Source' &&
                url.startsWith(process.env.OTP_API)
              ) {
                return {
                  url,
                  headers: {
                    'Content-Type': 'application/json',
                    'OTP-API-KEY': process.env.OTP_API_KEY
                  }
                };
              }
            }}
          >
            {map => (
              <Fragment>
                {/* LAYER MANAGER */}
                <LayerManager map={map} layers={activeLayers} />
              </Fragment>
            )}
          </Map>
          {/* <Map
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
                    this.props.setOperatorsDetailAnalysis(fmu);
                  }
                  break;
                }
                default:

              }
            }}
          /> */}

          {/* MapControls */}
          {/* <MapControls>
            <ZoomControl
              zoom={operatorsDetailFmus.map.zoom}
              onZoomChange={(zoom) => {
                this.props.setMapLocation({
                  ...operatorsDetailFmus.map,
                  ...{ zoom }
                });
              }}
            />
          </MapControls> */}
        </div>
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
  intl: intlShape.isRequired,
  operatorsDetail: PropTypes.object.isRequired,
  fmus: PropTypes.array.isRequired,
  fmu: PropTypes.shape({}).isRequired,
  operatorsDetailFmus: PropTypes.object.isRequired,
  activeLayers: PropTypes.array,
  activeInteractiveLayersIds: PropTypes.array,
  legendLayers: PropTypes.array,

  setOperatorsDetailMapLayersSettings: PropTypes.func,
  setOperatorsDetailFmu: PropTypes.func,
  setOperatorsDetailAnalysis: PropTypes.func
};

export default injectIntl(
  connect(
    (state, props) => ({
      operatorsDetailFmus: state.operatorsDetailFmus,
      fmus: getFMUs(state, props),
      fmu: getFMU(state, props),
      activeLayers: getActiveLayers(state, props),
      activeInteractiveLayers: getActiveInteractiveLayers(state, props),
      activeInteractiveLayersIds: getActiveInteractiveLayersIds(state, props),
      legendLayers: getLegendLayers(state, props)
    }),
    {
      setOperatorsDetailMapLayersSettings,
      setOperatorsDetailFmu,
      setOperatorsDetailAnalysis
    }
  )(OperatorsDetailFMUs)
);
