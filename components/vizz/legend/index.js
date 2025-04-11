import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Components
import Icon from 'components/ui/icon';
import LegendList from './components/legend-list';

class Legend extends PureComponent {
  static propTypes = {
    /** Title */
    title: PropTypes.string,
    /** Max width */
    maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** Max height */
    maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** Should the legend be expanded by default? */
    expanded: PropTypes.bool,
    /** Should the legend be collapsable */
    collapsable: PropTypes.bool,
    /** `onChangeOrder = (layerGroupsIds) => {}`
     * @arg {Array} layerGroupIds The new order
     */
    onChangeOrder: PropTypes.func,
    /** Children for render */
    children: PropTypes.node,
  };

  static defaultProps = {
    title: 'Legend',
    expanded: true,
    collapsable: true,
    maxWidth: null,
    maxHeight: null,
    children: [],
    onChangeOrder: (ids) => console.info(ids),
  };

  constructor(props) {
    super(props);
    const { expanded } = props;
    this.state = { expanded };
  }

  /**
   * UI EVENTS
   * onToggleLegend
   */
  onToggleLegend = (bool) => {
    this.setState({ expanded: bool });
  };

  render() {
    const { title, collapsable, maxWidth, maxHeight, children } = this.props;

    const { expanded } = this.state;

    if (!children || !React.Children.count(children)) {
      return null;
    }

    return (
      <div className="vizzuality__c-legend-map" style={{ maxWidth }}>
        {/* LEGEND OPENED */}
        <div className={`vizzuality__open-legend ${classnames({ 'vizzuality__-active': expanded })}`} style={{ maxHeight }}>
          {/* Toggle button */}
          {collapsable && (
            <button
              type="button"
              className="vizzuality__toggle-legend"
              onClick={() => this.onToggleLegend(false)}
            >
              <Icon name="icon-arrow-down" className="-small" />
            </button>
          )}

          {expanded && (
            <LegendList
              helperClass="c-legend-item"
              axis="y"
              lockAxis="y"
              lockToContainerEdges
              lockOffset="50%"
            >
              {React.Children.map(children, (child, index) =>
                React.isValidElement(child) && child.type === 'LegendItemList'
                  ? React.cloneElement(child, { index })
                  : child
              )}
            </LegendList>
          )}
        </div>

        {/* LEGEND CLOSED */}
        <button
          type="button"
          className={`vizzuality__close-legend ${classnames({ 'vizzuality__-active': !expanded })}`}
          onClick={() => this.onToggleLegend(true)}
        >
          <h1 className="vizzuality__legend-title">
            {title}

            {/* Toggle button */}
            <div className="vizzuality__toggle-legend">
              <Icon name="icon-arrow-up" className="-small" />
            </div>
          </h1>
        </button>
      </div>
    );
  }
}

export default Legend;
export { default as LegendListItem } from './components/legend-list-item';
export {
  default as LegendItemToolbar,
} from './components/legend-item-toolbar';

export {
  default as LegendItemTypes,
  LegendItemTypeBasic
} from './components/legend-item-types';
