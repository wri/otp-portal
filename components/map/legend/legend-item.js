import React from 'react';
import PropTypes from 'prop-types';

// Components
import LegendGraph from 'components/map/legend/legend-graph';
import ToggleSwitch from 'components/form/toggle-switch';
// import LegendButtons from './LegendButtons';
// import Spinner from '../Spinner';


class LegendItem extends React.Component {
  render() {
    const { layer, toggleLayers, activeLayers } = this.props;
    const { toggle } = layer.legendConfig;

    return (
      <li className={`c-legend-item ${toggle ? '-toggle' : ''}`}>
        <header className="legend-item-header">
          { !!toggle &&
            <ToggleSwitch
              key={toggle.layerId}
              id={toggle.layerId}
              active={activeLayers.includes(toggle.layerId)}
              activeColor={layer.legendConfig.color}
              handleChange={toggleLayers}
            />
          }
          <h3>
            {layer.category &&
              <span className="category">{layer.category} -</span>
            }
            <span className="name">{layer.name}</span>
          </h3>
          {/* <LegendButtons triggerAction={this.triggerAction} /> */}
        </header>
        <LegendGraph config={layer.legendConfig} />
      </li>
    );
  }
}

LegendItem.propTypes = {
  toggleLayers: PropTypes.func,
  activeLayers: PropTypes.array,
  layer: PropTypes.object
};

export default LegendItem;
