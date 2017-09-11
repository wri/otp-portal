import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import omit from 'lodash/omit';

// Intl
import { FormattedMessage } from 'react-intl';

// Next components
import Link from 'next/link';

export default function Card({ theme, letter, title, description, link, intl }) {
  const classNames = classnames({
    [theme]: !!theme
  });

  const letterClassName = classnames({
    '-number': (letter && !isNaN(parseFloat(letter)))
  });

  return (
    <div className={`c-card ${classNames}`}>
      <div className="card-content">
        {letter && <div className={`card-letter ${letterClassName}`}> {letter} </div>}

        <h2 className="c-title -extrabig -uppercase -proximanova card-title">
          <FormattedMessage id={title} />
        </h2>
        <p className="card-description">
          <FormattedMessage id={description} />
        </p>
      </div>

      <Link {...omit(link, 'label')} >
        <a className="card-link c-button -primary -fullwidth">
          <FormattedMessage id={link.label} />
        </a>
      </Link>
    </div>
  );
}

Card.propTypes = {
  theme: PropTypes.string,
  letter: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  link: PropTypes.object
};
