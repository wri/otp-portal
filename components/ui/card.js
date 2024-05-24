import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import omit from 'lodash/omit';
import renderHTML from 'html-react-parser';

// Next components
import Link from 'next/link';
import Truncate from 'react-truncate';

function isNullOrUndefined(val) {
  return val === null || val === undefined;
}

export default function Card({ theme, letter, title, description, link, Component }) {
  const classNames = classnames({
    [theme]: !!theme,
    '-nolink': !link
  });

  const letterClassName = classnames({
    '-number': (!isNullOrUndefined(letter) && !isNaN(parseFloat(letter)))
  });

  return (
    <div className={`c-card ${classNames}`}>
      <div className="card-content">
        {!isNullOrUndefined(letter) && <div className={`card-letter ${letterClassName}`}> {letter} </div>}

        <h2 className="card-title">{title}</h2>
        <div className="card-description">
          <Truncate lines={6}>
            {renderHTML(description || '')}
          </Truncate>
        </div>

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
  Component: PropTypes.any,
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};
