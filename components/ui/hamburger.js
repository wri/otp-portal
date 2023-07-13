import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Hamburger = ({ isOpen, onClick, theme }) => {
  return (
    <button
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close the menu' : 'Open the menu'}
      className={classnames("c-hamburger", theme, { "open": isOpen })}
      onClick={onClick}
    >
      <div className="c-hamburger__lines">
        <span aria-hidden="true" className="c-hamburger__line" />
        <span aria-hidden="true" className="c-hamburger__line" />
        <span aria-hidden="true" className="c-hamburger__line" />
      </div>
    </button>
  )
}

Hamburger.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  theme: PropTypes.string
};

Hamburger.defaultProps = {
  theme: '-theme-light'
};

export default Hamburger;

