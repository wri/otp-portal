import Mapboxgl from 'mapbox-gl';

export default class LayerManager {

  /* Constructor */
  constructor(map, options = {}) {
    this.map = map;
    this.mapLayers = {};
    this.onLayerAddedSuccess = options.onLayerAddedSuccess;
    this.onLayerAddedError = options.onLayerAddedError;

    this.initPopup();
  }

  initPopup() {
    this.popup = new Mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
  }

  /* Public methods */
  addLayer(layer, opts = {}) {
    const method = {
      cartodb: this.addCartoLayer
    }[layer.provider];

    method && method.call(this, layer, opts);
  }

  removeLayer(layerId) {
    if (this.mapLayers[layerId]) {
      this.map.removeLayer(this.mapLayers[layerId]);
      delete this.mapLayers[layerId];
    }
  }

  removeAllLayers() {
    const layerIds = Object.keys(this.mapLayers);
    if (!layerIds.length) return;
    layerIds.forEach(id => this.removeLayer(id));
  }

  /**
   * PRIVATE METHODS
   */
  addCartoLayer(layer) {
    this.map.addSource(layer.id, layer.source);

    // Loop trough layers
    layer.layer.forEach((l) => {
      // Create a popup, but don't add it to the map yet.

      // Add layer
      this.map.addLayer(l);

      // // Add interactivity (if exists)
      // this.map.on('click', l.id, (e) => {
      //   // Populate the popup and set its coordinates
      //   // based on the feature found.
      //   this.popup.setLngLat(e.lngLat)
      //       .setHTML(e.features[0].properties.fmu_name)
      //       .addTo(this.map);
      // });
    });
  }
}
