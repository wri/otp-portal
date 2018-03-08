import fetch from 'isomorphic-fetch';
import getBBox from 'turf-extent';

// Utils
import { substitution } from 'utils/text';

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
    this.onLayerEvent = options.onLayerEvent;

    // Inits
    this.Popup = Mapboxgl.Popup;
  }

  /* Public methods */
  addLayer(layer, opts = {}) {
    const method = {
      geojson: this.getGeojsonLayer,
      cartodb: this.addCartodbLayer,
      raster: this.addRasterLayer
    }[layer.provider];

    method && method.call(this, layer, opts);
  }

  updateLayer(layer, opts) {
    const method = {
      geojson: this.updateGeojsonLayer,
      cartodb: this.updateCartodbLayer,
      raster: this.updateRasterLayer
    }[layer.provider];

    method && method.call(this, layer, opts);
  }

  removeLayer(layerId) {
    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId);
      this.map.removeSource(layerId);
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
  addGeojsonLayer(layer, data) {
        // Add source
    if (this.map) {
      if (!this.map.getSource(layer.id)) {
        this.map.addSource(layer.id, data);
      }

          // Loop trough layers
      layer.layers.forEach((l) => {
        const { interactivity, fitBounds } = l;

            // Add layer
        this.map.addLayer(l, l.before);

            // Add interactivity (if exists)
        if (interactivity) {
          Object.keys(interactivity).forEach((i) => {
            const iFn = interactivity[i].bind(this);
            this.map.on(i, l.id, (e) => {
              iFn(e, () => {
                this.onLayerEvent(i, l.id, e);
              });
            });
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
        this.mapLayers[l.id] = l;
      });
    }
  }

  getGeojsonLayer(layer, opts) {
    const { filters } = opts;

    const sourceParsed = JSON.parse(substitution(
      JSON.stringify(layer.source),
      Object.keys(filters || {}).map(k => ({
        key: k, value: filters[k]
      }))
    ));


    if (sourceParsed.data.url) {
      fetch(sourceParsed.data.url, { ...sourceParsed.data })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((data) => {
        const dataParsed = {
          ...sourceParsed,
          data: layer.source.data.parse ? layer.source.data.parse(data) : data
        };

        this.addGeojsonLayer(layer, dataParsed);
      })
      .catch((err) => {
        console.error(err);
      });
    } else {
      this.addGeojsonLayer(layer, sourceParsed);
    }
  }

  updateGeojsonLayer(layer, opts) {
    const { filters } = opts;

    // Loop trough layers
    layer.layers.forEach((l) => {
      if (l.update) {
        const update = l.update.bind(this);
        update(filters, l);
      }
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

            if (!this.map.getSource(layer.id)) {
              this.map.addSource(layer.id, source);
            }

            // Loop trough layers
            layer.layers.forEach((l) => {
              // Add layer
              this.map.addLayer(l, l.before);

              this.onLayerAddedSuccess();
              this.mapLayers[l.id] = l;
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
      if (!this.map.getSource(layer.id)) {
        this.map.addSource(layer.id, { ...layer.source });
      }

      // Loop trough layers
      layer.layers.forEach((l) => {
        // Add layer
        this.map.addLayer(l, l.before);

        this.onLayerAddedSuccess();
        this.mapLayers[l.id] = l;
      });
    }
  }
}
