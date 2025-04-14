// source https://github.com/Vizzuality/vizzuality-components

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import LegendItemButtonOpacity from './legend-item-button-opacity';
import LegendItemButtonVisibility from './legend-item-button-visibility';
import LegendItemButtonInfo from './legend-item-button-info';

class LegendItemToolbar extends PureComponent {
  static propTypes = {
    // Props
    children: PropTypes.node,
    enabledStyle: PropTypes.object,
    defaultStyle: PropTypes.object,
    disabledStyle: PropTypes.object,
    focusStyle: PropTypes.object,

    // ACTIONS
    onChangeBBox: PropTypes.func,
    onChangeLayer: PropTypes.func,
    onChangeOpacity: PropTypes.func,
    onChangeVisibility: PropTypes.func,
    onRemoveLayer: PropTypes.func,
    onChangeInfo: PropTypes.func,
  };

  static defaultProps = {
    // Props
    children: [],
    defaultStyle: {
      fill: '#717171',
    },
    enabledStyle: {
      fill: '#2C75B0',
    },
    disabledStyle: {
      fill: '#CACCD0',
    },
    focusStyle: {
      fill: '#393f44',
    },

    // ACTIONS
    onChangeBBox: (l) => console.info(l),
    onChangeInfo: (l) => console.info(l),
    onChangeLayer: (l) => console.info(l),
    onChangeVisibility: (l, v) => console.info(l, v),
    onChangeOpacity: (l, o) => console.info(l, o),
    onRemoveLayer: (l) => console.info(l),
  };

  render() {
    const { children, ...rest } = this.props;
    const props = { ...rest };

    return (
      <div className="c-legend-item-toolbar">
        {!!React.Children.count(children) &&
          React.Children.map(children, (child) =>
            React.isValidElement(child) && typeof child.type !== 'string'
              ? React.cloneElement(child, { ...props })
              : child
          )}
      </div>
    );
  }
}
export default LegendItemToolbar;

export {
  LegendItemButtonOpacity,
  LegendItemButtonVisibility,
  LegendItemButtonInfo
};
