import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import Icon from 'components/ui/icon';
import Tooltip from 'rc-tooltip';

class LegendItemButtonInfo extends PureComponent {
  static propTypes = {
    activeLayer: PropTypes.object,
    icon: PropTypes.string,
    focusStyle: PropTypes.object,
    defaultStyle: PropTypes.object,
    tooltipOpened: PropTypes.bool,
    tooltipText: PropTypes.string,

    // ACTIONS
    onChangeInfo: PropTypes.func,
  };

  static defaultProps = {
    activeLayer: {},
    icon: '',
    focusStyle: {},
    defaultStyle: {},
    tooltipOpened: false,
    tooltipText: '',

    onChangeInfo: () => {},
  };

  state = {
    visible: false,
  };

  render() {
    const { activeLayer, tooltipOpened, icon, focusStyle, defaultStyle, tooltipText, intl } = this.props;
    const { visible } = this.state;

    return (
      <Tooltip
        overlay={tooltipText || intl.formatMessage({ id: 'Layer info' })}
        overlayClassName="c-rc-tooltip -default"
        placement="top"
        trigger={tooltipOpened ? '' : 'hover'}
        mouseLeaveDelay={0}
        destroyTooltipOnHide
        onVisibleChange={(v) => this.setState({ visible: v })}
        visible={visible}
      >
        <button
          type="button"
          className="c-legend-button"
          aria-label="More information"
          onClick={() => this.props.onChangeInfo(activeLayer)}
        >
          <Icon
            name={icon || 'icon-info'}
            className="-small"
            style={visible ? focusStyle : defaultStyle}
          />
        </button>
      </Tooltip>
    );
  }
}

export default injectIntl(LegendItemButtonInfo);
