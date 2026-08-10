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
    disableStartHandle: PropTypes.bool,
    disableEndHandle: PropTypes.bool,
    onChange: PropTypes.func,
    onAfterChange: PropTypes.func,
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
    disableStartHandle: false,
    disableEndHandle: false,
    onChange: null,
    onAfterChange: null,
  };

  // Keeps the value of every disabled handle pinned to its current position, so
  // clicking the rail can't drag a handle the user isn't allowed to move
  keepDisabledValues = (newValue) => {
    const { value, disableStartHandle, disableEndHandle } = this.props;

    if (!Array.isArray(newValue) || !Array.isArray(value)) return newValue;

    return newValue.map((v, i) => {
      if (disableStartHandle && i === 0) return value[0];
      // the end handle owns both the end and the trim value
      if (disableEndHandle && i > 0) return value[i];
      return v;
    });
  };

  handleOnChange = (newValue) => {
    const { onChange } = this.props;
    if (onChange) onChange(this.keepDisabledValues(newValue));
  };

  handleOnAfterChange = (newValue) => {
    const { onAfterChange } = this.props;
    if (onAfterChange) onAfterChange(this.keepDisabledValues(newValue));
  };

  renderHandle = (node, handleProps) => {
    const { formatValue, showTooltip, disableStartHandle, disableEndHandle } = this.props;
    const { value, index, dragging } = handleProps;
    const formattedValue = formatValue ? formatValue(value) : value;
    const tooltipVisible = showTooltip ? showTooltip(index) : false;

    if (disableStartHandle && index === 0) return null;
    // hides both the playhead and the end handle, they can't move on their own
    if (disableEndHandle && index > 0) return null;

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
    const {
      customClass,
      range,
      handleStyle,
      formatValue,
      showTooltip,
      value,
      marks,
      disableStartHandle,
      disableEndHandle,
      onChange,
      onAfterChange,
      ...rest
    } = this.props;

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
          onChange={this.handleOnChange}
          onAfterChange={this.handleOnAfterChange}
          {...rest}
        />
      </div>
    );
  }
}

export default Slider;
