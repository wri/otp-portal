import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash/debounce';

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

class LegendComponent extends PureComponent {
  static propTypes = {
    layerGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    sortable: PropTypes.bool,
    collapsable: PropTypes.bool,
    expanded: PropTypes.bool,

    setLayerSettings: PropTypes.func.isRequired,
    setLayerOrder: PropTypes.func.isRequired
  }

  static defaultProps = {
    sortable: true,
    collapsable: true,
    expanded: true
  }

  onChangeInfo = (info, id) => {
    const { setLayerSettings } = this.props;
    setLayerSettings({ id, settings: { info } });
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


  render() {
    const { sortable, collapsable, expanded, layerGroups } = this.props;

    return (
      <div
        className="c-legend"
      >
        <Legend
          maxHeight={'65vh'}
          sortable={sortable}
          collapsable={collapsable}
          expanded={expanded}
          onChangeOrder={this.onChangeOrder}
        >
          {layerGroups.map((layerGroup, i) => (
            <LegendListItem
              index={i}
              key={layerGroup.slug}
              layerGroup={layerGroup}
              toolbar={
                <LegendItemToolbar>
                  {layerGroup.description && <LegendItemButtonInfo />}
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
                }
              onChangeInfo={(l => this.onChangeInfo(true, layerGroup.id))}
              onChangeVisibility={((l, visibility) => this.onChangeVisibility(l, visibility, layerGroup.id))}
              onChangeOpacity={(l, opacity) => this.onChangeOpacity(l, opacity, layerGroup.id)}
              onRemoveLayer={(l) => { this.onRemoveLayer(l); }}
            >
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
            </LegendListItem>
            ))}
        </Legend>
      </div>
    );
  }
}

export default LegendComponent;
