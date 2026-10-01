import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// A separate, cacheable file instead of 23 symbols inlined in every page's HTML (3.4 kB gzipped,
// which kept the home page out of the first network round trip).
import sprite from './icons.svg';

const SPRITE_URL = sprite.src || sprite;

export default function Icon({ name, style, className }) {
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <svg className={`c-icon ${classNames}`} style={style}>
      <use xlinkHref={`${SPRITE_URL}#${name}`} />
    </svg>
  );
}

Icon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string
};
