import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { injectIntl } from 'react-intl';

import Head from 'components/layout/head';
import StaticSection from 'components/ui/static-section';
import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';
import { LAYERS } from 'constants/layers';
import { transformRequest } from 'utils/map';

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
                  zoom: 5,
                  latitude: 0,
                  longitude: 20
                }}
                customClass="c-map-fullscreen"
                dragRotate={false}
                transformRequest={transformRequest}
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
  intl: PropTypes.object.isRequired
};


export default injectIntl(MapPage);
