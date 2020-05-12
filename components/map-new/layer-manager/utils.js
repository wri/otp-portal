const MAX_LEAVES_TO_SPIDERIFY = 255; // Max leave to display when spiderify to prevent filling the map with leaves
const CIRCLE_TO_SPIRAL_SWITCHOVER = 15; // When below number, will display leave as a circle. Over, as a spiral

const CIRCLE_OPTIONS = {
  distanceBetweenPoints: 50
};

const SPIRAL_OPTIONS = {
  rotationsModifier: 1500, // Higher modifier = closer spiral lines
  distanceBetweenPoints: 32, // Distance between points in spiral
  radiusModifier: 40000, // Spiral radius
  lengthModifier: 1000 // Spiral length modifier
};

const SPIDER_LEGS_PAINT_OPTION = {
  'line-width': 3,
  'line-color': 'rgba(128, 128, 128, 0.5)'
};

const SPIDER_LEAVES_PAINT_OPTION = {
  'circle-color': 'orange',
  'circle-radius': 6,
  'circle-stroke-width': 1,
  'circle-stroke-color': '#fff'
};

const SPIDER_LAYERS = {
  legs: null,
  leaves: null
};

export function generateEquidistantPointsInCircle({
  totalPoints = 1,
  options = CIRCLE_OPTIONS
}) {
  const points = [];
  const theta = (Math.PI * 2) / totalPoints;
  let angle = theta;
  for (let i = 0; i < totalPoints; i++) {
    angle = theta * i;
    points.push({
      x: options.distanceBetweenPoints * Math.cos(angle),
      y: options.distanceBetweenPoints * Math.sin(angle)
    });
  }
  return points;
}

export function generateEquidistantPointsInSpiral({
  totalPoints = 10,
  options = SPIRAL_OPTIONS
}) {
  const points = [{ x: 0, y: 0 }];
  // Higher modifier = closer spiral lines
  const rotations = totalPoints * options.rotationsModifier;
  const distanceBetweenPoints = options.distanceBetweenPoints;
  const radius = totalPoints * options.radiusModifier;
  // Value of theta corresponding to end of last coil
  const thetaMax = rotations * 2 * Math.PI;
  // How far to step away from center for each side.
  const awayStep = radius / thetaMax;

  for (
    let theta = distanceBetweenPoints / awayStep;
    points.length <= totalPoints + options.lengthModifier;

  ) {
    points.push({
      x: Math.cos(theta) * (awayStep * theta),
      y: Math.sin(theta) * (awayStep * theta)
    });
    theta += distanceBetweenPoints / (awayStep * theta);
  }
  return points.slice(0, totalPoints);
}

function generateLeavesCoordinates({ nbOfLeaves }) {
  let points;
  // Position cluster's leaves in circle if below threshold, spiral otherwise
  if (nbOfLeaves < CIRCLE_TO_SPIRAL_SWITCHOVER) {
    points = generateEquidistantPointsInCircle({
      totalPoints: nbOfLeaves
    });
  } else {
    points = generateEquidistantPointsInSpiral({
      totalPoints: nbOfLeaves
    });
  }
  return points;
}

export function clearSpiderifyCluster({ map }) {
  // Remove source and layer
  if (map && SPIDER_LAYERS.legs && map.getLayer(SPIDER_LAYERS.legs) != null) map.removeLayer(SPIDER_LAYERS.legs);
  if (map && SPIDER_LAYERS.legs && map.getSource(SPIDER_LAYERS.legs) != null) map.removeSource(SPIDER_LAYERS.legs);

  if (map && SPIDER_LAYERS.leaves && map.getLayer(SPIDER_LAYERS.leaves) != null) map.removeLayer(SPIDER_LAYERS.leaves);
  if (map && SPIDER_LAYERS.leaves && map.getSource(SPIDER_LAYERS.leaves) != null) map.removeSource(SPIDER_LAYERS.leaves);
}

export function spiderifyCluster({ map, source, cluster, options }) {
  const {
    maxLeaves = MAX_LEAVES_TO_SPIDERIFY,
    leavesPaint = SPIDER_LEAVES_PAINT_OPTION,
    legsPaint = SPIDER_LEGS_PAINT_OPTION
  } = options;

  const spiderlegsCollection = [];
  const spiderLeavesCollection = [];

  clearSpiderifyCluster({ map });

  map
    .getSource(source)
    .getClusterLeaves(
      cluster.id,
      maxLeaves,
      0,
      (error, features) => {
        if (error) {
          console.warn('Cluster does not exists on this zoom');
          return;
        }

        const leavesCoordinates = generateLeavesCoordinates({
          nbOfLeaves: features.length
        });

        const clusterXY = map.project(cluster.coordinates);

        // Generate spiderlegs and leaves coordinates
        features.forEach((element, index) => {
          const { properties } = element;
          const spiderLeafLatLng = map.unproject([
            clusterXY.x + leavesCoordinates[index].x,
            clusterXY.y + leavesCoordinates[index].y
          ]);

          spiderLeavesCollection.push({
            type: 'Feature',
            properties,
            geometry: {
              type: 'Point',
              coordinates: [spiderLeafLatLng.lng, spiderLeafLatLng.lat]
            }
          });

          spiderlegsCollection.push({
            type: 'Feature',
            properties,
            geometry: {
              type: 'LineString',
              coordinates: [
                cluster.coordinates,
                [spiderLeafLatLng.lng, spiderLeafLatLng.lat]
              ]
            }
          });
        });

        // Draw spiderlegs and leaves coordinates
        map.addLayer({
          id: `${source}-spider-legs`,
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: spiderlegsCollection
            }
          },
          paint: legsPaint
        });

        map.addLayer({
          id: `${source}-spider-leaves`,
          type: 'circle',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: spiderLeavesCollection
            }
          },
          paint: leavesPaint
        });

        SPIDER_LAYERS.legs = `${source}-spider-legs`;
        SPIDER_LAYERS.leaves = `${source}-spider-leaves`;
      }
    );
}
