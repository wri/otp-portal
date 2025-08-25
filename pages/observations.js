import React, { Fragment, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import orderBy from 'lodash/orderBy';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { injectIntl } from 'react-intl';

import getBBox from '@turf/bbox';

import modal from 'services/modal';

import { getParsedTableObservations } from 'selectors/observations/parsed-table-observations';
import { getParsedChartObservations } from 'selectors/observations/parsed-chart-observations';
import {
  getObservationsLayers,
  getObservationsLegend,
} from 'selectors/observations/parsed-map-observations';
import { getParsedFilters } from 'selectors/observations/parsed-filters';

import Layout from 'components/layout/layout';
import Overview from 'components/observations/overview';
import CheckboxGroup from 'components/form/CheckboxGroup';
import StaticHeader from 'components/ui/static-header';
import Table from 'components/ui/table';
import Filters from 'components/ui/observation-filters';
import Spinner from 'components/ui/spinner';
import StaticTabs from 'components/ui/static-tabs';

import FAAttributions from 'components/map/fa-attributions';

import {
  getObservations,
  getFilters,
  setFilters,
  getObservationsUrl,
  setActiveColumns,
  setObservationsMapLocation,
  setObservationsMapCluster
} from 'modules/observations';

import { FILTERS_REFS } from 'constants/observations';
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

const ObservationsPage = (props) => {
  const [tab, setTab] = useState('observations-list');
  const [popup, setPopup] = useState(null);
  const [bounds, setBounds] = useState(null);
  const mapRef = useRef(null);
  const makeJumpToStaticHeaderRef = useRef(false);

  useEffect(() => {
    const { router } = props;

    props.getFilters();
    props.getObservationsUrl(router);
    props.getObservations();
  }, []);

  useEffect(() => {
    props.getObservations();
    props.setObservationsMapCluster({});
    setPopup(null);
  }, [props.parsedFilters.data]);

  useEffect(() => {
    props.getObservationsUrl(props.router);
  }, [props.router.query]);

  useEffect(() => {
    const obsLayer = props.getObservationsLayers.find((l) => l.id === 'observations');
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
  }, [props.observations.data]);

  const onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions,
    });
  };

  const setActiveColumns = (value) => {
    props.setActiveColumns(value);
  };

  const triggerChangeTab = (tabValue) => {
    setTab(tabValue);
  };

  const onViewportChange = (mapLocation) => {
    // if zoom level changes (rounding as sometimes is like 4.999999...) then hide open cluster
    if (Math.round(props.observations.map.zoom) != Math.round(mapLocation.zoom)) {
      props.setObservationsMapCluster({});
    }
    props.setObservationsMapLocation(mapLocation);
  };

  const onClick = (e) => {
    const { cluster: clusterProp, map } = props.observations;
    const element = e.originalEvent.target;

    if (e.features && e.features.length && !element.classList?.contains('mapbox-prevent-click')) { // No better way to do this
      const { features, lngLat } = e;
      const feature = features[0];

      const { source, geometry, properties } = features[0];
      const { cluster, cluster_id: clusterId, point_count } = properties;

      if (cluster) {
        if (+clusterId !== +clusterProp.id) {
          if (map.zoom < 12 && point_count > 16) {
            props.setObservationsMapLocation({
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
                props.setObservationsMapCluster({});
                return true;
              }

              props.setObservationsMapCluster({
                id: clusterId,
                coordinates: geometry.coordinates,
                features: orderBy(fts, 'properties.level'),
                layers,
              });

              return fts;
            });
        } else {
          props.setObservationsMapCluster({});
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
        if (feature.layer.id !== 'observations-leaves') {
          props.setObservationsMapCluster({});
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

  const {
    observations,
    getObservationsLayers,
    getObservationsLegend,
    parsedFilters,
    parsedTableObservations,
    parsedChartObservations,
  } = props;

  const changeOfLabelLookup = {
    level: 'severity',
    observation: 'detail',
  };

  const columnHeaders = getColumnHeaders(props.intl);
  const inputs = tableCheckboxes;

  const tableOptions = inputs.map((column) => ({
    label: Object.keys(changeOfLabelLookup).includes(column)
      ? props.intl.formatMessage({ id: changeOfLabelLookup[column] })
      : props.intl.formatMessage({ id: column }),
    value: column,
  }));

  const interactiveLayerIds = [
    'observations-circle-0',
    'observations-symbol-1',
    'observations-circle-2'
  ]
  if (props.observations.cluster.id) {
    interactiveLayerIds.push('observations-leaves');
  }

  return (
    <Layout
      title="Observations"
      description="Observations description..."
    >
      <StaticHeader
        title={props.intl.formatMessage({ id: 'observations' })}
        background="/static/images/static-header/bg-observations.jpg"
      />

      <div className="c-section">
        <div className="l-container">
          <div className="row l-row">
            <div className="columns small-12 medium-4">
              <Filters
                options={parsedFilters.options}
                filters={parsedFilters.data}
                setFilters={props.setFilters}
                loading={observations.filters.loading}
                filtersRefs={FILTERS_REFS}
              />
            </div>

            <div className="columns small-12 medium-6 medium-offset-1">
              {/* Overview by category graphs */}
              <Overview
                parsedObservations={parsedChartObservations}
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
            label: props.intl.formatMessage({
              id: 'observations.tab.observations-list',
            }),
            value: 'observations-list',
          },
          {
            label: props.intl.formatMessage({
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
                onChange={(value) => setActiveColumns(value)}
                properties={{
                  default: observations.columns,
                  name: 'observations-columns',
                }}
                options={tableOptions}
              />
            </div>

            <Table
              className="-fit-to-page"
              sortable
              data={parsedTableObservations}
              options={{
                columns: columnHeaders.filter((header) =>
                  observations.columns.includes(header.accessor)
                ),
                pageSize: 50,
                pagination: true,
                previousText: '<',
                nextText: '>',
                noDataText: props.intl.formatMessage({
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
                showSubComponent: observations.columns.includes('location'),
                subComponent: (row) =>
                  observations.columns.includes('location') && (
                    <MapSubComponent
                      id={row.original.id}
                      language={props.language}
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
            language={props.language}
            // options
            scrollZoom={false}
            // viewport
            viewport={observations.map}
            onViewportChange={onViewportChange}
            // Bounds
            bounds={bounds}
            // Interaction
            interactiveLayerIds={interactiveLayerIds}
            onClick={onClick}
            onHover={props.onHover}
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
                <LayerManager map={map} layers={getObservationsLayers} />

                <MapControls>
                  <ZoomControl />
                </MapControls>
              </Fragment>
            )}
          </Map>

          {/* LEGEND */}
          <Legend
            layerGroups={getObservationsLegend}
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
  router: PropTypes.object.isRequired,
  observations: PropTypes.object,
  intl: PropTypes.object.isRequired,
  parsedFilters: PropTypes.object,
  getObservationsLayers: PropTypes.array,
  parsedChartObservations: PropTypes.array,
  parsedTableObservations: PropTypes.array,
  language: PropTypes.string.isRequired,

  getObservations: PropTypes.func.isRequired,
  getObservationsUrl: PropTypes.func.isRequired,
  setActiveColumns: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired,
  setObservationsMapLocation: PropTypes.func.isRequired,
  setObservationsMapCluster: PropTypes.func.isRequired,
};

export default withRouter(
  injectIntl(
    connect(
      (state, props) => ({
        language: state.language,
        observations: state.observations,
        parsedFilters: getParsedFilters(state),
        parsedTableObservations: getParsedTableObservations(state),
        parsedChartObservations: getParsedChartObservations(state),
        getObservationsLayers: getObservationsLayers(state),
        getObservationsLegend: getObservationsLegend(state, props),
      }),
      {
        getObservations,
        getFilters,
        getObservationsUrl,
        setObservationsMapLocation,
        setObservationsMapCluster,
        setFilters,
        setActiveColumns,
      }
    )(ObservationsPage)
  )
);
