import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

const CancelButton = ({ children, ...buttonProps }) => {
  const intl = useIntl();

  return (
    <button
      type="button"
      name="commit"
      className="c-button -primary -expanded"
      {...buttonProps}
    >
      {children || intl.formatMessage({ id: 'cancel' })}
    </button>
  )
}

CancelButton.propTypes = {
  children: PropTypes.node
};

export default CancelButton;
