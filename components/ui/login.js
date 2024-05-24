import React from 'react';
import Link from 'next/link';

// Intl
import { useIntl } from 'react-intl';

import { login } from 'modules/user';

// Services
import modal from 'services/modal';

// Components
import ForgotPassword from 'components/ui/forgot-password';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Form, { FormProvider } from 'components/form/Form';
import SubmitButton from 'components/form/SubmitButton';
import CancelButton from 'components/form/CancelButton';

const Login = () => {
  const intl = useIntl();

  const handleSubmit = ({ form }) => {
    return login({ body: { auth: form } })
      .then(() => {
        window.location.reload();
      }).catch((err) => {
        let errorMessage = intl.formatMessage({ id: 'Oops! There was an error, try again' });
        if (err.status === 401) {
          errorMessage = intl.formatMessage({ id: 'login.error', defaultMessage: 'Wrong email or password' });
        }
        throw new Error(errorMessage);
      })
  };

  const handleForgotPasswordClick = () => {
    modal.toggleModal(true, {
      children: ForgotPassword
    });
  };

  const closeModal = () => { modal.toggleModal(false); };

  return (
    <div className="c-login">
      <h2 className="c-title">
        {intl.formatMessage({ id: 'login' })}
      </h2>

      <FormProvider onSubmit={handleSubmit} initialValues={{ email: '', password: '' }}>
        <Form>
          <fieldset className="c-field-container">
            {/* EMAIL */}
            <Field
              validations={['required', 'email']}
              className="-fluid"
              properties={{
                name: 'email',
                label: intl.formatMessage({ id: 'login.form.field.email' }),
                type: 'email',
                required: true,
              }}
            >
              {Input}
            </Field>

            {/* PASSWORD */}
            <Field
              validations={['required']}
              className="-fluid"
              properties={{
                name: 'password',
                label: intl.formatMessage({ id: 'login.form.field.password' }),
                type: 'password',
                required: true,
              }}
            >
              {Input}
            </Field>
          </fieldset>

          <div className="c-field-extra-actions">
            <p>{intl.formatMessage({ id: 'signin.forgot_password', defaultMessage: 'Did you forget your password?' })}  <button type="button" className="c-link-button" onClick={handleForgotPasswordClick}>{intl.formatMessage({ id: 'signin.reset_your_password', defaultMessage: 'Reset your password' })}</button></p>
            <p>{intl.formatMessage({ id: 'signin.not_a_member' })} <Link href="/signup" onClick={closeModal}>{intl.formatMessage({ id: 'signin.register_now' })}</Link></p>
            <p>{intl.formatMessage({ id: 'signin.not_a_producer' })} <Link href="/operator/new" onClick={closeModal}>{intl.formatMessage({ id: 'signin.register_producer' })}</Link></p>
          </div>

          <ul className="c-field-buttons">
            <li>
              <CancelButton onClick={closeModal} />
            </li>
            <li>
              <SubmitButton>
                {intl.formatMessage({ id: 'login' })}
              </SubmitButton>
            </li>
          </ul>
        </Form>
      </FormProvider>
    </div>
  );
}

export default Login;
