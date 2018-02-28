import React from 'react';
import PropTypes from 'prop-types';

// Components
import Map from 'components/map/map';
import Spinner from 'components/ui/spinner';

// Constants
import { PALETTE_COLOR_1 } from 'constants/observations';


class MapSubComponent extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    location: PropTypes.object,
    level: PropTypes.number
  };

  state = {
    loading: true
  }

  getObservationLayer = () => {
    const { location, level } = this.props;

    return [
      {
        id: 'observation',
        provider: 'geojson',
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
        layers: [{
          id: 'observation',
          source: 'observation',
          name: 'Observation',
          type: 'circle',
          paint: {
            'circle-color': `${PALETTE_COLOR_1[level].fill}`,
            'circle-radius': 10
          }
        }]
      }
    ];
  }

  render() {
    const { id } = this.props;

    return (
      <div className="c-map-sub-component" key={`subcomponent-${id}`}>
        { !!location &&
          <div
            className="c-map-container -table"
            ref={(map) => { this.mapContainer = map; }}
          >
            <Spinner isLoading={this.state.loading} className="-light" />

            <Map
              ref={(map) => { this.map = map; }}
              mapOptions={{
                zoom: 8,
                center: {
                  lat: this.props.location.lat,
                  lng: this.props.location.lng
                },
                scrollZoom: false
              }}
              layers={this.getObservationLayer()}
            />
          </div>
        }
        { !location &&
          <p>This observation has no location.</p>
        }
      </div>
    );
  }
}


export default MapSubComponent;

