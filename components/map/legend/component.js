import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import debounce from 'lodash/debounce';

import { injectIntl } from 'react-intl';
import renderHtml from 'html-react-parser';

import {
  LegendListItem,
  LegendItemTypes,
  LegendItemToolbar,
  LegendItemTimeStep
} from '~/components/map/legend';

import LegendItemButtonInfo from 'components/map/legend/legend-item-toolbar/legend-item-button-info';
import LegendItemButtonOpacity from 'components/map/legend/legend-item-toolbar/legend-item-button-opacity';
import LegendItemButtonVisibility from 'components/map/legend/legend-item-toolbar/legend-item-button-visibility';

import Icon from 'components/ui/icon';
import Tooltip from 'rc-tooltip';

import TEMPLATES from './templates';
import ANALYSIS from './analysis';

import modal from 'services/modal';
import LayerInfo from 'components/map/layer-info';

class LegendComponent extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    layerGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    collapsable: PropTypes.bool,
    expanded: PropTypes.bool,
    toolbar: PropTypes.node,
    intl: PropTypes.object.isRequired,

    setLayerSettings: PropTypes.func.isRequired,
    setLayerOrder: PropTypes.func
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

  onChangeInfo = (info, id) => {
    const { layerGroups } = this.props;
    const layer = layerGroups.find(l => l.id === id);

    modal.toggleModal(true, {
      children: LayerInfo,
      childrenProps: {
        metadata: layer.metadata
      }
    });
  }

  onChangeVisibility = (l, visibility, id) => {
    const { setLayerSettings } = this.props;
    setLayerSettings({ id, settings: { visibility } });
  }

  onChangeOpacity = debounce((l, opacity, id) => {
    const { setLayerSettings } = this.props;
    setLayerSettings({ id, settings: { opacity } });
  }, 250)

  onChangeLayerDate = (dates, layer) => {
    const { setLayerSettings } = this.props;
    const { id, decodeConfig } = layer;

    setLayerSettings({
      id,
      settings: {
        ...(decodeConfig && {
          decodeParams: {
            startDate: dates[0],
            endDate: dates[1],
            trimEndDate: dates[2]
          }
        }),
        ...(!decodeConfig && {
          params: {
            startDate: dates[0],
            endDate: dates[1]
          }
        })
      }
    });
  }

  onRemoveLayer = (layer) => {
    const { toggleLayer } = this.props;
    toggleLayer(layer);
  }

  onToggleLegend = (bool) => {
    this.setState({ expanded: bool });
  };

  renderDisclaimer = ({ disclaimer, disclaimerTooltip }) => {
    const { intl } = this.props;

    return intl.formatMessage({ id: disclaimer }, {
      highlight: chunks => {
        if (!disclaimerTooltip) return <span className="highlight">{chunks}</span>;

        return (
          <Tooltip
            placement="bottom"
            overlay={
              <div style={{ maxWidth: 200 }}>
                {intl.formatMessage({ id: disclaimerTooltip })}
              </div>
            }
            overlayClassName="c-tooltip no-pointer-events"
          >
            <span className="highlight">{chunks}</span>
          </Tooltip>
        )
      }
    });
  }

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

            {expanded && (
              <ul className="c-legend-list">
                {layerGroups.map((layerGroup, i) => (
                  <LegendListItem
                    index={i}
                    key={layerGroup.id}
                    layerGroup={layerGroup}
                    {...layerGroup}
                    toolbar={
                      toolbar || (
                        <LegendItemToolbar>
                          {layerGroup.metadata && <LegendItemButtonInfo />}
                          <LegendItemButtonOpacity />
                          <LegendItemButtonVisibility />
                        </LegendItemToolbar>
                      )
                    }
                    onChangeInfo={(l => this.onChangeInfo(true, layerGroup.id))}
                    onChangeVisibility={((l, visibility) => this.onChangeVisibility(l, visibility, layerGroup.id))}
                    onChangeOpacity={(l, opacity) => this.onChangeOpacity(l, opacity, layerGroup.id)}
                    onRemoveLayer={(l) => { this.onRemoveLayer(l); }}
                  >
                    {!!TEMPLATES[layerGroup.id] &&
                      React.createElement(TEMPLATES[layerGroup.id], {
                        setLayerSettings
                      })
                    }

                    <LegendItemTypes />

                    <LegendItemTimeStep
                      defaultStyles={{
                        handleStyle: {
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.29)',
                          border: '0px',
                          zIndex: 2
                        },
                        railStyle: { backgroundColor: '#d6d6d9' },
                        dotStyle: { visibility: 'hidden', border: '0px' }
                      }}
                      handleChange={this.onChangeLayerDate}
                    />

                    {!!layerGroup.analysis && ANALYSIS[layerGroup.id] &&
                      React.createElement(ANALYSIS[layerGroup.id], {
                        analysis: layerGroup.analysis
                      })
                    }
                    {layerGroup.metadata && layerGroup.metadata.disclaimer && (
                      <div className="legend-item-disclaimer">
                        {this.renderDisclaimer(layerGroup.metadata)}
                      </div>
                    )}
                  </LegendListItem>
                ))}
              </ul>
            )}
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
