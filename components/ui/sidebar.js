import React from 'react';
import PropTypes from 'prop-types';

export default function Sidebar(props) {
  return (
    <aside className="l-sidebar c-sidebar">
      <div className="l-sidebar-content">
        {props.children}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  children: PropTypes.any
};
