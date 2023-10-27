/* eslint-disable react/prefer-stateless-function */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

import getBBox from '@turf/bbox';

// Redux
import { connect } from 'react-redux';
import {
  getIntegratedAlertsMetadata,
  setOperatorsDetailMapLocation,
  setOperatorsDetailMapLayersSettings,
  setOperatorsDetailFmu,
  setOperatorsDetailFmuBounds,
  setOperatorsDetailAnalysis,
  setOperatorsDetailMapInteractions,
  setOperatorsDetailMapHoverInteractions,
} from 'modules/operators-detail-fmus';
import {
  getActiveLayers,
  getActiveHoverInteractiveLayers,
  getActiveInteractiveLayersIds,
  getLegendLayers,
  getFMUs,
  getFMU,
  getPopup,
  getHoverPopup,
} from 'selectors/operators-detail/fmus';

// Intl
import { injectIntl } from 'react-intl';

// Services
import modal from 'services/modal';

// Components
import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import FAAttributions from 'components/map/fa-attributions';

import Sidebar from 'components/ui/sidebar';
import Legend from 'components/map/legend';
import Popup from 'components/map/popup';

import { CERTIFICATIONS } from 'constants/fmu';

import { withDeviceInfo } from 'hooks/use-device-info';

import { transformRequest } from 'utils/map';

class OperatorsDetailFMUs extends React.Component {
  componentDidMount() {
    const { fmus, fmu, operatorsDetailFmus } = this.props;


    if (!operatorsDetailFmus.layersSettings['integrated-alerts']) {
      this.props.getIntegratedAlertsMetadata();
    }

    if (fmus.length) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
      this.getBBOX();
    }

    if (fmu) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'integrated-alerts');
    }
  }

  componentDidUpdate(prevProps) {
    const {
      fmus: prevFmus,
      fmu: prevFmu,
      interactions: prevInteractions,
    } = prevProps;
    const { fmus, fmu, interactions } = this.props;

    if (!isEqual(fmus, prevFmus)) {
      this.props.setOperatorsDetailFmu(fmus[0].id);
      this.getBBOX();
    }

    if (fmu.id !== prevFmu.id) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
      this.props.setOperatorsDetailAnalysis(fmu, 'integrated-alerts');
    }

    if (!isEqual(interactions, prevInteractions)) {
      const { fmusdetail: interactionsFmus } = interactions;
      if (interactionsFmus) {
        this.props.setOperatorsDetailFmu(interactionsFmus.data.id);
      }
    }

    if (
      fmu.loss &&
      prevFmu.loss &&
      (fmu.loss.startDate !== prevFmu.loss.startDate ||
        fmu.loss.trimEndDate !== prevFmu.loss.trimEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis(fmu, 'loss');
    }

    if (
      fmu['integrated-alerts'] &&
      prevFmu['integrated-alerts'] &&
      (fmu['integrated-alerts'].startDate !== prevFmu['integrated-alerts'].startDate ||
        fmu['integrated-alerts'].trimEndDate !== prevFmu['integrated-alerts'].trimEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis(fmu, 'integrated-alerts');
    }
  }

  componentWillUnmount() {
    // Attribution listener
    document
      .getElementById('forest-atlas-attribution')
      .removeEventListener('click', this.onCustomAttribute);
  }

  // eslint-disable-next-line class-methods-use-this
  onCustomAttribute(e) {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions,
    });
  }

  onClick = (e) => {
    if (
      e.features &&
      e.features.length &&
      !e.target.classList.contains('mapbox-prevent-click')
    ) {
      // No better way to do this
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

  onViewportChange = debounce((v) => {
    this.props.setOperatorsDetailMapLocation(v);
  }, 250);

  getBBOX() {
    const { fmus, deviceInfo } = this.props;

    const bbox = getBBox({
      type: 'FeatureCollection',
      features: fmus.map((f) => f.geojson),
    });

    this.props.setOperatorsDetailFmuBounds({
      bbox,
      options: {
        padding: {
          top: deviceInfo.isMobile ? 350 : 50,
          bottom: 50,
          left: deviceInfo.isMobile ? 50 : 350,
          right: 50,
        },
      },
    });
  }

  render() {
    const {
      hoverPopup,
      fmu,
      fmus,
      operatorsDetailFmus,
      activeLayers,
      hoverActiveInteractiveLayers,
      activeInteractiveLayersIds,
      legendLayers,
      deviceInfo
    } = this.props;

    const certifications = CERTIFICATIONS.filter(
      ({ value }) => fmu[`certification-${value}`]
    ).map((ct) => ct.label);

    return (
      <div className="c-section -map -sm-flex-column">
        <Sidebar className="-fmumap">
          {fmus && !!fmus.length && (
            <div className="c-fmu-card">
              <h3 className="c-title -big -uppercase -proximanova">
                {this.props.intl.formatMessage({ id: 'analysis' })}
              </h3>
              <p>
                {this.props.intl.formatMessage({ id: 'analysis.description' })}
              </p>

              <div className="fmu-select">
                <select
                  value={fmu.id}
                  onChange={(e) => {
                    this.props.setOperatorsDetailFmu(
                      fmus.find(
                        (f) => Number(f.id) === Number(e.currentTarget.value)
                      ).id
                    );
                  }}
                >
                  {fmus.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <div className="fmu-select-value">{fmu.name}</div>
              </div>

              {!!certifications.length && (
                <div className="fmu-certifications">
                  <div className="fmu-certifications-title">
                    {this.props.intl.formatMessage({ id: 'certifications' })}:
                  </div>
                  <div className="fmu-certifications-list">
                    {certifications.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {!deviceInfo.isMobile && (
            <Legend
              className="-relative"
              layerGroups={legendLayers}
              sortable={false}
              collapsable={false}
              setLayerSettings={this.props.setOperatorsDetailMapLayersSettings}
            />
          )}

        </Sidebar>

        <div className="c-map-container -static">
          {/* Map */}
          <Map
            mapStyle="mapbox://styles/mapbox/light-v9"
            language={this.props.language}
            bounds={fmu.bounds}
            // options
            scrollZoom={false}
            // viewport
            viewport={operatorsDetailFmus.map}
            onViewportChange={this.onViewportChange}
            // Interaction
            interactiveLayerIds={activeInteractiveLayersIds}
            onClick={this.onClick}
            onHover={this.onHover}
            onLoad={() => {
              // Attribution listener
              document
                .getElementById('forest-atlas-attribution')
                .addEventListener('click', this.onCustomAttribute);
            }}
            // Options
            transformRequest={transformRequest}
            mapOptions={{
              customAttribution:
                '<a id="forest-atlas-attribution" href="http://cod.forest-atlas.org/?l=en" rel="noopener noreferrer" target="_blank">Forest Atlas</a>',
            }}
          >
            {(map) => (
              <Fragment>
                {/* LAYER MANAGER */}
                <LayerManager map={map} layers={activeLayers} />

                {deviceInfo.isMobile && (
                  <Legend
                    className="-relative"
                    layerGroups={legendLayers}
                    sortable={false}
                    setLayerSettings={this.props.setOperatorsDetailMapLayersSettings}
                  />
                )}

                <Popup
                  popup={hoverPopup}
                  template="fmus-detail"
                  templateProps={{
                    layers: hoverActiveInteractiveLayers
                  }}
                />
              </Fragment>
            )}
          </Map>

          {/* MapControls */}
          <MapControls>
            <ZoomControl
              zoom={operatorsDetailFmus.map.zoom}
              onZoomChange={(zoom) => {
                this.props.setOperatorsDetailMapLocation({
                  ...operatorsDetailFmus.map,
                  zoom,
                  transitionDuration: 500,
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
  deviceInfo: PropTypes.object,
  intl: PropTypes.object.isRequired,
  interactions: PropTypes.shape({}).isRequired,
  fmus: PropTypes.array.isRequired,
  fmu: PropTypes.shape({}).isRequired,
  operatorsDetailFmus: PropTypes.object.isRequired,
  activeLayers: PropTypes.array,
  hoverPopup: PropTypes.shape({}).isRequired,
  hoverActiveInteractiveLayers: PropTypes.array,
  activeInteractiveLayersIds: PropTypes.array,
  legendLayers: PropTypes.array,
  language: PropTypes.string.isRequired,

  getIntegratedAlertsMetadata: PropTypes.func,
  setOperatorsDetailMapLocation: PropTypes.func,
  setOperatorsDetailMapLayersSettings: PropTypes.func,
  setOperatorsDetailFmu: PropTypes.func,
  setOperatorsDetailFmuBounds: PropTypes.func,
  setOperatorsDetailAnalysis: PropTypes.func,
  setOperatorsDetailMapInteractions: PropTypes.func,
  setOperatorsDetailMapHoverInteractions: PropTypes.func,
};

export default withDeviceInfo(injectIntl(
  connect(
    (state, props) => ({
      language: state.language,
      operatorsDetailFmus: state.operatorsDetailFmus,
      interactions: state.operatorsDetailFmus.interactions,
      hoverInteractions: state.operatorsDetailFmus.hoverInteractions,
      fmus: getFMUs(state, props),
      fmu: getFMU(state, props),
      popup: getPopup(state, props),
      hoverPopup: getHoverPopup(state, props),
      activeLayers: getActiveLayers(state, props),
      hoverActiveInteractiveLayers: getActiveHoverInteractiveLayers(
        state,
        props
      ),
      activeInteractiveLayersIds: getActiveInteractiveLayersIds(state, props),
      legendLayers: getLegendLayers(state, props),
    }),
    {
      getIntegratedAlertsMetadata,
      setOperatorsDetailMapLocation,
      setOperatorsDetailMapLayersSettings,
      setOperatorsDetailFmu,
      setOperatorsDetailFmuBounds,
      setOperatorsDetailAnalysis,
      setOperatorsDetailMapInteractions,
      setOperatorsDetailMapHoverInteractions,
    }
  )(OperatorsDetailFMUs)
));
