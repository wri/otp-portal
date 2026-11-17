import React, { Fragment, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'utils/general';
import dynamic from 'next/dynamic';
import { useIntl } from 'react-intl';

import getBBox from '@turf/bbox';

import modal from 'services/modal';
import { fetchApi } from 'services/fetch-api';
import useDeepCompareEffect from 'hooks/use-deep-compare-effect';
import useApi from 'hooks/use-api';
import useUrlFilters from 'hooks/use-url-filters';
import { parseObjectSelectOptions, getApiFiltersParams } from 'utils/general';

import { parseObservations } from 'services/observations';
import useFilterOptions from 'hooks/use-filter-options';
import { OBSERVATIONS_LEAVES_LAYER_ID } from 'components/observations/map-layers';
import useObservationsMap from 'components/observations/use-observations-map';

import Layout from 'components/layout/layout';
import Overview from 'components/observations/overview';
import CheckboxGroup from 'components/form/CheckboxGroup';
import StaticHeader from 'components/ui/static-header';
import Table from 'components/ui/table';
import Filters from 'components/ui/observation-filters';
import Spinner from 'components/ui/spinner';
import StaticTabs from 'components/ui/static-tabs';

import FAAttributions from 'components/map/fa-attributions';

import { FILTERS_REFS, FILTER_RULES } from 'constants/observations';
import {
  tableCheckboxes,
  getColumnHeaders,
} from 'constants/observations-column-headers';

const MapSubComponent = dynamic(() => import('components/ui/map-sub-component'), { ssr: false });
const Map = dynamic(() => import('components/map'), { ssr: false });
const Legend = dynamic(() => import('components/map/legend'), { ssr: false });
const Popup = dynamic(() => import('components/map/popup'), { ssr: false });
const MapControls = dynamic(() => import('components/map/map-controls'), { ssr: false });
const ZoomControl = dynamic(() => import('components/map/controls/zoom-control'), { ssr: false });
const LayerManager = dynamic(() => import('components/map/layer-manager'), { ssr: false });

const OBS_MAX_SIZE = 3000;
const OBSERVATION_INCLUDES = [
  'country',
  'subcategory',
  'subcategory.category',
  'operator',
  'severity',
  'fmu',
  'observation-report',
  'observers',
  'observation-documents',
  'relevant-operators'
].join(',');
const FRONTEND_FILTERS = {
  hidden: [{ id: 'all', name: 'all' }]
};
const DEFAULT_COLUMNS = ['date', 'country', 'operator', 'category', 'observation', 'level', 'fmu', 'report'];
const DEFAULT_MAP_LOCATION = { zoom: 5, latitude: -1.45, longitude: 15 };
const NO_OBSERVATIONS = [];
const NO_OPTIONS = {};
const NO_CLUSTER = {};

function fetchObservations(filters, locale) {
  return fetchApi('observations', {
    locale,
    params: {
      'page[size]': OBS_MAX_SIZE,
      include: OBSERVATION_INCLUDES,
      'fields[fmus]': 'name',
      'fields[operators]': 'name,slug,operator-type,fa-id,is-active',
      'fields[severities]': 'details,level',
      'fields[subcategories]': 'name,category',
      'fields[categories]': 'name',
      'fields[countries]': 'iso,name',
      'fields[observers]': 'name,observer-type,public-info,address,information-email,information-name,information-phone,data-email,data-name,data-phone',
      'fields[observation-reports]': 'attachment,title,publication-date,mission-type',
      'fields[observation-documents]': 'attachment,name',
      ...getApiFiltersParams(filters)
    }
  });
}

function fetchFilterOptions(locale) {
  return fetchApi('observation_filters_tree', { locale, deserialize: false, cache: true })
    .then((data) => parseObjectSelectOptions({ ...data, ...FRONTEND_FILTERS }));
}

const ObservationsPage = ({ language }) => {
  const intl = useIntl();
  const [tab, setTab] = useState('observations-list');
  const [popup, setPopup] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [mapLocation, setMapLocation] = useState(DEFAULT_MAP_LOCATION);
  const [openCluster, setOpenCluster] = useState(NO_CLUSTER);
  const mapRef = useRef(null);
  const makeJumpToStaticHeaderRef = useRef(false);

  const [filters, setFilters] = useUrlFilters();
  const filterOptions = useApi(`observation-filters:${intl.locale}`, () => fetchFilterOptions(intl.locale));
  const observations = useApi(
    `observations:${intl.locale}:${JSON.stringify(filters)}`,
    () => fetchObservations(filters, intl.locale)
  );

  const data = observations.data || NO_OBSERVATIONS;
  const options = useFilterOptions(filters, filterOptions.data || NO_OPTIONS, FILTER_RULES);
  const tableRows = useMemo(() => parseObservations(data), [data]);
  const { layers, interactiveLayerIds, legend } = useObservationsMap(data, openCluster, mapLocation.zoom);

  // new filters mean new markers, so a cluster or popup left open would point at nothing
  const [shownFilters, setShownFilters] = useState(filters);
  if (shownFilters !== filters) {
    setShownFilters(filters);
    setOpenCluster(NO_CLUSTER);
    setPopup(null);
  }

  useDeepCompareEffect(() => {
    const obsLayer = layers.find((l) => l.id === 'observations');
    if (obsLayer) {
      const bbox = getBBox(obsLayer.source.data);
      setBounds({
        bbox,
        options: {
          padding: 50,
          maxZoom: 6
        },
      });
    }
  }, [data]);

  const onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions,
    });
  };

  const triggerChangeTab = (tabValue) => {
    setTab(tabValue);
  };

  const onViewportChange = (nextLocation) => {
    // if zoom level changes (rounding as sometimes is like 4.999999...) then hide open cluster
    if (Math.round(mapLocation.zoom) != Math.round(nextLocation.zoom)) {
      setOpenCluster(NO_CLUSTER);
    }
    setMapLocation(nextLocation);
  };

  const onClick = (e) => {
    const map = mapLocation;
    const element = e.originalEvent.target;

    if (e.features && e.features.length && !element.classList?.contains('mapbox-prevent-click')) { // No better way to do this
      const { features, lngLat } = e;
      const feature = features[0];

      const { source, geometry, properties } = features[0];
      const { cluster, cluster_id: clusterId, point_count } = properties;

      if (cluster) {
        if (+clusterId !== +openCluster.id) {
          if (map.zoom < 12 && point_count > 16) {
            setMapLocation({
              ...map,
              longitude: lngLat.lng,
              latitude: lngLat.lat,
              zoom: map.zoom + 2
            });
            return;
          }

          const layers = mapRef.current
            .getStyle()
            .layers.filter((l) => l.source === source);

          mapRef.current
            .getSource(source)
            .getClusterLeaves(clusterId, point_count, 0, (error, fts) => {
              if (error) {
                setOpenCluster(NO_CLUSTER);
                return true;
              }

              setOpenCluster({
                id: clusterId,
                coordinates: geometry.coordinates,
                features: sortBy(fts, 'properties.level'),
                layers,
              });

              return fts;
            });
        } else {
          setOpenCluster(NO_CLUSTER);
        }

        if (popup) {
          setPopup(null);
        }
      } else {
        setPopup({
          props: {
            longitude: lngLat.lng,
            latitude: lngLat.lat,
          },
          template: 'observation',
          templateProps: {
            data: feature.properties
          }
        });
        if (feature.layer.id !== OBSERVATIONS_LEAVES_LAYER_ID) {
          setOpenCluster(NO_CLUSTER);
        }
      }
    }
  };

  const jumpToStaticHeader = () => {
    const element = document.querySelector('header.c-static-tabs');
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onShowObservations = () => {
    let delay = 0;
    if (tab !== 'observations-list') {
      setTab('observations-list');
      delay = 100;
    }

    setTimeout(jumpToStaticHeader, delay);
  };

  const onShowMap = () => {
    if (tab !== 'map-view') {
      setTab('map-view');
      makeJumpToStaticHeaderRef.current = true;
    } else {
      jumpToStaticHeader();
    }
  };

  const onMapLoaded = ({ map }) => {
    mapRef.current = map;

    // Attribution listener
    document
      .getElementById('forest-atlas-attribution')
      .addEventListener('click', onCustomAttribute);

    if (makeJumpToStaticHeaderRef.current) {
      jumpToStaticHeader();
      makeJumpToStaticHeaderRef.current = false;
    }
  };

  const changeOfLabelLookup = {
    level: 'severity',
    observation: 'detail',
  };

  const columnHeaders = getColumnHeaders(intl);
  const inputs = tableCheckboxes;

  const tableOptions = inputs.map((column) => ({
    label: Object.keys(changeOfLabelLookup).includes(column)
      ? intl.formatMessage({ id: changeOfLabelLookup[column] })
      : intl.formatMessage({ id: column }),
    value: column,
  }));

  return (
    <Layout
      title="Observations"
      description="Observations description..."
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'observations' })}
        background="/static/images/static-header/bg-observations.jpg"
      />

      <div className="c-section">
        <div className="l-container">
          <div className="row l-row">
            <div className="columns small-12 medium-4">
              <Filters
                options={options}
                filters={filters}
                setFilters={setFilters}
                loading={filterOptions.loading}
                filtersRefs={FILTERS_REFS}
              />
            </div>

            <div className="columns small-12 medium-6 medium-offset-1">
              {/* Overview by category graphs */}
              <Overview
                observations={data}
                loading={observations.loading}
                onShowObservations={onShowObservations}
                onShowMap={onShowMap}
              />
            </div>
          </div>
        </div>
      </div>

      <StaticTabs
        options={[
          {
            label: intl.formatMessage({
              id: 'observations.tab.observations-list',
            }),
            value: 'observations-list',
          },
          {
            label: intl.formatMessage({
              id: 'observations.tab.map',
            }),
            value: 'map-view',
          },
        ]}
        selected={tab}
        onChange={triggerChangeTab}
      />

      {tab === 'observations-list' && (
        <section className="c-section -relative">
          <div className="l-container">
            <Spinner isLoading={observations.loading} />
            <div className="c-field -fluid -valid">
              <CheckboxGroup
                className="-single-row -small -secondary"
                name="observations-columns"
                onChange={setColumns}
                properties={{
                  default: columns,
                  name: 'observations-columns',
                }}
                options={tableOptions}
              />
            </div>

            <Table
              className="-fit-to-page"
              sortable
              data={tableRows}
              options={{
                columns: columnHeaders.filter((header) =>
                  columns.includes(header.accessor)
                ),
                pageSize: 50,
                pagination: true,
                previousText: '<',
                nextText: '>',
                noDataText: intl.formatMessage({
                  id: 'observations.no-data',
                  defaultMessage: 'There are no observations that match your selected criteria'
                }),
                showPageSizeOptions: false,
                loading: observations.loading,
                // Api pagination & sort
                // pages: observations.totalSize,
                // page: this.state.page - 1,
                // manual: true
                defaultSorted: [
                  {
                    id: 'date',
                    desc: true,
                  },
                ],
                showSubComponent: columns.includes('location'),
                subComponent: (row) =>
                  columns.includes('location') && (
                    <MapSubComponent
                      id={row.original.id}
                      language={language}
                      location={row.original.location}
                      level={row.original.level}
                    />
                  ),
              }}
            />
          </div>
        </section>
      )}

      {tab === 'map-view' && (
        <div className="c-map-container -static">
          <Spinner isLoading={observations.loading} />
          {/* Map */}
          <Map
            language={language}
            // options
            scrollZoom={false}
            // viewport
            viewport={mapLocation}
            onViewportChange={onViewportChange}
            // Bounds
            bounds={bounds}
            // Interaction
            interactiveLayerIds={interactiveLayerIds}
            onClick={onClick}
            onLoad={onMapLoaded}
            onUnmount={() => (mapRef.current = null)}
            // Options
            customAttribution='<a id="forest-atlas-attribution" href="http://cod.forest-atlas.org/?l=en" rel="noopener noreferrer" target="_blank">Forest Atlas</a>'
          >
            {(map) => (
              <Fragment>
                {/* LAYER MANAGER */}
                {popup && (
                  <Popup
                    popup={popup.props}
                    template={popup.template}
                    templateProps={popup.templateProps}
                    onClose={() => setPopup(null)}
                  />
                )}
                <LayerManager map={map} layers={layers} />

                <MapControls>
                  <ZoomControl />
                </MapControls>
              </Fragment>
            )}
          </Map>

          {/* LEGEND */}
          <Legend
            layerGroups={legend}
            expanded={false}
            toolbar={<></>}
            setLayerSettings={() => { }}
          />
        </div>
      )}
    </Layout>
  );
};

ObservationsPage.propTypes = {
  language: PropTypes.string.isRequired,
};

export default ObservationsPage;
