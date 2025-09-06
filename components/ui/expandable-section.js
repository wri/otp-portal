import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useIntl } from 'react-intl';

function ExpandableSection({
  header,
  children,
  defaultOpen = false,
  disabled = false,
  className = ''
}) {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <li className={cx("c-expandable-section", className)}>
      <header className="expandable-section-header">
        {header}
        <button
          className={cx('expandable-section-btn -proximanova', {
            open: isOpen,
            disabled
          })}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen
            ? intl.formatMessage({ id: 'collapse' })
            : intl.formatMessage({ id: 'expand' })
          }
        </button>
      </header>

      {isOpen && children}
    </li>
  );
}

ExpandableSection.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default ExpandableSection;
