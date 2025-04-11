import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class LegendList extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: [],
  };

  render() {
    const { children } = this.props;

    return (
      <ul id="vizzuality-legend-list" styleName="c-legend-list">
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child, {
            index,
            i: index
          })
        )}
      </ul>
    );
  }
}

export default LegendList;
