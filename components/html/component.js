import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import renderHTML, { domToReact } from 'html-react-parser';

function linkifyProcess(content) {
  const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
  return content.replace(reg, "<a href='$1$2'>$1$2</a>");
}

function preprocess(text, linkify, placeholders) {
  let processedText = text;
  if (linkify) processedText = linkifyProcess(processedText);
  if (placeholders) {
    Object.keys(placeholders).forEach((key) => {
      processedText = processedText.replace(`{${key}}`, placeholders[key]);
    });
  }

  return processedText;
}

const HTML = ({ html, linkify, placeholders, className }) => (
  <div className={cx('c-html', className)}>
    {renderHTML(
      preprocess(html, linkify, placeholders) || '',
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
                {domToReact(node.children)}
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
  linkify: PropTypes.bool.isRequired,
  placeholders: PropTypes.object
}

export default HTML;
