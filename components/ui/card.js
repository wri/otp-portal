import React from 'react';
import PropTypes from 'prop-types';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import classnames from 'classnames';
import { omit } from 'utils/general';

const Truncate = dynamic(() => import('react-truncate'));

function isNullOrUndefined(val) {
  return val === null || val === undefined;
}

export default function Card({ theme, letter, title, description, descriptionTruncateLines, link, Component }) {
  const classNames = classnames({
    [theme]: !!theme,
    '-nolink': !link
  });

  const letterClassName = classnames({
    '-number': (!isNullOrUndefined(letter) && !isNaN(parseFloat(letter)))
  });
  const shouldTruncate = descriptionTruncateLines > 0;

  return (
    <div className={`c-card ${classNames}`}>
      <div className="card-content">
        {!isNullOrUndefined(letter) && <div className={`card-letter ${letterClassName}`}> {letter} </div>}

        <h2 className="card-title">{title}</h2>
        {!shouldTruncate && (
          <div className="card-description" dangerouslySetInnerHTML={{ __html: description || '' }}>
          </div>
        )}
        {shouldTruncate && (
          <div className="card-description">
            <Truncate lines={descriptionTruncateLines} >
              <span dangerouslySetInnerHTML={{ __html: description || '' }}>
              </span>
            </Truncate>
          </div>
        )}

        {!!Component && (
          <div className="card-component">
            {Component}
          </div>
        )}
      </div>

      {!!link && (
        <Link
          {...omit(link, 'label')}
          prefetch={false}
          className="card-link c-button -primary -fullwidth">
          {link.label}
        </Link>
      )}
    </div>
  );
}


Card.propTypes = {
  theme: PropTypes.string,
  letter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  description: PropTypes.string,
  descriptionTruncateLines: PropTypes.number,
  Component: PropTypes.any,
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};

Card.defaultProps = {
  descriptionTruncateLines: 6
}
