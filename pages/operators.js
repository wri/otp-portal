import React, { Fragment } from 'react';
import debounce from 'lodash/debounce';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { getOperators } from 'modules/operators';
import {
  getOperatorsRanking,
  setOperatorsMapLocation,
  setOperatorsMapInteractions,
  setOperatorsMapHoverInteractions,
  setOperatorsMapLayersActive,
  setOperatorsMapLayersSettings,
  setOperatorsUrl,
  getOperatorsUrl
} from 'modules/operators-ranking';
import { getActiveLayers, getActiveInteractiveLayers, getActiveInteractiveLayersIds, getLegendLayers, getPopup } from 'selectors/operators-ranking';

import withTracker from 'components/layout/with-tracker';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import Sidebar from 'components/ui/sidebar';
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import Popup from 'components/map-new/popup';
import Legend from 'components/map-new/legend';

import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';

// Operators components
import OperatorsFilters from 'components/operators/filters';
import OperatorsTable from 'components/operators/table';


class OperatorsPage extends Page {
  /* Component Lifecycle */
  componentDidMount() {
    const { url, operators, operatorsRanking } = this.props;

    // Get search operators data
    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }

    if (!operatorsRanking.data.length) {
      // Get operators
      this.props.getOperatorsRanking();
    }

    // Set location
    this.props.setOperatorsMapLocation(getOperatorsUrl(url));

    // Set discalimer
    if (!Cookies.get('operators.disclaimer')) {
      toastr.info(
        'Info',
        this.props.intl.formatMessage({ id: 'operators.disclaimer' }),
        {
          className: '-disclaimer',
          position: 'bottom-right',
          timeOut: 15000,
          onCloseButtonClick: () => {
            Cookies.set('operators.disclaimer', true);
          }
        }
      );
    }
  }

  componentWillUnMount() {
    toastr.remove('operators.disclaimer');
  }

  onClick = (e) => {
    if (e.features && e.features.length && !e.target.classList.contains('mapbox-prevent-click')) { // No better way to do this
      const { features, lngLat } = e;
      this.props.setOperatorsMapInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsMapInteractions({});
    }
  }

  onHover = (e) => {
    if (e.features && e.features.length) {
      const { features, lngLat } = e;
      this.props.setOperatorsMapHoverInteractions({ features, lngLat });
    } else {
      this.props.setOperatorsMapHoverInteractions({});
    }
  }

  // toggleLayers = (id, checked) => {
  //   const { layersActive } = this.props.operators.map;

  //   const toggledLayers = checked ?
  //     [...layersActive, id] : layersActive.filter(layerId => layerId !== id);

  //   this.props.setActiveMapLayers(toggledLayers);
  // }

  setMapocation = debounce((mapLocation) => {
    this.props.setOperatorsMapLocation(mapLocation);
  }, 500);


  render() {
    const {
      url,
      operators,
      operatorsRanking,
      activeLayers,
      activeInteractiveLayers,
      activeInteractiveLayersIds,
      legendLayers,
      popup
    } = this.props;

    return (
      <Layout
        title="Operators"
        description="Operators description..."
        url={url}
        className="-fullscreen"
        footer={false}
        searchList={operators.data}
      >
        <div className="c-section -map">
          <Sidebar>
            <OperatorsFilters />
            <OperatorsTable operators={operatorsRanking.data} />
          </Sidebar>

          <div className="c-map-container -absolute" style={{ width: 'calc(100% - 600px)', left: 600 }}>
            {/* Map */}
            <Map
              mapStyle="mapbox://styles/mapbox/light-v9"

              // viewport
              viewport={operatorsRanking.map}
              onViewportChange={this.setMapocation}

              // Interaction
              interactiveLayerIds={activeInteractiveLayersIds}
              onClick={this.onClick}
              onHover={this.onHover}

              // Options
              transformRequest={(url, resourceType) => {
                if (resourceType == 'Source' && url.startsWith(process.env.OTP_API)) {
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
                  <Popup
                    popup={popup}
                    layers={activeInteractiveLayers}
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
              sortable={false}
              collapsable={false}
              // expanded={false}
              setLayerSettings={this.props.setOperatorsMapLayersSettings}
            />

            {/* MapControls */}
            <MapControls>
              <ZoomControl
                zoom={operatorsRanking.map.zoom}
                onZoomChange={(zoom) => {
                  this.props.setOperatorsMapLocation({
                    ...operatorsRanking.map,
                    zoom,
                    transitionDuration: 500
                  });
                }}
              />
            </MapControls>
          </div>
        </div>
      </Layout>
    );
  }
}

OperatorsPage.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(connect(

  state => ({
    operators: state.operators,
    operatorsRanking: state.operatorsRanking,
    activeLayers: getActiveLayers(state),
    activeInteractiveLayers: getActiveInteractiveLayers(state),
    activeInteractiveLayersIds: getActiveInteractiveLayersIds(state),
    legendLayers: getLegendLayers(state),
    popup: getPopup(state)
  }),
  dispatch => ({
    getOperators() {
      dispatch(getOperators());
    },
    getOperatorsRanking() {
      dispatch(getOperatorsRanking());
    },
    setOperatorsMapLocation(mapLocation) {
      dispatch(setOperatorsMapLocation(mapLocation));
      dispatch(setOperatorsUrl(mapLocation));
    },
    setOperatorsMapInteractions(obj) {
      dispatch(setOperatorsMapInteractions(obj));
    },
    setOperatorsMapHoverInteractions(obj) {
      dispatch(setOperatorsMapHoverInteractions(obj));
    },
    setOperatorsMapLayersActive(obj) {
      dispatch(setOperatorsMapLayersActive(obj));
    },
    setOperatorsMapLayersSettings(obj) {
      dispatch(setOperatorsMapLayersSettings(obj));
    }
  })
)(OperatorsPage)));
