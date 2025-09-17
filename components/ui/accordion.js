import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from 'components/ui/icon';

function Accordion({
  header,
  children,
  defaultOpen = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cx("c-accordion", className)}>
      <header className="accordion-header">
        <button
          className={cx('c-button -small -clean -with-icon', {
            open: isOpen
          })}
          onClick={() => setIsOpen(!isOpen)}
        >
          {header}
          {isOpen
            ? <Icon name="icon-arrow-up" />
            : <Icon name="icon-arrow-down" />
          }
        </button>
      </header>
      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
}

Accordion.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  className: PropTypes.string
};

export default Accordion;
