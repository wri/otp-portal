import fetch from 'isomorphic-fetch';
import getBBox from 'turf-extent';

let Mapboxgl;
if (typeof window !== 'undefined') {
  /* eslint-disable global-require */
  Mapboxgl = require('mapbox-gl');
  Mapboxgl.accessToken = process.env.MAPBOX_API_KEY;
  /* eslint-enable global-require */
}

export default class LayerManager {

  /* Constructor */
  constructor(map, options = {}) {
    this.map = map;
    this.mapLayers = {};
    this.onLayerAddedSuccess = options.onLayerAddedSuccess;
    this.onLayerAddedError = options.onLayerAddedError;

    // Inits
    this.Popup = Mapboxgl.Popup;
  }

  /* Public methods */
  addLayer(layer, opts = {}) {
    const method = {
      geojson: this.addGeojsonLayer,
      cartodb: this.addCartodbLayer,
      raster: this.addRasterLayer
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
  addGeojsonLayer(layer) {
    fetch(layer.source.data.url, { ...layer.source.data })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((data) => {
        // Add source
        if (this.map) {
          this.map.addSource(layer.id, { ...layer.source, data });

          // Loop trough layers
          layer.layers.forEach((l) => {
            const { interactivity, fitBounds } = l;

            // Add layer
            this.map.addLayer(l, l.before);

            // Add interactivity (if exists)
            if (interactivity) {
              Object.keys(interactivity).forEach((i) => {
                const iFn = interactivity[i].bind(this);
                this.map.on(i, l.id, iFn);
              });
            }

            if (fitBounds) {
              const bounds = getBBox(data);

              this.map.fitBounds(bounds, {
                padding: 50
                // animate: false
                // duration: 500,
                // offset: [300, 0]
              });
            }

            this.onLayerAddedSuccess();
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  addCartodbLayer(layer) {
    // Add source
    if (this.map) {
      if (layer.cartodb) {
        fetch(`https://${layer.cartodb.account}.carto.com/api/v1/map?stat_tag=API&config=${encodeURIComponent(JSON.stringify(layer.cartodb))}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error(response.statusText);
          })
          .then((data) => {
            const source = {
              ...layer.source,
              tiles: data.cdn_url.templates.https.subdomains.map(s =>
                `${data.cdn_url.templates.https.url.replace('{s}', s)}/${layer.cartodb.account}/api/v1/map/${data.layergroupid}/{z}/{x}/{y}.png`
              )
            };

            this.map.addSource(layer.id, source);

            // Loop trough layers
            layer.layers.forEach((l) => {
              // Add layer
              this.map.addLayer(l, l.before);

              this.onLayerAddedSuccess();
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }

  addRasterLayer(layer) {
    // Add source
    if (this.map) {
      this.map.addSource(layer.id, { ...layer.source });

      // Loop trough layers
      layer.layers.forEach((l) => {
        // Add layer
        this.map.addLayer(l, l.before);

        this.onLayerAddedSuccess();
      });
    }
  }
}
