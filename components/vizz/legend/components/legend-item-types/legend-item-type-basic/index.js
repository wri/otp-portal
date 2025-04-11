import React from 'react';
import PropTypes from 'prop-types';

import LegendItem from './legend-item-type-basic-item';

export class LegendTypeBasic extends React.PureComponent {
  static propTypes = {
    activeLayer: PropTypes.shape({}),
    mode: PropTypes.oneOf(['horizontal', 'vertical', 'columns']),
  };

  static defaultProps = {
    activeLayer: {},
    mode: 'vertical',
  };

  render() {
    const { activeLayer, mode } = this.props;
    const { legendConfig } = activeLayer;

    if (!legendConfig || legendConfig.type !== 'basic') {
      return null;
    }

    return (
      <div className="vizzuality__c-legend-type-basic">
        <ul className={`vizzuality__${mode}`}>
          {legendConfig.items.map((item) => (
            <li key={`legend-basic-item-${item.name}`}>
              <LegendItem {...item} />

              {!!item.items && item.items.length && (
                <ul className="vizzuality__legend-basic-group">
                  {item.items.map((it) => (
                    <li key={`legend-basic-item-${it.name}`}>
                      <LegendItem style={{ borderBottom: 0 }} {...it} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default LegendTypeBasic;
