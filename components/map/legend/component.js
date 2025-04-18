import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

import classnames from 'classnames';

import { injectIntl } from 'react-intl';

import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';

const LegendList = dynamic(
  () => import('./legend-list'),
  {
    ssr: false,
    loading: () => (
      <div className="c-legend-list">
        <div className="c-legend-list__loading">
          <Spinner
            isLoading
            className="-small"
          />
        </div>
      </div>
    )
  }
);

class LegendComponent extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    layerGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    collapsable: PropTypes.bool,
    expanded: PropTypes.bool,
    toolbar: PropTypes.node,
    intl: PropTypes.object.isRequired,

    setLayerSettings: PropTypes.func.isRequired
  }

  static defaultProps = {
    className: '',
    collapsable: true,
    expanded: true
  }

  constructor(props) {
    super(props);
    const { expanded } = props;
    this.state = { expanded };
  }

  onToggleLegend = (bool) => {
    this.setState({ expanded: bool });
  };

  render() {
    const { intl, className, collapsable, layerGroups, toolbar, setLayerSettings } = this.props;
    const { expanded } = this.state;

    return (
      <div
        className={classnames({
          'c-legend-container': true,
          [className]: !!className
        })}
      >
        <div className="c-legend">
          {/* LEGEND OPENED */}
          <div className={`open-legend ${classnames({ '-active': expanded })}`}>
            {/* Toggle button */}
            {collapsable && (
              <button
                type="button"
                className="toggle-legend"
                onClick={() => this.onToggleLegend(false)}
              >
                <Icon name="icon-arrow-down" className="-small" />
              </button>
            )}
            {expanded && <LegendList layerGroups={layerGroups} toolbar={toolbar} setLayerSettings={setLayerSettings} />}
          </div>

          {/* LEGEND CLOSED */}
          <button
            type="button"
            className={`close-legend ${classnames({ '-active': !expanded })}`}
            onClick={() => this.onToggleLegend(true)}
          >
            <h1 className="legend-title">
              {intl.formatMessage({ id: 'legend' })}

              {/* Toggle button */}
              <div className="toggle-legend">
                <Icon name="icon-arrow-up" className="-small" />
              </div>
            </h1>
          </button>
        </div>
      </div>
    );
  }
}

export default injectIntl(LegendComponent);
