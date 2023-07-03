import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import cx from 'classnames';

import { useForm } from 'components/form/Form';

const SubmitButton = ({ children }) => {
  const { submitting } = useForm();
  const intl = useIntl();

  return (
    <button
      type="submit"
      name="commit"
      disabled={submitting}
      className={cx('c-button -secondary -expanded', { '-submitting': submitting })}
    >
      {children || intl.formatMessage({ id: 'submit' })}
    </button>
  )
}

SubmitButton.propTypes = {
  children: PropTypes.node
};

export default SubmitButton;
