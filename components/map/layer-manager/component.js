import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl, fetch } from 'layer-manager';

import countriesProvider from './providers/countries-provider';

class LayerManagerComponent extends PureComponent {
  static propTypes = {
    map: PropTypes.object,
    layers: PropTypes.array
  };

  render() {
    const { map, layers } = this.props;

    return (
      <LayerManager
        map={map}
        plugin={PluginMapboxGl}
        providers={{
          countries: countriesProvider
        }}
      >
        {!!layers && layers.map((l) => {
          return (
            <Layer
              key={l.id}
              {...l}
            />
          )
        })}
      </LayerManager>
    );
  }
}

export default LayerManagerComponent;
