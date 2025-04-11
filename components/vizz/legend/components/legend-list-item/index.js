import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class LegendListItem extends PureComponent {
  static propTypes = {
    dataset: PropTypes.string,
    layers: PropTypes.arrayOf(PropTypes.shape({})),
    children: PropTypes.node,
    toolbar: PropTypes.node,
    title: PropTypes.node,
  };

  static defaultProps = {
    dataset: '',
    layers: [],
    children: [],
    toolbar: [],
    title: [],
  };

  render() {
    const { layers, children, toolbar, title, ...props } = this.props;
    const activeLayer = layers.find((l) => l.active) || layers[0];

    return (
      <li
        className={classnames({
          'vizzuality__c-legend-item': true
        })}
      >
        <div
          className={classnames({
            'vizzuality__legend-item-container': true
          })}
        >
          <div className="vizzuality__legend-info">
            <header className="vizzuality__legend-item-header">
              <h3>
                {React.isValidElement(title) && typeof title.type !== 'string'
                  ? React.cloneElement(title, { ...props, layers, activeLayer })
                  : activeLayer && activeLayer.name}
              </h3>
              {React.isValidElement(toolbar) &&
                typeof toolbar.type !== 'string' &&
                React.cloneElement(toolbar, { ...props, layers, activeLayer })}
            </header>

            {React.Children.map(children, (child) =>
              React.isValidElement(child) && typeof child.type !== 'string'
                ? React.cloneElement(child, { layers, activeLayer })
                : child
            )}
          </div>
        </div>
      </li>
    );
  }
}

export default LegendListItem;
