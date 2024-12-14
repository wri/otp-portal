import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { updateUserProfile } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Select from 'components/form/SelectInput';
import SubmitButton from 'components/form/SubmitButton';

import { LOCALES } from 'constants/locales';

const UserEditForm = (props) => {
  const intl = useIntl();
  const { userProfile } = props;
  const isOrganizationAccount = userProfile['organization-account'] === true;

  const handleSubmit = ({ form, setFormValues }) => {
    const attributes = {
      password: form.password,
      locale: form.locale,
      'password-confirmation': form.passwordConfirmation,
      'current-password': form.password && form.password.length && form.currentPassword
    }
    if (!isOrganizationAccount) {
      attributes['first-name'] = form.firstName;
      attributes['last-name'] = form.lastName;
    }

    return props
      .updateUserProfile({ attributes })
      .then(() => {
        toastr.success(
          intl.formatMessage({ id: 'operators.edit.toaster.success.title' }),
          intl.formatMessage({ id: 'operators.edit.toaster.success.content' })
        );
        setFormValues({
          password: '',
          passwordConfirmation: '',
          currentPassword: ''
        })
        if (props.onSubmit) props.onSubmit();
      })
      .catch((error) => {
        console.error(error);
        // TODO: fix this
        try {
          error.errors.forEach(er => {
            if (er.title === "is invalid" && er.source?.pointer === '/data/attributes/current-password') {
              toastr.error(
                intl.formatMessage({ id: 'Error' }),
                intl.formatMessage({ id: 'Current password is invalid' }),
              )
            } else {
              toastr.error(intl.formatMessage({ id: 'Error' }), `${er.title} - ${er.detail}`)
            }
          });
        } catch (e) {
          toastr.error(intl.formatMessage({ id: 'Error' }), intl.formatMessage({ id: 'Oops! There was an error, try again' }));
        }
      });
  };

  const initialFormValues = {
    firstName: userProfile['first-name'] || '',
    lastName: userProfile['last-name'] || '',
    locale: userProfile.locale || 'en',
    password: '',
    passwordConfirmation: '',
    currentPassword: ''
  }

  return (
    <div className="c-section">
      <div className="l-container">
        <FormProvider initialValues={initialFormValues} onSubmit={handleSubmit}>
          {({ form }) => (
            <Form>
              <fieldset className="c-field-container">
                {!isOrganizationAccount && (
                  <>
                    <Field
                      validations={['required']}
                      className="-fluid"
                      properties={{
                        name: 'firstName',
                        label: intl.formatMessage({ id: 'signup.user.form.field.first_name' }),
                        required: true
                      }}
                    >
                      {Input}
                    </Field>

                    <Field
                      validations={['required']}
                      className="-fluid"
                      properties={{
                        name: 'lastName',
                        label: intl.formatMessage({ id: 'signup.user.form.field.last_name' }),
                        required: true
                      }}
                    >
                      {Input}
                    </Field>
                  </>
                )}

                <Field
                  validations={['required']}
                  className="-fluid"
                  options={LOCALES.map(l => ({ label: l.name, value: l.code }))}
                  properties={{
                    name: 'locale',
                    label: intl.formatMessage({ id: 'signup.user.form.field.preferred_language', defaultMessage: 'Preferred Language' }),
                    required: true,
                    instanceId: 'select.locale',
                    placeholder: intl.formatMessage({ id: 'select.placeholder' })
                  }}
                >
                  {Select}
                </Field>
              </fieldset>

              <fieldset className="c-field-container">
                <h2 className="c-title">
                  {intl.formatMessage({ id: 'Update Password' })}
                </h2>

                <Field
                  validations={[
                    'haveLowercaseLetter',
                    'haveUppercaseLetter',
                    'haveDigit',
                    {
                      type: 'minLength',
                      condition: 10
                    },
                    {
                      type: 'maxLength',
                      condition: 128
                    }
                  ]}
                  className="-fluid"
                  properties={{
                    name: 'password',
                    autoComplete: 'new-password',
                    label: intl.formatMessage({ id: 'New Password' }),
                    type: 'password',
                    required: false,
                    value: form.password
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
                    required: false,
                    value: form.passwordConfirmation
                  }}
                >
                  {Input}
                </Field>

                {form.password && form.password.length && (
                  <Field
                    className="-fluid"
                    validations={['required']}
                    hint={intl.formatMessage({ id: 'We need your current password to confirm your changes' })}
                    properties={{
                      name: 'currentPassword',
                      autoComplete: 'current-password',
                      label: intl.formatMessage({ id: 'Current Password' }),
                      type: 'password',
                      required: true,
                      value: form.currentPassword
                    }}
                  >
                    {Input}
                  </Field>
                )}
              </fieldset>

              <ul className="c-field-buttons">
                <li>
                  <SubmitButton>
                    {intl.formatMessage({ id: 'Update' })}
                  </SubmitButton>
                </li>
              </ul>
            </Form>
          )}
        </FormProvider>
      </div>
    </div>
  );
}

UserEditForm.propTypes = {
  userProfile: PropTypes.object,
  updateUserProfile: PropTypes.func,
  onSubmit: PropTypes.func
};

export default connect(
  null,
  { updateUserProfile }
)(UserEditForm);
