import React from 'react';
import PropTypes from 'prop-types';

class StaticHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    Component: PropTypes.element,
    background: PropTypes.string.isRequired
  };

  static defaultProptypes = {
    title: '',
    subtitle: '',
    Component: null,
    background: ''
  };

  render() {
    const { title, subtitle, background, Component } = this.props;

    return (
      <div
        className="c-static-header"
        style={{
          backgroundImage: `url(${background})`
        }}
      >
        <div>
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
