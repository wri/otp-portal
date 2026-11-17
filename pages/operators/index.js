import React, { Fragment, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'utils/general';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

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
import { isMobileUserAgent } from 'utils/user-agent';

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

function OperatorsPage({ language, isMobile }) {
  const router = useRouter();
  const intl = useIntl();
  const dispatch = useDispatch();
  const operatorsRanking = useSelector((state) => state.operatorsRanking);
  const { map, sidebar } = operatorsRanking;
  const activeCountries = useSelector(getActiveCountries);
  const activeLayers = useSelector(getActiveLayers);
  const activeInteractiveLayers = useSelector(getActiveInteractiveLayers);
  const activeInteractiveLayersIds = useSelector(getActiveInteractiveLayersIds);
  const legendLayers = useSelector((state) => getLegendLayers(state, { intl }));
  const popup = useSelector(getPopup);

  // the location also goes into the URL, so a shared link opens the same view
  const updateMapLocation = (mapLocation) => {
    dispatch(setOperatorsMapLocation(mapLocation));
    dispatch(setOperatorsUrl(mapLocation));
  };
  const mapRef = useRef(null);

  const onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions
    });
  };

  useEffect(() => {
    // Set location
    updateMapLocation(getOperatorsUrl(router));
    if (!operatorsRanking.layersSettings['integrated-alerts']) {
      dispatch(getIntegratedAlertsMetadata());
    }

    // lazy load on mobile
    if (isMobile) {
      dispatch(getOperatorsRanking());
    }

    return () => {
      // Attribution listener cleanup
      const attribution = document.getElementById('forest-atlas-attribution');
      if (attribution) {
        attribution.removeEventListener('click', onCustomAttribute);
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && activeCountries !== undefined) {
      mapRef.current.setFilter("otp_countries", getOtpCountriesLayerFilter(activeCountries));
    }
  }, [activeCountries]);

  useEffect(() => {
    if (mapRef.current && sidebar.open !== undefined) {
      mapRef.current.resize();
    }
  }, [sidebar.open]);

  const onClick = (e) => {
    const element = e.originalEvent.target;
    if (e.features && e.features.length && !element.classList?.contains('mapbox-prevent-click')) {
      const features = JSON.parse(JSON.stringify(e.features));
      const lngLat = JSON.parse(JSON.stringify(e.lngLat));
      dispatch(setOperatorsMapInteractions({ features, lngLat }));
    } else {
      dispatch(setOperatorsMapInteractions({}));
    }
  };

  const onLoad = ({ map }) => {
    const countriesLayer = BASEMAP_LAYERS.find(x => x.id === 'otp_countries');
    if (countriesLayer) {
      map.addLayer(countriesLayer);
    }
    mapRef.current = map;
    document.getElementById('forest-atlas-attribution').addEventListener('click', onCustomAttribute);
  };

  const setMapLocation = debounce((mapLocation) => {
    updateMapLocation(mapLocation);
  }, 700);

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
          name={intl.formatMessage({ id: 'transparency_ranking' })}
          onToggle={(o) => {
            dispatch(setOperatorsSidebar({ open: o }));
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
            onViewportChange={setMapLocation}

            // Interaction
            interactiveLayerIds={activeInteractiveLayersIds}
            onClick={onClick}
            onLoad={onLoad}
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
                  onClose={() => dispatch(setOperatorsMapInteractions({}))}
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
            setLayerSettings={(payload) => dispatch(setOperatorsMapLayersSettings(payload))}
          />
        </div>
      </div>
    </Layout>
  );
}

OperatorsPage.getInitialProps = async ({ store, req }) => {
  const { operatorsRanking } = store.getState();
  const isMobile = isMobileUserAgent(req ? req.headers['user-agent'] : navigator.userAgent);
  const requests = [];

  if (!operatorsRanking.data.length && !isMobile) {
    requests.push(store.dispatch(getOperatorsRanking()));
  }
  requests.push(store.dispatch(setOperatorsSidebar({ open: !isMobile })));

  await Promise.all(requests);

  return { isMobile };
};

OperatorsPage.propTypes = {
  language: PropTypes.string.isRequired,
  isMobile: PropTypes.bool
};

export default OperatorsPage;
