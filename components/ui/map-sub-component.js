import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';

import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';

import { PALETTE_COLOR_1 } from 'constants/rechart';

const MapSubComponent = ({ id, location, level, language }) => {
  const mapContainerRef = useRef(null);

  const color = PALETTE_COLOR_1[level] ? `${PALETTE_COLOR_1[level].fill}` : '#000';

  return (
    <div className="c-map-sub-component" key={`subcomponent-${id}`}>
      { !!location && !!location.lng && !!location.lat &&
        <div
          className="c-map-container -table"
          ref={mapContainerRef}
        >
          {/* Map */}
          <Map
            language={language}

            // options
            scrollZoom={false}

            // viewport
            viewport={{
              zoom: 3,
              longitude: location.lng,
              latitude: location.lat
            }}
          >
            {map => (
              <Fragment>
                {/* LAYER MANAGER */}
                <LayerManager
                  map={map}
                  layers={[
                    {
                      id: 'observation',
                      type: 'geojson',
                      source: {
                        type: 'geojson',
                        data: {
                          type: 'FeatureCollection',
                          features: [
                            {
                              type: 'Feature',
                              geometry: {
                                type: 'Point',
                                coordinates: [location.lng, location.lat]
                              }
                            }
                          ]
                        }
                      },
                      render: {
                        layers: [{
                          type: 'circle',
                          paint: {
                            'circle-color': color,
                            'circle-radius': 10
                          }
                        }]
                      }
                    }
                  ]}
                />
              </Fragment>
            )}
          </Map>
        </div>
      }
      { (!location || !location.lng || !location.lat) &&
        <p>This observation has no location.</p>
      }
    </div>
  );
};

MapSubComponent.propTypes = {
  id: PropTypes.string,
  location: PropTypes.object,
  level: PropTypes.number,
  language: PropTypes.string
};


export default MapSubComponent;

