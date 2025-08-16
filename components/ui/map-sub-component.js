import React, { Fragment, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';

import Spinner from 'components/ui/spinner';

import { PALETTE_COLOR_1 } from 'constants/rechart';

const MapSubComponent = ({ id, location, level, language }) => {
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef(null);

  const color = PALETTE_COLOR_1[level] ? `${PALETTE_COLOR_1[level].fill}` : '#000';

  return (
    <div className="c-map-sub-component" key={`subcomponent-${id}`}>
      { !!location &&
        <div
          className="c-map-container -table"
          ref={mapContainerRef}
        >
          <Spinner isLoading={loading} className="-light" />

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
      { !location &&
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

