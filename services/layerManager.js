import Mapboxgl from 'mapbox-gl';

export default class LayerManager {

  /* Constructor */
  constructor(map, options = {}) {
    this.map = map;
    this.mapLayers = {};
    this.onLayerAddedSuccess = options.onLayerAddedSuccess;
    this.onLayerAddedError = options.onLayerAddedError;

    // Init popup
    this.initPopup();
  }

  initPopup() {
    this.Popup = Mapboxgl.Popup;
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
      const interactivity = l.interactivity;

      // Add layer
      this.map.addLayer(l);

      // Add interactivity (if exists)
      if (interactivity) {
        Object.keys(interactivity).forEach((i) => {
          const iFn = interactivity[i].bind(this);
          this.map.on(i, l.id, iFn);
        });
      }
    });
  }
}
