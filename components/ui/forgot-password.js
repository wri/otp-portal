import React, { useState } from 'react';

// Intl
import { useIntl } from 'react-intl';

import { forgotPassword } from 'modules/user';

// Services
import modal from 'services/modal';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Login from 'components/ui/login';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import SubmitButton from 'components/form/SubmitButton';
import CancelButton from 'components/form/CancelButton';

const ForgotPassword = () => {
  const intl = useIntl();
  const handleSubmit = ({ form }) => forgotPassword(form.email);

  return (
    <div className="c-login">
      <FormProvider onSubmit={handleSubmit} initialValues={{ email: '' }}>
        {({ form, submitted }) => (<>
          {submitted && (<>
            <p>
              {intl.formatMessage({
                id: 'forgot-password.submitted',
                defaultMessage: 'If account exists for {email}, you will get an email with instructions on how to reset your password. Be sure to check your spam folder. If you do not receive an e-mail from us, it means that we do not have an account associated with that e-mail address.'
              }, { email: form.email })}
            </p>
            <ul className="c-field-buttons">
              <li>
                <CancelButton onClick={() => modal.toggleModal(false)}>
                  {intl.formatMessage({ id: 'Close' })}
                </CancelButton>
              </li>
            </ul>
          </>)}
          {!submitted && (<>
            <h2 className="c-title -extrabig">
              {intl.formatMessage({ id: 'forgot-password.title', defaultMessage: 'Enter your email to reset password' })}
            </h2>

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
                    required: true
                  }}
                >
                  {Input}
                </Field>
              </fieldset>

              <ul className="c-field-buttons">
                <li>
                  <CancelButton onClick={() => modal.toggleModal(true, { children: Login })} />
                </li>
                <li>
                  <SubmitButton>
                    {intl.formatMessage({ id: 'Reset Password' })}
                  </SubmitButton>
                </li>
              </ul>
            </Form>
          </>)}
        </>)}
      </FormProvider>
    </div>
  );
}

export default ForgotPassword;
