import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function Icon({ name, style, className }) {
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <svg className={`c-icon ${classNames}`} style={style}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
}

Icon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string
};
