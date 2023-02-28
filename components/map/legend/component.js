import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';

import debounce from 'lodash/debounce';

import { injectIntl, intlShape } from 'react-intl';
import renderHtml from 'html-react-parser';

import {
  Legend,
  LegendListItem,
  LegendItemTypes,
  LegendItemToolbar,
  LegendItemButtonInfo,
  LegendItemButtonOpacity,
  LegendItemButtonVisibility,
  LegendItemTimeStep
} from 'vizzuality-components';

import Tooltip from 'rc-tooltip/dist/rc-tooltip';

import TEMPLATES from './templates';
import ANALYSIS from './analysis';

import modal from 'services/modal';
import LayerInfo from 'components/map/layer-info';

class LegendComponent extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    layerGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    sortable: PropTypes.bool,
    collapsable: PropTypes.bool,
    expanded: PropTypes.bool,
    toolbar: PropTypes.node,
    intl: intlShape.isRequired,

    setLayerSettings: PropTypes.func.isRequired,
    setLayerOrder: PropTypes.func
  }

  static defaultProps = {
    className: '',
    sortable: true,
    collapsable: true,
    expanded: true
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
        ...decodeConfig && {
          decodeParams: {
            startDate: dates[0],
            endDate: dates[1],
            trimEndDate: dates[2]
          }
        },
        ...!decodeConfig && {
          params: {
            startDate: dates[0],
            endDate: dates[1]
          }
        }
      }
    });
  }

  onChangeOrder = (datasetIds) => {
    const { setLayerOrder } = this.props;
    setLayerOrder({ datasetIds });
  }

  onRemoveLayer = (layer) => {
    const { toggleLayer } = this.props;
    toggleLayer(layer);
  }

  renderDisclaimer = ({ disclaimer, disclaimerTooltip }) => {
    const { intl } = this.props;

    return renderHtml(intl.formatMessage({ id: disclaimer }), {
      replace: (node) => {
        if (node.attribs && node.attribs.class === 'highlight' && disclaimerTooltip) {
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
              <span className="highlight">{node.children[0].data}</span>
            </Tooltip>
          );
        }
      }
    });
  }

  render() {
    const { intl, className, sortable, collapsable, expanded, layerGroups, toolbar, setLayerSettings } = this.props;

    return (
      <div
        className={classnames({
          'c-legend': true,
          [className]: !!className
        })}
      >
        <Legend
          title={intl.formatMessage({ id: 'legend' })}
          sortable={sortable}
          collapsable={collapsable}
          expanded={expanded}
          onChangeOrder={this.onChangeOrder}
        >
          {layerGroups.map((layerGroup, i) => (
            <LegendListItem
              index={i}
              key={layerGroup.id}
              layerGroup={layerGroup}
              toolbar={
                toolbar || (
                  <LegendItemToolbar>
                    {layerGroup.metadata && <LegendItemButtonInfo />}
                    <LegendItemButtonOpacity
                      trackStyle={{
                        background: '#FFCC00'
                      }}
                      handleStyle={{
                        background: '#FFCC00'
                      }}
                    />
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
        </Legend>
      </div>
    );
  }
}

export default injectIntl(LegendComponent);
