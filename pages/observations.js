import React, { Fragment } from 'react';
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

class ObservationsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tab: 'observations-list',
      popup: null
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  componentDidMount() {
    const { router } = this.props;

    this.props.getFilters();
    this.props.getObservationsUrl(router);
    this.props.getObservations();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.parsedFilters.data, prevProps.parsedFilters.data)) {
      this.props.getObservations();
      this.props.setObservationsMapCluster({});
      this.setState({ popup: null });
    }

    if (!isEqual(this.props.router.query, prevProps.router.query)) {
      this.props.getObservationsUrl(this.props.router);
    }

    // when the data is loaded fitBounds to selected observations
    if (!isEqual(this.props.observations.data, prevProps.observations.data)) {
      const obsLayer = this.props.getObservationsLayers.find((l) => l.id === 'observations');
      if (obsLayer) {
        const bbox = getBBox(obsLayer.source.data);
        this.setState({
          bounds: {
            bbox,
            options: {
              padding: 50,
              maxZoom: 6
            },
          }
        });
      }
    }
  }

  onCustomAttribute = (e) => {
    e.preventDefault();
    modal.toggleModal(true, {
      children: FAAttributions,
    });
  };

  setActiveColumns(value) {
    this.props.setActiveColumns(value);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  onViewportChange = (mapLocation) => {
    // if zoom level changes (rounding as sometimes is like 4.999999...) then hide open cluster
    if (Math.round(this.props.observations.map.zoom) != Math.round(mapLocation.zoom)) {
      this.props.setObservationsMapCluster({});
    }
    this.props.setObservationsMapLocation(mapLocation);
  };

  onClick = (e) => {
    const { cluster: clusterProp, map } = this.props.observations;
    const element = e.originalEvent.target;

    if (e.features && e.features.length && !element.classList?.contains('mapbox-prevent-click')) { // No better way to do this
      const { features, lngLat } = e;
      const feature = features[0];

      const { source, geometry, properties } = features[0];
      const { cluster, cluster_id: clusterId, point_count } = properties;

      if (cluster) {
        if (+clusterId !== +clusterProp.id) {
          if (map.zoom < 12 && point_count > 16) {
            this.props.setObservationsMapLocation({
              ...map,
              longitude: lngLat.lng,
              latitude: lngLat.lat,
              zoom: map.zoom + 2
            });
            return;
          }

          const layers = this.map
            .getStyle()
            .layers.filter((l) => l.source === source);

          this.map
            .getSource(source)
            .getClusterLeaves(clusterId, point_count, 0, (error, fts) => {
              if (error) {
                this.props.setObservationsMapCluster({});
                return true;
              }

              this.props.setObservationsMapCluster({
                id: clusterId,
                coordinates: geometry.coordinates,
                features: orderBy(fts, 'properties.level'),
                layers,
              });

              return fts;
            });
        } else {
          this.props.setObservationsMapCluster({});
        }

        if (this.state.popup) {
          this.setState({ popup: null });
        }
      } else {
        this.setState({
          popup: {
            props: {
              longitude: lngLat.lng,
              latitude: lngLat.lat,
            },
            template: 'observation',
            templateProps: {
              data: feature.properties
            }
          }
        });
        if (feature.layer.id !== 'observations-leaves') {
          this.props.setObservationsMapCluster({});
        }
      }
    }
  }

  jumpToStaticHeader() {
    const element = document.querySelector('header.c-static-tabs');
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onShowObservations = () => {
    let delay = 0;
    if (this.state.tab !== 'observations-list') {
      this.setState({ tab: 'observations-list' });
      delay = 100;
    }

    setTimeout(this.jumpToStaticHeader, delay);
  }

  onShowMap = () => {
    if (this.state.tab !== 'map-view') {
      this.setState({ tab: 'map-view' });
      this.makeJumpToStaticHeader = true;
    } else {
      this.jumpToStaticHeader();
    }
  }

  onMapLoaded = ({ map }) => {
    this.map = map;

    // Attribution listener
    document
      .getElementById('forest-atlas-attribution')
      .addEventListener('click', this.onCustomAttribute);

    if (this.makeJumpToStaticHeader) {
      this.jumpToStaticHeader();
      this.makeJumpToStaticHeader = false;
    }
  }

  render() {
    const {
      observations,
      getObservationsLayers,
      getObservationsLegend,
      parsedFilters,
      parsedTableObservations,
      parsedChartObservations,
    } = this.props;
    const { popup } = this.state;

    const changeOfLabelLookup = {
      level: 'severity',
      observation: 'detail',
    };

    const columnHeaders = getColumnHeaders(this.props.intl);
    const inputs = tableCheckboxes;

    const tableOptions = inputs.map((column) => ({
      label: Object.keys(changeOfLabelLookup).includes(column)
        ? this.props.intl.formatMessage({ id: changeOfLabelLookup[column] })
        : this.props.intl.formatMessage({ id: column }),
      value: column,
    }));

    const interactiveLayerIds = [
      'observations-circle-0',
      'observations-symbol-1',
      'observations-circle-2'
    ]
    if (this.props.observations.cluster.id) {
      interactiveLayerIds.push('observations-leaves');
    }

    return (
      <Layout
        title="Observations"
        description="Observations description..."
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'observations' })}
          background="/static/images/static-header/bg-observations.jpg"
        />

        <div className="c-section">
          <div className="l-container">
            <div className="row l-row">
              <div className="columns small-12 medium-4">
                <Filters
                  options={parsedFilters.options}
                  filters={parsedFilters.data}
                  setFilters={this.props.setFilters}
                  loading={observations.filters.loading}
                  filtersRefs={FILTERS_REFS}
                />
              </div>

              <div className="columns small-12 medium-6 medium-offset-1">
                {/* Overview by category graphs */}
                <Overview
                  parsedObservations={parsedChartObservations}
                  loading={observations.loading}
                  onShowObservations={this.onShowObservations}
                  onShowMap={this.onShowMap}
                />
              </div>
            </div>
          </div>
        </div>

        <StaticTabs
          options={[
            {
              label: this.props.intl.formatMessage({
                id: 'observations.tab.observations-list',
              }),
              value: 'observations-list',
            },
            {
              label: this.props.intl.formatMessage({
                id: 'observations.tab.map',
              }),
              value: 'map-view',
            },
          ]}
          selected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        {this.state.tab === 'observations-list' && (
          <section className="c-section -relative">
            <div className="l-container">
              <Spinner isLoading={observations.loading} />
              <div className="c-field -fluid -valid">
                <CheckboxGroup
                  className="-single-row -small -secondary"
                  name="observations-columns"
                  onChange={(value) => this.setActiveColumns(value)}
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
                  noDataText: this.props.intl.formatMessage({
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
                        language={this.props.language}
                        location={row.original.location}
                        level={row.original.level}
                      />
                    ),
                }}
              />
            </div>
          </section>
        )}

        {this.state.tab === 'map-view' && (
          <div className="c-map-container -static">
            <Spinner isLoading={observations.loading} />
            {/* Map */}
            <Map
              language={this.props.language}
              // options
              scrollZoom={false}
              // viewport
              viewport={observations.map}
              onViewportChange={this.onViewportChange}
              // Bounds
              bounds={this.state.bounds}
              // Interaction
              interactiveLayerIds={interactiveLayerIds}
              onClick={this.onClick}
              onHover={this.onHover}
              onLoad={this.onMapLoaded}
              onUnmount={() => (this.map = null)}
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
                      onClose={() => this.setState({ popup: null })}
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
              sortable={false}
              expanded={false}
              toolbar={<></>}
              setLayerSettings={() => { }}
            />
          </div>
        )}
      </Layout>
    );
  }
}

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
