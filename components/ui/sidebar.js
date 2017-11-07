import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default function Sidebar(props) {
  const classNames = classnames({
    [props.className]: !!props.className
  });

  return (
    <aside className={`l-sidebar c-sidebar ${classNames}`}>
      <div className="l-sidebar-content">
        {props.children}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any
};
