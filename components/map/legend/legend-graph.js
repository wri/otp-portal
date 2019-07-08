import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

class LegendGraph extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      groups: {}
    };

    // BINDINGS
    this.triggerToggleGroup = this.triggerToggleGroup.bind(this);
  }

  getLegendGraph() {
    const config = this.props.config;

    switch (config.type) {
      case 'basic': {
        return (
          <div className={`graph -${config.type}`}>
            <div className="graph-list">
              {config.items.map((item) => {
                const className = classnames({
                  'graph-list-item': !item.group,
                  'graph-list-group-item': item.group
                });

                return (
                  <div className={className} key={item.name}>
                    {!item.group && <span className="color" style={{ background: item.color }} />}
                    <span className="label">{this.props.intl.formatMessage({ id: item.name })}</span>

                    {!!item.group && (
                      <div className="graph-list">
                        {item.items.map(i => (
                          <div className="graph-list-item" key={i.name}>
                            <span className="color" style={{ background: i.color }} />
                            <span className="label">{this.props.intl.formatMessage({ id: i.name })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'group': {
        return (
          <div className={`graph -${config.type}`}>
            {config.items.map((item) => {
              const colorClass = classnames('color', {
                '-transparent': this.state.groups[item.name]
              });
              const itemColor = !this.state.groups[item.name] ?
                item.color : 'transparent';

              return (
                <div key={item.name} className="graph-group">
                  <div
                    className="graph-group-name"
                    onClick={() => this.triggerToggleGroup(item)}
                  >
                    <span className={colorClass} style={{ background: itemColor }} />
                    {this.props.intl.formatMessage({ id: item.name })}
                  </div>
                  {this.state.groups[item.name] &&
                    <div className="graph-list">
                      {item.items.map(it => (
                        <div className="graph-list-item" key={it.name}>
                          <span className="color" style={{ background: it.color }} />
                          <span className="label">{this.props.intl.formatMessage({ id: it.name })}</span>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              );
            })}
          </div>
        );
      }

      case 'cluster': {
        return (
          <div className={`graph -${config.type}`}>
            <div className="graph-units">Units: {config.units}</div>
            <div className="graph-description">{config.description}</div>
            <div className="graph-list">
              {config.items.map(item => (
                <div className="graph-list-item" key={item.name}>
                  <span className="color" style={{ background: item.color }} />
                  <span className="label">{this.props.intl.formatMessage({ id: item.name })}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'choropleth': {
        return (
          <div className={`graph -${config.type}`}>
            {config.units && <div className="graph-units">Units: {config.units}</div>}
            <div>
              <div className="graph-list">
                {config.items.map(item => (
                  <div className="graph-list-item" style={{ width: `${100 / config.items.length}%` }} key={item.name || item.value}>
                    <span className="color" style={{ background: item.color }} />
                  </div>
                ))}
              </div>
              <div className="graph-list">
                {config.items.map(item => (
                  <div className="graph-list-item" style={{ width: `${100 / config.items.length}%` }} key={item.name || item.value}>
                    <span className="label">{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="graph-list">
                {config.items.map(item => (
                  <div className="graph-list-item" style={{ width: `${100 / config.items.length}%` }} key={item.name || item.value}>
                    <span className="value">{item.value}</span>
                  </div>
                ))}
              </div>
              {config.disclaimer &&
              <div className="graph -basic -disclaimer">
                <div className="graph-list">
                  {config.disclaimer.map(item => (
                    <div className="graph-list-item" key={item.name}>
                      <span className="color" style={{ background: item.color }} />
                      <span className="label">{this.props.intl.formatMessage({ id: item.name })}</span>
                    </div>
                  ))}
                </div>
              </div>}
            </div>
          </div>
        );
      }

      default: {
        console.error('No type specified');
        return null;
      }
    }
  }

  triggerToggleGroup(group) {
    this.setState({
      groups: {
        ...this.state.groups,
        [group.name]: !this.state.groups[group.name]
      }
    });
  }

  render() {
    return (
      <div className="c-legend-graph">
        {this.getLegendGraph()}
      </div>
    );
  }
}

LegendGraph.propTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object
};

export default injectIntl(LegendGraph);
