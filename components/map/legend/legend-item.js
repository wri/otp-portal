import React from 'react';
import PropTypes from 'prop-types';

// Components
import LegendGraph from 'components/map/legend/legend-graph';
// import LegendButtons from './LegendButtons';
// import Spinner from '../Spinner';


class LegendItem extends React.Component {
  render() {
    const { layer } = this.props;

    return (
      <li className="c-legend-item">
        <header className="legend-item-header">
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
  layer: PropTypes.object
};

export default LegendItem;
