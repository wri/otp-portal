import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import Icon from 'components/ui/icon';
import Tooltip from 'rc-tooltip';

class LegendItemButtonVisibility extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.object,
    visibility: PropTypes.bool,
    onChangeVisibility: PropTypes.func,
    iconShow: PropTypes.string,
    iconHide: PropTypes.string,
    focusStyle: PropTypes.object,
    defaultStyle: PropTypes.object,
    tooltipOpened: PropTypes.bool,
    tooltipText: PropTypes.string
  };

  static defaultProps = {
    activeLayer: {},
    visibility: true,
    iconShow: '',
    iconHide: '',
    focusStyle: {},
    defaultStyle: {},
    tooltipOpened: false,
    tooltipText: '',

    onChangeVisibility: () => {},
  };

  state = {
    visible: false,
  };

  render() {
    const {
      activeLayer,
      visibility,
      tooltipOpened,
      iconShow,
      iconHide,
      focusStyle,
      defaultStyle,
      tooltipText,
      intl
    } = this.props;
    const { visible } = this.state;

    const showIcon = iconShow || 'icon-show';
    const hideIcon = iconHide || 'icon-hide';
    const activeIcon = visibility ? hideIcon : showIcon;
    const defaultTooltipText = intl.formatMessage({ id: visibility ? 'Hide layer' : 'Show layer' });

    return (
      <Tooltip
        overlay={tooltipText || defaultTooltipText}
        overlayClassName="c-rc-tooltip -default"
        placement="top"
        align={{
          offset: [0, -8],
        }}
        trigger={tooltipOpened ? '' : 'hover'}
        mouseLeaveDelay={0}
        destroyTooltipOnHide
        onVisibleChange={(v) => this.setState({ visible: v })}
        visible={visible}
      >
        <button
          type="button"
          className="c-legend-button toggle"
          onClick={() => this.props.onChangeVisibility(activeLayer, !visibility)}
          aria-label="Toggle the visibility"
        >
          <Icon name={activeIcon} className="-small" style={visible ? focusStyle : defaultStyle} />
        </button>
      </Tooltip>
    );
  }
}

export default injectIntl(LegendItemButtonVisibility);
