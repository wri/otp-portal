import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Head from 'components/layout/head';
import StaticSection from 'components/ui/static-section';
import Map from 'components/map-new';
import LayerManager from 'components/map-new/layer-manager';
import { LAYERS } from 'constants/layers';

const Layers = [
  {
    id: 'gain',
    ...LAYERS.find(l => l.id === 'gain').config,
  },
  {
    id: 'loss',
    ...LAYERS.find(l => l.id === 'loss').config,
    decodeFunction: LAYERS.find(l => l.id === 'loss').decodeFunction,
    decodeParams: {
      startYear: 2001,
      endYear: 2021
    },
  },
  {
    id: 'fmus',
    ...LAYERS.find(l => l.id === 'fmus').config,
    params: {
      country_iso_codes: process.env.OTP_COUNTRIES
    }
  },
  {
    id: 'protected-areas',
    ...LAYERS.find(l => l.id === 'protected-areas').config,
    params: {
      country_iso_codes: process.env.OTP_COUNTRIES
    }
  },
];

class MapPage extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
  }

  render() {
    const { url } = this.props;

    return (
      <div className="l-page c-page">
        <Head title="Map page" />

        <div className="l-main">

          <StaticSection
            map={
              <Map
                mapStyle="mapbox://styles/mapbox/light-v9"
                viewport={{
                  zoom: 6,
                  latitude: 0,
                  longitude: 20
                }}
                customClass="c-map-fullscreen"
                scrollZoom={false}
                dragPan={false}
                dragRotate={false}
                transformRequest={(uri) => {
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
                }}

              >
                {map => (
                  <Fragment>
                    <LayerManager
                      map={map}
                      layers={Layers}
                    />
                  </Fragment>
                )}
              </Map>
            }
            position={{ top: true, right: true }}
            column={5}
          />
        </div>
      </div>

    );
  }
}

MapPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: intlShape.isRequired
};


export default withTracker(withIntl(MapPage));
