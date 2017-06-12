import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

// Components
import Spinner from 'components/ui/spinner';

// Services
import LayerManager from 'services/layerManager';

let Mapboxgl;
if (typeof window !== 'undefined') {
  Mapboxgl = require('mapbox-gl');
  Mapboxgl.accessToken = process.env.MAPBOX_API_KEY;
}

const MAP_OPTIONS = {
  zoom: 2,
  minZoom: 2,
  maxZoom: 20,
  style: 'mapbox://styles/mapbox/light-v9',
  center: [0, 0]
};


export default class Map extends React.Component {

  /**
   * CONSTRUCTOR
  **/
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * COMPONENT LYFECYLE
  **/
  componentDidMount() {
    this.mounted = true;
    if (Mapboxgl) {
      const mapOptions = { ...MAP_OPTIONS, ...this.props.mapOptions };

      this.map = new Mapboxgl.Map({
        container: this.mapNode,
        ...mapOptions
      });

      this.setState({ loading: true });

      this.map.on('load', () => {
        this.setState({ loading: false });

        // Add event mapListeners
        this.props.mapListeners && this.setMapEventListeners();

        // // Exec mapbox methods
        // this.execMethods();

        // Add layers
        this.initLayerManager();
        this.props.layers.length && this.addLayer(this.props.layers);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // Fitbounds
    if (!isEqual(this.props.mapMethods.fitBounds, nextProps.mapMethods.fitBounds)) {
      this.map.fitBounds(nextProps.mapMethods.fitBounds);
    }

    // Layers
    if (!isEqual(this.props.layers, nextProps.layers)) {
      this.layerManager.removeAllLayers();
      this.addLayer(nextProps.layers);
    }

    // Zoom
    if (this.props.mapOptions.zoom !== nextProps.mapOptions.zoom) {
      this.map.setZoom(nextProps.mapOptions.zoom);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const loadingChanged = this.state.loading !== nextState.loading;
    return loadingChanged;
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.mapListeners && this.removeMapEventListeners();
    this.map && this.map.remove();
  }

  setAttribution() {
    this.map.attributionControl.addAttribution(this.props.mapMethods.attribution);
  }

  /**
   * MAP LISTENERS
   * - setMapEventListeners
   * - removeMapEventListeners
  */
  setMapEventListeners() {
    const { mapListeners } = this.props;

    Object.keys(mapListeners).forEach((eventName) => {
      this.map.on(eventName, (...args) => mapListeners[eventName](this.map, ...args));
    });
  }

  removeMapEventListeners() {
    const { mapListeners } = this.props;
    const eventNames = Object.keys[mapListeners];
    eventNames && eventNames.forEach(eventName => this.map.off(eventName));
  }

  /**
   * MAP METHODS
  */
  execMethods() {
    Object.keys(this.props.mapMethods).forEach((name) => {
      const methodName = name.charAt(0).toUpperCase() + name.slice(1);
      const fnName = `set${methodName}`;
      typeof this[fnName] === 'function' && this[fnName].call(this);
    });
  }

  /**
   * LAYER MANAGER
  */
  initLayerManager() {
    const stopLoading = () => {
      this.mounted && this.setState({ loading: false });
    };

    this.layerManager = new LayerManager(this.map, {
      onLayerAddedSuccess: stopLoading,
      onLayerAddedError: stopLoading
    });
  }

  /* Layer methods */
  addLayer(layer) {
    this.setState({ loading: true });
    if (Array.isArray(layer)) {
      layer.forEach(l => this.layerManager.addLayer(l));
      return;
    }
    this.layerManager.addLayer(layer);
  }

  removeLayer(layer) {
    if (Array.isArray(layer)) {
      layer.forEach(l => this.layerManager.removeLayer(l.id));
      return;
    }
    this.layerManager.removeLayer(layer.id);
  }

  /* Render method */
  render() {
    return (
      <div className="c-map">
        <div
          ref={(node) => {
            this.mapNode = node;
          }}
          className="map-leaflet"
        />
        <Spinner isLoading={this.state.loading} className="-absolute" />
      </div>
    );
  }
}

Map.propTypes = {
  mapOptions: PropTypes.object,
  mapMethods: PropTypes.object,
  mapListeners: PropTypes.object,
  layers: PropTypes.array
};

Map.defaultProps = {
  mapOptions: {},
  mapMethods: {},
  mapListeners: {},
  layers: []
};
