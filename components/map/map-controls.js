import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function MapControls({ className, children }) {
  const childs = (Array.isArray(children) || !children) ? children : [children];
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <div className={`c-map-controls ${classNames}`}>
      {childs &&
        <ul className="map-controls-list">
          {childs.map((c, i) => {
            return <li className="map-controls-item" key={i}>{c}</li>
          })}
        </ul>
      }
    </div>
  );
}

MapControls.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any
};
