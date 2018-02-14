import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


class StaticHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    Component: PropTypes.oneOfType([PropTypes.element, PropTypes.bool]),
    background: PropTypes.string.isRequired,
    tabs: PropTypes.bool
  };

  static defaultProptypes = {
    title: '',
    subtitle: '',
    Component: null,
    background: '',
    tabs: false
  };

  render() {
    const { title, subtitle, background, Component, tabs } = this.props;
    const customClassName = classnames({
      'container -tabs': tabs
    });

    return (
      <div
        className="c-static-header"
        style={{
          backgroundImage: `url(${background})`
        }}
      >
        <div className={customClassName}>
          <h2>{title}</h2>
          <h3>{subtitle}</h3>

          {!!Component &&
            <div className="static-header-component">
              {Component}
            </div>
          }
        </div>
      </div>
    );
  }
}

export default StaticHeader;
