import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import renderHTML from 'react-render-html';

const HTML = ({ html, className }) => (
  <div className={cx('c-html', className)}>
    {renderHTML(html || '')}
  </div>
)

HTML.propTypes = {
  html: PropTypes.string.isRequired,
  className: PropTypes.string
}

export default HTML;
