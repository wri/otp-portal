/* eslint-disable react/prefer-stateless-function */
import React, { Fragment, useEffect, useMemo, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';

import isEqual from 'react-fast-compare';
import { debounce } from 'utils/general';

import getBBox from '@turf/bbox';

import {
  buildFmuLayers,
  buildFmuLegendLayers,
  buildSelectedFmu,
  getLoadedFmus,
  getSelectedFmuId
} from 'components/operators-detail/fmu-map';
import { collectInteractiveLayerIds } from 'utils/map-layers';
import { fmusReducer, initialFmusState, runFmuAnalysis } from 'components/operators-detail/fmus-state';
import { fetchIntegratedAlertsSettings } from 'services/integrated-alerts-layer';

// Intl
import { useIntl } from 'react-intl';

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

import useDeviceInfo from 'hooks/use-device-info';

class OperatorsDetailFMUs extends React.Component {
  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      hoverPopup: null
    };
  }

  componentDidMount() {
    const { fmus, fmu, operatorsDetailFmus } = this.props;

    if (!operatorsDetailFmus.layersSettings['integrated-alerts']) {
      this.props.getIntegratedAlertsMetadata();
    }

    if (fmus.length) {
      this.fitBounds();
    }

    if (fmu.id) {
      this.props.setOperatorsDetailAnalysis({ fmu, type: 'loss' });
      this.props.setOperatorsDetailAnalysis({ fmu, type: 'integrated-alerts' });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      fmus: prevFmus,
      fmu: prevFmu,
      fmuId: prevFmuId
    } = prevProps;
    const { fmus, fmu, fmuId } = this.props;

    // fmuId changes without a remount: dropdown, map click, search, back button
    if (!isEqual(fmus, prevFmus) || fmuId !== prevFmuId) {
      if (fmus.length) {
        this.fitBounds();
      } else {
        this.props.setOperatorsDetailMapLocation({
          zoom: 5,
          latitude: 0,
          longitude: 20,
        });
      }
    }

    if (fmu.id && fmu.id !== prevFmu.id) {
      this.props.setOperatorsDetailAnalysis({ fmu, type: 'loss' });
      this.props.setOperatorsDetailAnalysis({ fmu, type: 'integrated-alerts' });
    }

    if (
      fmu.id &&
      fmu.loss &&
      prevFmu.loss &&
      (fmu.loss.startDate !== prevFmu.loss.startDate ||
        fmu.loss.trimEndDate !== prevFmu.loss.trimEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis({ fmu, type: 'loss' });
    }

    if (
      fmu.id &&
      fmu['integrated-alerts'] &&
      prevFmu['integrated-alerts'] &&
      (fmu['integrated-alerts'].startDate !== prevFmu['integrated-alerts'].startDate ||
        fmu['integrated-alerts'].trimEndDate !== prevFmu['integrated-alerts'].trimEndDate)
    ) {
      this.props.setOperatorsDetailAnalysis({ fmu, type: 'integrated-alerts' });
    }
  }

  componentWillUnmount() {
    // Attribution listener
    const faElement = document.getElementById('forest-atlas-attribution');
    if (faElement) {
      faElement.removeEventListener('click', this.onCustomAttribute);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onCustomAttribute(e) {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions,
    });
  }

  onClick = (e) => {
    const element = e.originalEvent.target;

    if (
      e.features &&
      e.features.length &&
      !element.classList?.contains('mapbox-prevent-click')
    ) {
      const clickedFmu = e.features.find(f => f.source === 'fmusdetail')?.properties;
      if (clickedFmu) {
        this.props.onFmuChange(clickedFmu.id);
      }
    }
  }

  onHover = (e) => {
    if (e.features && e.features.length) {
      const { features, lngLat } = e;
      this.setState({
        hoverPopup: {
          longitude: lngLat.lng,
          latitude: lngLat.lat,
          layers: features.map((f) => {
            const { source, properties } = f;
            return {
              id: source,
              data: {
                data: properties
              }
            };
          })
        }
      })
    } else {
      this.setState({ hoverPopup: null });
    }
  }

  onViewportChange = debounce((v) => {
    this.props.setOperatorsDetailMapLocation(v);
  }, 250);

  // Zoom to the selected FMU, or fit all of them when none is selected
  fitBounds() {
    const { fmus, fmu } = this.props;
    const selected = fmu.id && fmus.find((f) => f.id === fmu.id);

    this.getBBOX(selected ? [selected] : fmus);
  }

  getBBOX(fmus) {
    const { deviceInfo } = this.props;

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
      fmu,
      fmus,
      operatorsDetail,
      operatorsDetailFmus,
      activeLayers,
      activeInteractiveLayersIds,
      legendLayers,
      deviceInfo
    } = this.props;
    const { hoverPopup } = this.state;

    const selectFmuPlaceholder = this.props.intl.formatMessage({
      id: 'operator-detail.fmus.select',
      defaultMessage: 'Select FMU'
    });

    const certifications = CERTIFICATIONS.filter(
      ({ value }) => fmu[`certification-${value}`]
    ).map((ct) => ct.label);

    // use loaded operator data to not have flickering message when more fmus data is still loading (fmus property)
    const operatorHasNoFMUS = operatorsDetail.data && (!operatorsDetail.data.fmus || !operatorsDetail.data.fmus.length);

    if (operatorHasNoFMUS) {
      return (
        <div className="c-section">
          <div className="l-container">
            <div className="c-no-data">
              {this.props.intl.formatMessage({
                id: 'operator-detail.overview.cardfmu.none',
                defaultMessage: 'There are no FMUs managed by {company_name}.'
              }, { company_name: operatorsDetail.data.name || '' })}
            </div>
          </div>
        </div>
      )
    }

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
                  value={fmu.id || ''}
                  data-test-id="fmu-select"
                  onChange={(e) => this.props.onFmuChange(e.currentTarget.value || undefined)}
                >
                  {!fmu.id && (
                    <option value="" disabled>{selectFmuPlaceholder}</option>
                  )}
                  {!!fmu.id && fmus.length > 1 && (
                    <option value="">
                      {this.props.intl.formatMessage({ id: 'operator-detail.fmus.show_all', defaultMessage: 'Show all FMUs' })}
                    </option>
                  )}
                  {fmus.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <div className="fmu-select-value">{fmu.name || selectFmuPlaceholder}</div>
              </div>

              {!!certifications.length && (
                <div className="fmu-certifications">
                  <div className="fmu-certifications-title">
                    {this.props.intl.formatMessage({ id: 'certifications' })}:
                  </div>
                  <ul className="fmu-certifications-list">
                    {certifications.map((certification, index) => (
                      <li key={index}>{certification}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!deviceInfo.isMobile && (
            <Legend
              className="-relative"
              layerGroups={legendLayers}
              collapsable={false}
              setLayerSettings={this.props.setOperatorsDetailMapLayersSettings}
            />
          )}

        </Sidebar>

        <div className="c-map-container -static">
          {/* Map */}
          <Map
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
            customAttribution='<a id="forest-atlas-attribution" href="http://cod.forest-atlas.org/?l=en" rel="noopener noreferrer" target="_blank">Forest Atlas</a>'
          >
            {(map) => (
              <Fragment>
                {/* LAYER MANAGER */}
                <LayerManager map={map} layers={activeLayers} />

                {deviceInfo.isMobile && (
                  <Legend
                    className="-relative"
                    layerGroups={legendLayers}
                    setLayerSettings={this.props.setOperatorsDetailMapLayersSettings}
                  />
                )}

                {hoverPopup && (
                  <Popup
                    popup={hoverPopup}
                    template="fmus-detail"
                    templateProps={{
                      layers: hoverPopup?.layers
                    }}
                  />
                )}

                <MapControls>
                  <ZoomControl />
                </MapControls>
              </Fragment>
            )}
          </Map>
        </div>
      </div>
    );
  }
}

OperatorsDetailFMUs.propTypes = {
  deviceInfo: PropTypes.object,
  intl: PropTypes.object.isRequired,
  fmus: PropTypes.array.isRequired,
  fmu: PropTypes.shape({}).isRequired,
  fmuId: PropTypes.string,
  onFmuChange: PropTypes.func.isRequired,
  operatorsDetail: PropTypes.object.isRequired,
  operatorsDetailFmus: PropTypes.object.isRequired,
  activeLayers: PropTypes.array,
  activeInteractiveLayersIds: PropTypes.array,
  legendLayers: PropTypes.array,
  language: PropTypes.string.isRequired,

  getIntegratedAlertsMetadata: PropTypes.func,
  setOperatorsDetailMapLocation: PropTypes.func,
  setOperatorsDetailMapLayersSettings: PropTypes.func,
  setOperatorsDetailFmuBounds: PropTypes.func,
  setOperatorsDetailAnalysis: PropTypes.func
};

// Map, layer and analysis state for the tab, handed to the class component as it got it from the store
const OperatorsDetailFMUsContainer = ({ operatorsDetail, fmuId, onFmuChange }) => {
  const intl = useIntl();
  const deviceInfo = useDeviceInfo();
  const [state, dispatch] = useReducer(fmusReducer, initialFmusState);
  // analysis requests read the stored geostore ids when they start, not when they were created
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const actions = useMemo(() => ({
    getIntegratedAlertsMetadata: () => fetchIntegratedAlertsSettings().then(
      (settings) => dispatch({ type: 'integratedAlerts', payload: settings }),
      console.error
    ),
    setOperatorsDetailMapLocation: (payload) => dispatch({ type: 'mapLocation', payload }),
    setOperatorsDetailMapLayersSettings: (payload) => dispatch({ type: 'layerSettings', payload }),
    setOperatorsDetailFmuBounds: (payload) => dispatch({ type: 'fmuBounds', payload }),
    setOperatorsDetailAnalysis: (arg) => runFmuAnalysis(arg, dispatch, () => stateRef.current)
  }), []);

  const operator = operatorsDetail.data;
  const { layersActive, layersSettings, fmuBounds, analysis } = state;
  const fmus = useMemo(() => getLoadedFmus(operator), [operator]);
  const selectedFmuId = getSelectedFmuId(fmus, fmuId);
  const activeLayers = useMemo(
    () => buildFmuLayers(layersActive, layersSettings, selectedFmuId, operator),
    [layersActive, layersSettings, selectedFmuId, operator]
  );
  const interactiveLayerIds = useMemo(() => collectInteractiveLayerIds(activeLayers), [activeLayers]);
  const legendLayers = useMemo(
    () => buildFmuLegendLayers(layersSettings, layersActive, analysis, selectedFmuId, intl),
    [layersSettings, layersActive, analysis, selectedFmuId, intl]
  );
  const fmu = useMemo(
    () => buildSelectedFmu(fmus, selectedFmuId, fmuBounds, layersSettings),
    [fmus, selectedFmuId, fmuBounds, layersSettings]
  );

  return (
    <OperatorsDetailFMUs
      {...actions}
      intl={intl}
      deviceInfo={deviceInfo}
      language={intl.locale}
      operatorsDetail={operatorsDetail}
      operatorsDetailFmus={state}
      fmus={fmus}
      fmu={fmu}
      fmuId={fmuId}
      onFmuChange={onFmuChange}
      activeLayers={activeLayers}
      activeInteractiveLayersIds={interactiveLayerIds}
      legendLayers={legendLayers}
    />
  );
};

OperatorsDetailFMUsContainer.propTypes = {
  operatorsDetail: PropTypes.object.isRequired,
  fmuId: PropTypes.string,
  onFmuChange: PropTypes.func.isRequired
};

export default OperatorsDetailFMUsContainer;
