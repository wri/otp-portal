import React from 'react';
import PropTypes from 'prop-types';

class StaticHeader extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    background: PropTypes.string.isRequired
  };

  static defaultProptypes = {
    title: '',
    subtitle: '',
    background: ''
  };

  render() {
    const { title, subtitle, background } = this.props;

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
        </div>
      </div>
    );
  }
}

export default StaticHeader;
