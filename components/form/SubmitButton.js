import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import cx from 'classnames';

import { useForm } from 'components/form/Form';

const SubmitButton = ({ children, disabled }) => {
  const { submitting } = useForm();
  const intl = useIntl();

  return (
    <button
      type="submit"
      name="commit"
      disabled={submitting || disabled}
      className={cx('c-button -secondary -expanded', { '-submitting': submitting })}
    >
      {children || intl.formatMessage({ id: 'submit' })}
    </button>
  )
}

SubmitButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool
};

export default SubmitButton;
