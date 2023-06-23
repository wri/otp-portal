import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Redux
import { resetPassword, login } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import SubmitButton from 'components/form/SubmitButton';

const ResetPasswordForm = ({ token }) => {
  const intl = useIntl();

  const handleSubmit = ({ form }) => {
    const attributes = {
      reset_password_token: token,
      password: form.password,
      password_confirmation: form.passwordConfirmation
    }
    // Save data
    return resetPassword(attributes)
      .then((user) => {
        toastr.success(
          intl.formatMessage({ id: 'operators.edit.toaster.success.title' }),
          intl.formatMessage({ id: 'Password changed successfully' })
        );
        return login({
          body: { auth: { email: user.email, password: attributes.password } }
        }).then(() => { window.location.href = '/'; })
      })
  }

  return (
    <div className="c-section">
      <FormProvider onSubmit={handleSubmit} initialValues={{ password: '', passwordConfirmation: '' }}>
        {({ form }) => (
          <Form>
            <fieldset className="c-field-container">
              <Field
                className="-fluid"
                properties={{
                  name: 'password',
                  autoComplete: 'new-password',
                  label: intl.formatMessage({ id: 'New Password' }),
                  type: 'password',
                  required: false
                }}
              >
                {Input}
              </Field>

              <Field
                validations={[
                  {
                    type: 'isEqual',
                    condition: form.password,
                    message: intl.formatMessage({ id: 'The field should be equal to password' })
                  }
                ]}
                className="-fluid"
                properties={{
                  name: 'passwordConfirmation',
                  autoComplete: 'new-password',
                  label: intl.formatMessage({ id: 'Confirm New Password' }),
                  type: 'password',
                  required: false
                }}
              >
                {Input}
              </Field>
            </fieldset>

            <ul className="c-field-buttons">
              <li>
                <SubmitButton>
                  {intl.formatMessage({ id: 'Change Password' })}
                </SubmitButton>
              </li>
            </ul>
          </Form>
        )}
      </FormProvider>
    </div>
  );
}

ResetPasswordForm.propTypes = {
  token: PropTypes.string
};

export default ResetPasswordForm;
