// The map is a canvas, so these go through the mapbox instance the app exposes as window.__map
// when running under Cypress. Pair them with cy.interceptMapRequests({ loadMap: true }).
//
// A feature query is { source, layers, filter }, all optional: `layers` limits the style layers
// searched, `source` and `filter(feature)` pick among the rendered features.

const MAP_TIMEOUT = 20000;
// Pages fit their data a moment after the map loads (the FMU tab ~100 ms later), so a map that is
// merely not moving yet may be about to
const SETTLE_MS = 750;

function stillSince(map) {
  if (!map.__e2eStillSince) {
    map.__e2eStillSince = Date.now();
    map.on('movestart', () => { map.__e2eStillSince = Infinity; });
    map.on('moveend', () => { map.__e2eStillSince = Date.now(); });
  }
  return map.__e2eStillSince;
}

// Yields the map once it is loaded, mounted and has stopped moving for SETTLE_MS
Cypress.Commands.add('getMap', () => cy
  .window()
  .its('__map', { timeout: MAP_TIMEOUT })
  .should((map) => {
    expect(map.getCanvas().isConnected, 'map is mounted').to.be.true;
    expect(map.isStyleLoaded(), 'map style is loaded').to.be.true;
    expect(!map.isMoving() && Date.now() - stillSince(map) >= SETTLE_MS, 'map has settled').to.be.true;
  }));

const matches = ({ source, filter = () => true }, feature) =>
  (!source || feature.source === source) && filter(feature);

function queryFeatures(map, query, point) {
  const options = query.layers ? { layers: query.layers } : {};
  const features = point ? map.queryRenderedFeatures(point, options) : map.queryRenderedFeatures(options);
  return features.filter((f) => matches(query, f));
}

// Rendered geometry comes back split by tile, so a feature can be several pieces
function featuresBounds(features) {
  const coords = features.flatMap((f) => [f.geometry.coordinates].flat(Infinity));
  const lngs = coords.filter((_, i) => i % 2 === 0);
  const lats = coords.filter((_, i) => i % 2 === 1);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}

// A point on the canvas, relative to it, where the topmost feature matches the query and no
// sidebar, legend or popup covers the canvas. Scans the matching features' extent on screen.
function findFeaturePoint(map, query) {
  const features = queryFeatures(map, query);
  if (!features.length) return null;

  const canvas = map.getCanvas();
  const rect = canvas.getBoundingClientRect();
  const options = query.layers ? { layers: query.layers } : {};
  const isHit = (x, y) => {
    const [top] = map.queryRenderedFeatures([x, y], options);
    return !!top && matches(query, top) &&
      canvas.ownerDocument.elementFromPoint(rect.left + x, rect.top + y) === canvas;
  };

  const point = features
    .filter((f) => f.geometry.type === 'Point')
    .map((f) => map.project(f.geometry.coordinates))
    .find(({ x, y }) => isHit(x, y));
  if (point) return [point.x, point.y];

  const [sw, ne] = featuresBounds(features).map((c) => map.project(c));
  const [left, right] = [Math.max(1, Math.min(sw.x, ne.x)), Math.min(rect.width - 1, Math.max(sw.x, ne.x))];
  const [top, bottom] = [Math.max(1, Math.min(sw.y, ne.y)), Math.min(rect.height - 1, Math.max(sw.y, ne.y))];

  const step = Math.max(2, Math.min(8, (right - left) / 6, (bottom - top) / 6));
  for (let y = top; y <= bottom; y += step) {
    for (let x = left; x <= right; x += step) {
      if (isHit(x, y)) return [x, y];
    }
  }
  return null;
}

// Retries until a matching feature is drawn, then clicks it. Yields its properties.
Cypress.Commands.add('clickMapFeature', (query) => {
  let point;
  let properties;

  // maps can run below the fold, and only on-screen spots can be checked for overlays
  cy.getMap()
    .should((map) => expect(queryFeatures(map, query), 'rendered features').to.not.be.empty)
    .then((map) => {
      const [sw, ne] = featuresBounds(queryFeatures(map, query)).map((c) => map.project(c));
      const win = map.getCanvas().ownerDocument.defaultView;
      const middle = map.getCanvas().getBoundingClientRect().top + (sw.y + ne.y) / 2;
      win.scrollBy(0, middle - win.innerHeight / 2);
    });

  return cy.getMap()
    .should((map) => {
      point = findFeaturePoint(map, query);
      expect(point, 'a clickable feature on the map').to.exist;
      properties = queryFeatures(map, query, point)[0].properties;
    })
    .then(() => {
      cy.get('.mapboxgl-canvas').click(point[0], point[1], { scrollBehavior: false });
      return cy.wrap(properties, { log: false });
    });
});

// Retries until matching features are drawn. Yields their [[west, south], [east, north]].
Cypress.Commands.add('getMapFeatureBounds', (query) => {
  let bounds;

  return cy.getMap()
    .should((map) => {
      const features = queryFeatures(map, query);
      expect(features, 'rendered features').to.not.be.empty;
      bounds = featuresBounds(features);
    })
    .then(() => bounds);
});
