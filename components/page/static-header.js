import React from 'react';
import PropTypes from 'prop-types';

export default class StaticHeader extends React.Component {

  render() {
    const { title, background } = this.props;

    return (
      <div
        className="c-static-header"
        style={{
          background: `url(${background})`
        }}
      >
        <h2>{title}</h2>
      </div>
    );
  }
}

StaticHeader.propTypes = {
  title: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired
};
