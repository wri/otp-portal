import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const DropdownContent = (props) => {
  const { children, className, ...dropdownContentProps } = props;
  return (
    <div {...dropdownContentProps} className={`dropdown__content ${className}`}>
      {children}
    </div>
  );
}

const DropdownTrigger = (props) => {
  const { children, className, ...dropdownTriggerProps } = props;

  return (
    <a {...dropdownTriggerProps} className={`dropdown__trigger ${className}`}>
      {children}
    </a>
  );
}

const Dropdown = (props) => {
  const { children, className, disabled } = props;
  const [active, setActive] = useState(false);

  useEffect(() => {
    window.addEventListener('click', onWindowClick);
    window.addEventListener('touchstart', onWindowClick);

    return () => {
      window.removeEventListener('click', onWindowClick);
      window.removeEventListener('touchstart', onWindowClick);
    };
  }, []);

  const onWindowClick = (event) => {
    const dropdownElement = event.target.closest('.dropdown');
    if (dropdownElement && !dropdownElement.contains(event.target) && active) {
      setActive(false);
    }
  };

  const onToggleClick = (event) => {
    event.preventDefault();
    if (active) {
      setActive(false);
    } else {
      setActive(true);
    }
  };

  const classList = classNames('dropdown', {
    'dropdown--active': active,
    'dropdown--disabled': disabled
  }, className);

  // stick callback on trigger element
  const boundChildren = React.Children.map(children, child => {
    if (child.type === DropdownTrigger) {
      const originalOnClick = child.props.onClick;
      child = React.cloneElement(child, {
        onClick: (event) => {
          if (!disabled) {
            onToggleClick(event);
            if (originalOnClick) {
              originalOnClick.apply(child, arguments);
            }
          }
        }
      });
    }
    return child;
  });

  const cleanProps = { ...props };
  delete cleanProps.active;
  delete cleanProps.onShow;
  delete cleanProps.onHide;

  return (
    <div {...cleanProps} className={classList}>
      {boundChildren}
    </div>
  );
}

Dropdown.propTypes = {
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  onHide: PropTypes.func,
  onShow: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object
};

Dropdown.defaultProps = {
  className: ''
};

export { Dropdown, DropdownContent, DropdownTrigger };

export default Dropdown;
