import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { intlShape, injectIntl } from 'react-intl';

import MapLegendItem from 'components/map/legend/legend-item';
import Icon from 'components/ui/icon';

class MapLegend extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedLayer: null,
      expanded: props.expanded
    };
  }

  toggleExpand() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    const { layers, className, toggleLayers, activeLayers } = this.props;
    const { expanded } = this.state;

    const classNames = classnames({
      [className]: !!className,
      '-expanded': expanded
    });

    return (
      <div className={`c-map-legend ${classNames}`}>
        {/* Header */}
        <div className="legend-header" onClick={() => this.toggleExpand()}>
          <span className="legend-header-title">
            {expanded ? this.props.intl.formatMessage({ id: 'operators.map.legend.open' }) : this.props.intl.formatMessage({ id: 'operators.map.legend.close' })}
          </span>
          <button className="legend-btn">
            {expanded && <Icon name="icon-arrow-up" className="legend-open-icon" />}
            {!expanded && <Icon name="icon-arrow-down" className="legend-close-icon" />}
          </button>
        </div>

        {/* Content */}
        <div className="legend-content">
          <ul>
            {layers.map(layer =>
              <MapLegendItem
                layer={{ ...layer,
                  name: this.props.intl.formatMessage({ id: `operators.map.legend.item.${layer.id}` }),
                  legendConfig: { ...layer.legendConfig,
                    items: layer.legendConfig.items.map(
                      item => ({ ...item, name: this.props.intl.formatMessage({ id: `operators.map.legend.item.${layer.id}.legendConfig.name` }) })
                    )
                  }
                }}
                toggleLayers={toggleLayers}
                activeLayers={activeLayers}
                key={layer.id}
              />
            )}
          </ul>
        </div>
      </div>
    );
  }
}

MapLegend.defaultProps = {
  expanded: false,
  layers: [],
  className: ''
};

MapLegend.propTypes = {
  toggleLayers: PropTypes.func,
  activeLayers: PropTypes.array,
  expanded: PropTypes.bool,
  layers: PropTypes.array,
  className: PropTypes.string,
  intl: intlShape.isRequired
};

export default injectIntl(MapLegend);
