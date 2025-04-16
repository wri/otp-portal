import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { injectIntl } from 'react-intl';
import { withRouter } from 'next/router';
import { connect } from 'react-redux';

import {
  getOperatorsRanking,
  setOperatorsMapLocation,
  setOperatorsMapInteractions,
  setOperatorsMapLayersActive,
  setOperatorsMapLayersSettings,
  setOperatorsSidebar,
  setOperatorsUrl,
  getOperatorsUrl,
  getIntegratedAlertsMetadata
} from 'modules/operators-ranking';
import { getActiveLayers, getActiveInteractiveLayers, getActiveInteractiveLayersIds, getLegendLayers, getPopup, getTable, getActiveCountries } from 'selectors/operators-ranking';

import modal from 'services/modal';

import { withDeviceInfo } from 'hooks/use-device-info';

import Layout from 'components/layout/layout';
import Sidebar from 'components/ui/sidebar';
import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';
import Popup from 'components/map/popup';
import Legend from 'components/map/legend';
import FAAttributions from 'components/map/fa-attributions';

import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';

import OperatorsFilters from 'components/operators/filters';
import OperatorsTable from 'components/operators/table';

import { BASEMAP_LAYERS, getOtpCountriesLayerFilter } from 'constants/layers';

class OperatorsPage extends React.Component {
  static async getInitialProps({ store }) {
    const { operatorsRanking, user } = store.getState();
    const { userAgent } = user;
    const isMobile = userAgent.isMobile;
    const requests = [];

    if (!operatorsRanking.data.length && !isMobile) {
      requests.push(store.dispatch(getOperatorsRanking()));
    }
    requests.push(store.dispatch(setOperatorsSidebar({ open: !userAgent.isMobile })));

    await Promise.all(requests);

    return {};
  }

  /* Component Lifecycle */
  componentDidMount() {
    const { router, operatorsRanking, isMobile } = this.props;

    // Set location
    this.props.setOperatorsMapLocation(getOperatorsUrl(router));
    if (!operatorsRanking.layersSettings['integrated-alerts']) {
      this.props.getIntegratedAlertsMetadata();
    }

    // lazy load on mobile
    if (isMobile) {
      this.props.getOperatorsRanking();
    }
  }

  componentWillUnMount() {
    // Attribution listener
    document.getElementById('forest-atlas-attribution').removeEventListener('click', this.onCustomAttribute);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeCountries !== this.props.activeCountries && this.map) {
      this.map.setFilter("otp_countries", getOtpCountriesLayerFilter(this.props.activeCountries));
    }

    if (prevProps.sidebar.open !== this.props.sidebar.open && this.map) {
      this.map.resize();
    }
  }

  onClick = (e) => {
    const element = e.originalEvent.target;
    if (e.features && e.features.length && !element.classList?.contains('mapbox-prevent-click')) { // No better way to do this
      const { features, lngLat } = e;
      this.props.setOperatorsMapInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsMapInteractions({});
    }
  }

  onLoad = ({ map }) => {
    const countriesLayer = BASEMAP_LAYERS.find(x => x.id === 'otp_countries');
    if (countriesLayer) {
      map.addLayer(countriesLayer);
    }
    this.map = map;
    document.getElementById('forest-atlas-attribution').addEventListener('click', this.onCustomAttribute);
  }

  setMapLocation = debounce((mapLocation) => {
    this.props.setOperatorsMapLocation(mapLocation);
  }, 700);

  onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions
    });
  }

  render() {
    const {
      language,
      operatorsRanking,
      activeLayers,
      activeInteractiveLayers,
      activeInteractiveLayersIds,
      legendLayers,
      popup,
      map,
      sidebar,
      setOperatorsSidebar
    } = this.props;

    const { open } = sidebar;

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        className="-fullscreen"
        footer={false}
      >
        <div className="c-section -map">
          <Sidebar
            open={open}
            name={this.props.intl.formatMessage({ id: 'transparency_ranking' })}
            onToggle={(o) => {
              setOperatorsSidebar({ open: o });
            }}
          >
            <OperatorsFilters />
            <OperatorsTable />
          </Sidebar>

          <div className="c-map-container -absolute" style={{ width: `calc(100% - ${open ? 800 : 50}px)`, left: open ? 800 : 50 }}>
            {/* Map */}
            <Map
              language={language}

              // viewport
              viewport={map}
              onViewportChange={this.setMapLocation}

              // Interaction
              interactiveLayerIds={activeInteractiveLayersIds}
              onClick={this.onClick}
              onLoad={this.onLoad}
              customAttribution='<a id="forest-atlas-attribution" href="http://cod.forest-atlas.org/?l=en" rel="noopener noreferrer" target="_blank">Forest Atlas</a>'
            >
              {map => (
                <Fragment>
                  <MapControls>
                    <ZoomControl />
                  </MapControls>

                  <Popup
                    popup={popup}
                    template="fmus"
                    templateProps={{
                      layers: activeInteractiveLayers
                    }}
                    onClose={() => this.props.setOperatorsMapInteractions({})}
                  />
                  {/* LAYER MANAGER */}
                  <LayerManager
                    map={map}
                    layers={activeLayers}
                  />
                </Fragment>
              )}
            </Map>

            <Legend
              layerGroups={legendLayers}
              expanded={false}
              setLayerSettings={this.props.setOperatorsMapLayersSettings}
            />
          </div>
        </div>
      </Layout>
    );
  }
}

OperatorsPage.propTypes = {
  router: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  deviceInfo: PropTypes.object,
};

export default withRouter(withDeviceInfo(injectIntl(connect(
  (state, props) => ({
    language: state.language,
    isMobile: state.user.userAgent.isMobile,
    operatorsRanking: state.operatorsRanking,
    map: state.operatorsRanking.map,
    sidebar: state.operatorsRanking.sidebar,
    activeCountries: getActiveCountries(state, props),
    activeLayers: getActiveLayers(state, props),
    activeInteractiveLayers: getActiveInteractiveLayers(state, props),
    activeInteractiveLayersIds: getActiveInteractiveLayersIds(state, props),
    legendLayers: getLegendLayers(state, props),
    popup: getPopup(state, props)
  }),
  dispatch => ({
    getOperatorsRanking() {
      dispatch(getOperatorsRanking());
    },
    getIntegratedAlertsMetadata() {
      dispatch(getIntegratedAlertsMetadata());
    },
    setOperatorsMapLocation(mapLocation) {
      dispatch(setOperatorsMapLocation(mapLocation));
      dispatch(setOperatorsUrl(mapLocation));
    },
    setOperatorsMapInteractions(obj) {
      dispatch(setOperatorsMapInteractions(obj));
    },
    setOperatorsMapLayersActive(obj) {
      dispatch(setOperatorsMapLayersActive(obj));
    },
    setOperatorsMapLayersSettings(obj) {
      dispatch(setOperatorsMapLayersSettings(obj));
    },
    setOperatorsSidebar(obj) {
      dispatch(setOperatorsSidebar(obj));
    }
  })
)(OperatorsPage))));
