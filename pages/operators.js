import React from 'react';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';

import * as Cookies from 'js-cookie';

// Toastr
import { toastr } from 'react-redux-toastr';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { store } from 'store';
import { getOperators, setActiveMapLayers } from 'modules/operators';
import { getOperatorsRanking, setOperatorsMapLocation, setOperatorsUrl, getOperatorsUrl } from 'modules/operators-ranking';
import withTracker from 'components/layout/with-tracker';

// Constants
import { MAP_LAYERS_OPERATORS } from 'constants/operators';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import Sidebar from 'components/ui/sidebar';
import Map from 'components/map/map';
import MapLegend from 'components/map/map-legend';
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

  toggleLayers = (id, checked) => {
    const { activeLayers } = this.props.operators.map;

    const toggledLayers = checked ?
      [...activeLayers, id] : activeLayers.filter(layerId => layerId !== id);

    this.props.setActiveMapLayers(toggledLayers);
  }

  render() {
    const { url, operators, operatorsRanking } = this.props;
    const { activeLayers } = operators.map;


    const mapLayers = MAP_LAYERS_OPERATORS.filter(layer => activeLayers.includes(layer.id));

    // Country filters
    const countryOptions = operatorsRanking.filters.options.country.map(country => country.value);
    const activeCountryIds = operatorsRanking.filters.data.country || [];

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

          <div className="c-map-container -absolute" style={{ width: 'calc(100% - 650px)', left: 650 }}>
            {/* Map */}
            <Map
              mapFilters={{
                COUNTRY_IDS: (activeCountryIds.length) ? activeCountryIds : countryOptions
              }}
              mapOptions={operatorsRanking.map}
              mapListeners={{
                moveend: debounce((map) => {
                  this.props.setOperatorsMapLocation({
                    zoom: map.getZoom(),
                    center: map.getCenter()
                  });
                }, 100)
              }}
              layers={mapLayers}
            />
            <MapLegend
              layers={flatten(MAP_LAYERS_OPERATORS.map(layer =>
                layer.layers.filter(l => l.legendConfig)
              ))}
              toggleLayers={this.toggleLayers}
              activeLayers={activeLayers}
            />

            {/* MapControls */}
            <MapControls>
              <ZoomControl
                zoom={operatorsRanking.map.zoom}
                onZoomChange={(zoom) => {
                  this.props.setOperatorsMapLocation({
                    ...{ zoom }
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
    operatorsRanking: state.operatorsRanking
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
      dispatch(setOperatorsUrl());
    },
    setActiveMapLayers(activeLayers) {
      dispatch(setActiveMapLayers(activeLayers));
    }
  })
)(OperatorsPage)));
