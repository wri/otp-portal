import React, { Fragment, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { debounce, groupBy } from 'utils/general';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';


import modal from 'services/modal';
import { fetchApi } from 'services/fetch-api';
import { fetchIntegratedAlertsSettings } from 'components/map/integrated-alerts-layer';
import useApi from 'hooks/use-api';
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
import useRankingMap from 'components/operators/use-ranking-map';
import { FILTER_OPTIONS, initRankingState, rankingReducer, setOperatorsUrl } from 'components/operators/ranking-state';

import { BASEMAP_LAYERS, getOtpCountriesLayerFilter } from 'constants/layers';

const NO_OPERATORS = [];

function fetchOperatorsRanking(language) {
  return fetchApi('operators', {
    locale: language,
    cache: true,
    params: {
      'page[size]': 3000,
      include: 'fmus,country',
      'filter[fa]': true,
      'filter[country]': process.env.OTP_COUNTRIES_IDS,
      'fields[fmus]': 'name,forest-type,certification-fsc,certification-olb,certification-pefc,certification-pbn,certification-pafc,certification-fsc-cw,certification-tlv,certification-ls',
      'fields[countries]': 'name',
      'fields[operators]': 'name,slug,obs-per-visit,percentage-valid-documents-all,score,country,fmus',
    }
  }).then((data) => {
    const groupByDocPercentage = groupBy(data, (o) => {
      if (typeof o['percentage-valid-documents-all'] !== 'number') return 0;
      return o['percentage-valid-documents-all'];
    });

    return Object.keys(groupByDocPercentage).sort().reverse()
      .map((k, i) => groupByDocPercentage[k].map(o => ({ ...o, ranking: i })))
      .flat();
  });
}

function OperatorsPage({ language, isMobile, operators: serverOperators }) {
  const intl = useIntl();
  const router = useRouter();
  const mapRef = useRef(null);
  const [state, dispatch] = useReducer(rankingReducer, { query: router.query, isMobile }, initRankingState);
  const { map, sidebar, filters } = state;

  // phones get the page without the list and load it here
  const lazyRanking = useApi(serverOperators ? null : `ranking:${intl.locale}`, () => fetchOperatorsRanking(intl.locale));
  const operators = serverOperators || lazyRanking.data || NO_OPERATORS;
  const operatorsLoading = !serverOperators && lazyRanking.loading;

  const {
    activeCountries,
    activeLayers,
    interactiveLayerIds: activeInteractiveLayersIds,
    clickedLayers: activeInteractiveLayers,
    legendLayers,
    popup
  } = useRankingMap(state);

  const setOperatorsMapInteractions = (payload) => dispatch({ type: 'interactions', payload });
  const setOperatorsMapLayersSettings = (payload) => dispatch({ type: 'layerSettings', payload });

  const onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions
    });
  };

  useEffect(() => {
    fetchIntegratedAlertsSettings().then(
      (settings) => dispatch({ type: 'integratedAlerts', payload: settings }),
      console.error
    );

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
      setOperatorsMapInteractions({ features, lngLat });
    } else {
      setOperatorsMapInteractions({});
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
    dispatch({ type: 'map', payload: mapLocation });
    setOperatorsUrl(mapLocation);
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
            dispatch({ type: 'sidebar', payload: { open: o } });
          }}
        >
          <OperatorsFilters
            filters={filters}
            options={FILTER_OPTIONS}
            setFilters={(filter) => dispatch({ type: 'filter', payload: filter })}
          />
          <OperatorsTable
            operators={operators}
            isLoading={operatorsLoading}
            filters={filters}
          />
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
                  onClose={() => setOperatorsMapInteractions({})}
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
            setLayerSettings={setOperatorsMapLayersSettings}
          />
        </div>
      </div>
    </Layout>
  );
}

OperatorsPage.getInitialProps = async ({ req, language }) => {
  const ua = req ? req.headers['user-agent'] : navigator.userAgent;
  const isMobile = isMobileUserAgent(ua);
  if (isMobile) return { isMobile, operators: null };

  const operators = await fetchOperatorsRanking(language).catch((error) => {
    console.error(error);
    return [];
  });
  return { isMobile, operators };
};

OperatorsPage.propTypes = {
  language: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
  operators: PropTypes.array
};

export default OperatorsPage;
