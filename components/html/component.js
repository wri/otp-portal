import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import renderHTML from 'html-react-parser';

function linkifyProcess(content) {
  const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
  return content.replace(reg, "<a href='$1$2'>$1$2</a>");
}

function preprocess(text, linkify) {
  if (linkify) return linkifyProcess(text);

  return text;
}

const HTML = ({ html, linkify, className }) => (
  <div className={cx('c-html', className)}>
    {renderHTML(
      preprocess(html, linkify) || '',
      {
        replace: (node) => {
          if (node.name === 'a') {
            return (
              <a
                key={node.attribs.href}
                href={node.attribs.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {node.children[0].data}
              </a>
            );
          }
        }
      }
    )}
  </div>
)

HTML.defaultProps = {
  linkify: false
}

HTML.propTypes = {
  html: PropTypes.string.isRequired,
  className: PropTypes.string,
  linkify: PropTypes.bool.isRequired
}

export default HTML;
