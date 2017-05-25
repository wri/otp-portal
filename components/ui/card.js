import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Next components
import Link from 'next/link';

export default function Card({ theme, letter, title, description, link }) {
  const classNames = classnames({
    [theme]: !!theme
  });

  return (
    <div className={`c-card ${classNames}`}>
      <div className="card-letter"> {letter} </div>
      <h2 className="card-title"> {title} </h2>
      <p className="card-description"> {description} </p>
      <Link href={link}>
        <a className="c-button -primary -fullwidth">Link</a>
      </Link>
    </div>
  );
}

Card.propTypes = {
  theme: PropTypes.string,
  letter: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  link: PropTypes.string
};
