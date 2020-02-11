/* eslint-disable react/prefer-stateless-function */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import isEqual from 'lodash/isEqual';

import getBBox from '@turf/bbox';

// Redux
import { connect } from 'react-redux';
import {
  setOperatorsDetailMapLayersSettings,
  setOperatorsDetailFmu,
  setOperatorsDetailFmuBounds,
  setOperatorsDetailAnalysis,
  setOperatorsDetailMapInteractions,
  setOperatorsDetailMapHoverInteractions
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

class OperatorsDetailFMUs extends React.Component {
  componentDidMount() {
    const { fmus, fmu } = this.props;

    if (fmus.length) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
      this.getBBOX();
    }

    if (fmu) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }
  }

  componentDidUpdate(prevProps) {
    const { fmus: prevFmus, fmu: prevFmu, interactions: prevInteractions } = prevProps;
    const { fmus, fmu, interactions } = this.props;

    if (!isEqual(fmus, prevFmus)) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
      this.getBBOX();
    }

    if (fmu.id !== prevFmu.id) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'glad');
    }

    if (!isEqual(interactions, prevInteractions)) {
      const { fmus: interactionsFmus } = interactions;
      if (interactionsFmus) {
        this.props.setOperatorsDetailFmu(interactionsFmus.data.id);
      }
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

  onClick = (e) => {
    if (e.features && e.features.length && !e.target.classList.contains('mapbox-prevent-click')) { // No better way to do this
      const { features, lngLat } = e;
      this.props.setOperatorsDetailMapInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsDetailMapInteractions({});
    }
  }

  onHover = (e) => {
    if (e.features && e.features.length) {
      const { features, lngLat } = e;
      this.props.setOperatorsDetailMapHoverInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsDetailMapHoverInteractions({});
    }
  }

  getBBOX = () => {
    const { fmus } = this.props;

    const bbox = getBBox({
      type: 'FeatureCollection',
      features: fmus.map(f => f.geojson)
    });

    this.props.setOperatorsDetailFmuBounds({
      bbox,
      options: {
        padding: {
          top: 50,
          bottom: 50,
          left: 350,
          right: 50
        }
      }
    });

  }

  render() {
    const {
      fmu,
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
            <div className="c-fmu-card">
              <h3 className="c-title -extrabig -uppercase -proximanova">Analysis</h3>
              <p>Select a fmu by using the following select or by clicking on the map shapes.</p>

              <div className="fmu-select">
                <select
                  value={fmu.id}
                  onChange={(e) => {
                    this.props.setOperatorsDetailFmu(
                      fmus.find(f => Number(f.id) === Number(e.currentTarget.value)).id
                    );
                  }}
                >
                  {fmus.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>

                <div className="fmu-select-value">{fmu.name}</div>
              </div>

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
            bounds={fmu.bounds}

            // options
            scrollZoom={false}

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
  interactions: PropTypes.shape({}).isRequired,
  fmus: PropTypes.array.isRequired,
  fmu: PropTypes.shape({}).isRequired,
  fmuBounds: PropTypes.shape({}).isRequired,
  operatorsDetailFmus: PropTypes.object.isRequired,
  activeLayers: PropTypes.array,
  activeInteractiveLayersIds: PropTypes.array,
  legendLayers: PropTypes.array,

  setOperatorsDetailMapLayersSettings: PropTypes.func,
  setOperatorsDetailFmu: PropTypes.func,
  setOperatorsDetailFmuBounds: PropTypes.func,
  setOperatorsDetailAnalysis: PropTypes.func,
  setOperatorsDetailMapInteractions: PropTypes.func,
  setOperatorsDetailMapHoverInteractions: PropTypes.func
};

export default injectIntl(
  connect(
    (state, props) => ({
      operatorsDetailFmus: state.operatorsDetailFmus,
      interactions: state.operatorsDetailFmus.interactions,
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
      setOperatorsDetailFmuBounds,
      setOperatorsDetailAnalysis,
      setOperatorsDetailMapInteractions,
      setOperatorsDetailMapHoverInteractions
    }
  )(OperatorsDetailFMUs)
);
