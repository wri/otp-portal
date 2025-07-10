import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import useOutsideClick from 'hooks/use-outside-click';

const DropdownContent = (props) => {
  const { children, className, ...dropdownContentProps } = props;
  return (
    <div {...dropdownContentProps} className={classNames('dropdown__content', className)}>
      {children}
    </div>
  );
}

const DropdownTrigger = (props) => {
  const { children, ...dropdownTriggerProps } = props;
  const className = classNames('dropdown__trigger', props.className);

  return (
    <div role="button" {...dropdownTriggerProps} className={className}>
      {children}
    </div>
  );
}

const Dropdown = (props) => {
  const { children, className, disabled } = props;
  const [active, setActive] = useState(false);
  const dropdownRef = useRef(null);

  const onToggleClick = (event) => {
    event.preventDefault();
    if (active) {
      setActive(false);
    } else {
      setActive(true);
    }
  };

  useOutsideClick(dropdownRef, () => setActive(false));

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

  return (
    <div {...cleanProps} ref={dropdownRef} className={classList}>
      {boundChildren}
    </div>
  );
}

Dropdown.propTypes = {
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object
};

Dropdown.defaultProps = {
  className: ''
};

export { Dropdown, DropdownContent, DropdownTrigger };

export default Dropdown;
