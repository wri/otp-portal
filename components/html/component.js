import React from 'react';
import PropTypes from 'prop-types';

import renderHTML from 'react-render-html';

class HTML extends React.Component {
  static propTypes = {
    html: PropTypes.string.isRequired
  };

  render() {
    const { html } = this.props;

    return (
      <div className="c-html">
        {renderHTML(html)}
      </div>
    );
  }
}

export default HTML;
