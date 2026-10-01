import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { ICONS } from './icons';

export default function Icon({ name, style, className }) {
  const classNames = classnames({
    [className]: !!className
  });
  const icon = ICONS[name];

  return (
    <svg className={`c-icon ${classNames}`} style={style} viewBox={icon?.viewBox}>
      {icon && <title>{icon.title}</title>}
      {icon && icon.paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

Icon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string
};
