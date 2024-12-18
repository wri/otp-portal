import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import * as Sentry from "@sentry/nextjs";

import isEqual from 'react-fast-compare';
import { isEmpty } from 'utils/general';

import ReactMapGL from 'react-map-gl';

const DEFAULT_VIEWPORT = {
  zoom: 2,
  latitude: 0,
  longitude: 0
};

function transformRequest(uri) {
  if (uri.startsWith(process.env.OTP_API)) {
    return {
      url: uri,
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    };
  }

  return null;
}

class Map extends Component {
  HOVER = {};
  CLICK = {};

  static propTypes = {
    /** A function that returns the map instance */
    children: PropTypes.func,

    /** Custom css class for styling */
    customClass: PropTypes.string,

    /** An object that defines the viewport
     * @see https://uber.github.io/react-map-gl/#/Documentation/api-reference/interactive-map?section=initialization
     */
    viewport: PropTypes.shape({}),

    /** An object that defines the bounds */
    bounds: PropTypes.shape({
      bbox: PropTypes.array,
      options: PropTypes.shape({})
    }),

    /** A boolean that allows panning */
    dragPan: PropTypes.bool,

    /** A boolean that allows rotating */
    dragRotate: PropTypes.bool,

    /** A boolean that allows zooming */
    scrollZoom: PropTypes.bool,

    /** A boolean that allows zooming */
    touchZoom: PropTypes.bool,

    /** A boolean that allows touch rotating */
    touchRotate: PropTypes.bool,

    /** A boolean that allows double click zooming */
    doubleClickZoom: PropTypes.bool,

    /** A function that exposes when the map is ready. It returns and object with the `this.map` and `this.mapContainer` reference. */
    onReady: PropTypes.func,

    /** A function that exposes when the map is loaded. It returns and object with the `this.map` and `this.mapContainer` reference. */
    onLoad: PropTypes.func,

    /** A function that exposes when the map is unmounted. It's a good oportunity to set the `this.map` and `this.mapContainer` reference as null */
    onUnmount: PropTypes.func,

    /** A function that exposes the viewport */
    onViewportChange: PropTypes.func,

    /** A function that exposes hovering features. */
    onHover: PropTypes.func,

    /** A function that exposes mouseleave from features. */
    onMouseLeave: PropTypes.func,

    /** A string that defines the language for mapbox labels */
    language: PropTypes.string
  };

  static defaultProps = {
    children: null,
    customClass: null,
    viewport: DEFAULT_VIEWPORT,
    bounds: {},
    dragPan: true,
    dragRotate: true,
    scrollZoom: true,
  };

  state = {
    viewport: {
      ...DEFAULT_VIEWPORT,
      ...this.props.viewport // eslint-disable-line
    },
    flying: false,
    loaded: false,
    size: {
      width: 0,
      height: 0
    }
  };

  componentDidMount() {
    this.onReady();
  }

  componentDidUpdate(prevProps, prevState) {
    const { viewport: prevViewport, bounds: prevBounds } = prevProps;
    const { viewport, bounds } = this.props;

    const { size: prevSize } = prevState;
    const { size, viewport: stateViewport } = this.state;

    if (
      !isEmpty(bounds) &&
      !isEqual(bounds, prevBounds) &&
      !!bounds.bbox &&
      bounds.bbox.every(b => !!b) &&
      size.width !== 0 &&
      size.height !== 0
    ) {
      this.fitBounds();
    }

    if (
      !isEmpty(bounds) &&
      !isEqual(size, prevSize)
    ) {
      this.fitBounds();
    }

    if (!isEqual(viewport, prevViewport) && !this.isMoving) {
      const newViewport = {
        ...stateViewport,
        ...viewport
      };

      if (this.map && viewport.transitionDuration) {
        this.mapFlyTo({ ...newViewport, duration: viewport.transitionDuration });
      } else {
        this.setState({
          viewport: newViewport
        });
      }
    }
  }

  componentWillUnmount() {
    const { onUnmount } = this.props;
    if (this.deckInitializedInterval) clearInterval(this.deckInitializedInterval);
    if (onUnmount) onUnmount();
  }

  mapFlyTo(viewport) {
    if (!this.map) return;

    this.map.flyTo({
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      duration: viewport.duration,
      maxDuration: viewport.duration,
      essential: true
    });

    this.setState({
      flying: true
    });

    setTimeout(() => {
      this.setState({ flying: false });
    }, viewport.duration || 500);
  }

  onReady = () => {
    const { onReady } = this.props;

    this.setState({
      size: {
        width: this.mapContainer && this.mapContainer.offsetWidth,
        height: this.mapContainer && this.mapContainer.offsetHeight
      }
    });

    onReady && onReady({
      map: this.map,
      mapContainer: this.mapContainer
    });
  }

  onLoad = () => {
    const { onLoad } = this.props;

    this.setState({
      loaded: true,
      size: {
        width: this.mapContainer && this.mapContainer.offsetWidth,
        height: this.mapContainer && this.mapContainer.offsetHeight
      }
    });

    this.setLocalizedLabels();
    this.fixCursorChange();

    if (!isEmpty(this.props.bounds)) {
      this.fitBounds();
    }

    onLoad && onLoad({
      map: this.map,
      mapContainer: this.mapContainer
    });
  };

  onInternalViewportChange = (v) => {
    if (isEqual(v, this.state.viewport)) return;

    this.setState({ viewport: v });
  };

  onMouseMove = e => {
    const { onHover } = this.props;
    const { features } = e;

    // hover state for the feature under the mouse on the map
    if (!!features && features.length) {
      const { id, source, sourceLayer } = features[0];

      if (this.HOVER.id) {
        this.map.setFeatureState(
          {
            ...this.HOVER
          },
          { hover: false }
        );
      }

      if (id && source) {
        this.HOVER = {
          id,
          source,
          ...(sourceLayer && { sourceLayer })
        };

        this.map.setFeatureState(
          {
            ...this.HOVER
          },
          { hover: true }
        );
      }
    }

    !!onHover && onHover(e);
  };

  onMouseEnter = e => {
    this.map.getCanvas().style.cursor = "pointer";
    this.isHovering = true;
  }

  onMouseLeave = e => {
    const { onMouseLeave } = this.props;
    this.isHovering = false;
    this.map.getCanvas().style.cursor = "";
    if (this.HOVER.id) {
      this.map.setFeatureState(
        {
          ...this.HOVER
        },
        { hover: false }
      );
    }

    this.HOVER = {};

    !!onMouseLeave && onMouseLeave(e);
  };

  onMove = e => {
    this.isMoving = true;
    this.onInternalViewportChange(e.viewState);
  }

  onMoveEnd = e => {
    this.isMoving = false;
    this.onInternalViewportChange(e.viewState);
    const { onViewportChange } = this.props;
    onViewportChange && onViewportChange(e.viewState);
  }

  fitBounds = () => {
    const { bounds } = this.props;
    const { bbox, options } = bounds || {};

    if (!this.map) return;

    try {
      this.map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        options
      );
    } catch (err) {
      console.error(err);
      Sentry.captureException(err);
    }
  };

  setLocalizedLabels = () => {
    if (!this.props.language) return;

    const LABELS_GROUP = ['labels'];

    if (this.map) {
      const { layers, metadata } = this.map.getStyle();

      const labelGroups = Object.keys(metadata['mapbox:groups']).filter((k) => {
        const { name } = metadata['mapbox:groups'][k];

        const matchedGroups = LABELS_GROUP.filter((rgr) =>
          name.toLowerCase().includes(rgr)
        );

        return matchedGroups.some((bool) => bool);
      });

      const labelLayers = layers.filter((l) => {
        const { metadata: layerMetadata } = l;
        if (!layerMetadata) return false;

        const gr = layerMetadata['mapbox:group'];
        return labelGroups.includes(gr);
      });

      labelLayers.forEach((_layer) => {
        this.map.setLayoutProperty(_layer.id, 'text-field', [
          'coalesce',
          ['get', `name_${this.props.language}`],
          ['get', 'name_en']
        ]);
      });
    }
  }

  fixCursorChange = () => {
    this.deckInitializedInterval = setInterval(() => {
      if (this.map && this.map.__deck) {
        this.map.__deck.props.getCursor = () => {
          return this.isHovering ? 'pointer' : '';
        }
        clearInterval(this.deckInitializedInterval);
      }
    }, 100);
  }

  render() {
    const {
      customClass,
      bounds,
      children,
      dragPan,
      dragRotate,
      scrollZoom,
      touchZoom,
      touchRotate,
      doubleClickZoom,
      onClick,
      ...mapboxProps
    } = this.props;
    const { loaded, flying, viewport } = this.state;

    return (
      <div
        ref={(r) => {
          this.mapContainer = r;
        }}
        className={classnames({
          'c-map': true,
          [customClass]: !!customClass
        })}
      >
        <ReactMapGL
          ref={(map) => {
            this.map = map && map.getMap();
          }}
          mapLib={import('mapbox-gl')}
          mapboxAccessToken={process.env.MAPBOX_API_KEY}
          mapStyle="mapbox://styles/mapbox/light-v9"
          // CUSTOM PROPS FROM REACT MAPBOX API
          {...mapboxProps}

          // VIEWPORT
          {...viewport}
          style={{ width: '100%', height: '100%' }}
          // INTERACTIVE
          dragPan={!flying && dragPan}
          dragRotate={!flying && dragRotate}
          scrollZoom={!flying && scrollZoom}
          touchZoom={!flying && touchZoom}
          touchRotate={!flying && touchRotate}
          doubleClickZoom={!flying && doubleClickZoom}
          // DEFAULT FUNC IMPLEMENTATIONS
          onClick={onClick}
          onLoad={this.onLoad}
          onMouseMove={this.onMouseMove}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onMove={this.onMove}
          onMoveEnd={this.onMoveEnd}
          transformRequest={transformRequest}
        >
          {loaded &&
            !!this.map &&
            typeof children === 'function' &&
            children(this.map)}
        </ReactMapGL>
      </div>
    );
  }
}

export default Map;
