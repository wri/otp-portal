// source https://github.com/Vizzuality/vizzuality-components

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import RCSlider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import fill from 'lodash/fill';

import { getStyledMarks } from './utils';

export class Slider extends PureComponent {
  static propTypes = {
    customClass: PropTypes.string,
    settings: PropTypes.shape({}),
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.number]),
    dragging: PropTypes.bool,
    index: PropTypes.number,
    range: PropTypes.bool,
    trackStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.shape({})]).isRequired,
    handleStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.shape({})]),
    formatValue: PropTypes.func,
    showTooltip: PropTypes.func,
    railStyle: PropTypes.shape({}),
    dotStyle: PropTypes.shape({}),
    pushable: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  };

  static defaultProps = {
    customClass: null,
    settings: {},
    value: [0],
    dragging: false,
    index: 0,
    range: false,
    handleStyle: {
      backgroundColor: '#c32d7b',
      borderRadius: '10px',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.29)',
      border: '0px',
      zIndex: 2,
    },
    formatValue: null,
    showTooltip: null,
    railStyle: { backgroundColor: '#d9d9d9' },
    dotStyle: { visibility: 'hidden', border: '0px' },
    pushable: true,
  };

  renderHandle = (node, handleProps) => {
    const { formatValue, showTooltip } = this.props;
    const { value, index, dragging } = handleProps;
    const formattedValue = formatValue ? formatValue(value) : value;
    const tooltipVisible = showTooltip ? showTooltip(index) : false;

    return (
      <Tooltip
        key={index}
        overlay={formattedValue}
        overlayClassName="c-rc-tooltip -default"
        overlayStyle={{ color: '#fff' }}
        overlayInnerStyle={{ minHeight: "auto" }}
        placement="top"
        mouseLeaveDelay={0}
        destroyTooltipOnHide
        visible={!!dragging || !!tooltipVisible}
      >
        {node}
      </Tooltip>
    );
  };

  render() {
    const { customClass, range, handleStyle, formatValue, showTooltip, value, marks, ...rest } = this.props;

    const handleNum = Array.isArray(value) ? value.length : 1;
    const handleStyles = fill(Array(handleNum), {
      width: '1px',
      height: '10px',
      backgroundColor: '#808080',
      marginLeft: '-1px',
      marginTop: '-3px',
      borderRadius: 0,
      border: 0,
      zIndex: 1,
      pointerEvents: 'none',
      touchAction: 'none',
    });
    handleStyles[0] = handleStyle;
    handleStyles[handleNum - 1] = handleStyle;

    const externalClass = classnames({ [customClass]: !!customClass });

    return (
      <div className={externalClass}>
        <RCSlider
          handleRender={this.renderHandle}
          handleStyle={handleStyles}
          value={value}
          marks={marks ? getStyledMarks(marks) : marks}
          range
          {...rest}
        />
      </div>
    );
  }
}

export default Slider;
