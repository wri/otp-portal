import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { saveUser } from 'modules/user';

// Next components
import Link from 'next/link';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Select from 'components/form/SelectInput';
import Checkbox from 'components/form/Checkbox';
import RadioGroup from 'components/form/RadioGroup';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';
import { logEvent } from 'utils/analytics';
import SubmitButton from '../form/SubmitButton';

import { LOCALES } from 'constants/locales';

const UserNewForm = (props) => {
  const { countries, operators } = props;
  const intl = useIntl();

  const handleSubmit = ({ form }) => {
    const body = {
      user: {
        ...form
      }
    };
    if (form.permissions_request === 'government') {
      delete body.user.operator_id;
    }

    // Save data
    return props.saveUser({ body })
      .then(() => {
        logEvent('sign_up', { method: 'credentials' });
        if (props.onSubmit) props.onSubmit({ email: form.email });
      })
  }

  const registerNewProducerHint = (
    <>
      {intl.formatMessage({ id: 'signin.not_a_producer' })}
      {' '}
      <Link href="/operators/new">
        {intl.formatMessage({ id: 'signin.register_producer' })}
      </Link>
    </>
  );

  const formInitialState = {
    name: '',
    email: '',
    operator_id: '',
    country_id: '',
    password: '',
    password_confirmation: '',
    permissions_request: 'operator',
    agree: false,
    locale: intl.locale
  }

  return (
    <div className="c-section">
      <div className="l-container">
        <FormProvider onSubmit={handleSubmit} initialValues={formInitialState}>
          {({ form }) => (<>
            <Form>
              <fieldset className="c-field-container">
                {/* Permission request */}
                <Field
                  validations={['required']}
                  className="-fluid"
                  options={[
                    { label: intl.formatMessage({ id: 'operator' }), value: 'operator' },
                    { label: intl.formatMessage({ id: 'government' }), value: 'government' }
                  ]}
                  hint={intl.formatMessage({ id: 'signup.user.form.field.permissions_request.hint' })}
                  properties={{
                    name: 'permissions_request',
                    label: intl.formatMessage({ id: 'signup.user.form.field.permissions_request' }),
                    required: true,
                  }}
                >
                  {RadioGroup}
                </Field>

                {/* Countries */}
                <Field
                  validations={['required']}
                  className="-fluid"
                  options={HELPERS_REGISTER.mapToSelectOptions(countries.data)}
                  properties={{
                    name: 'country_id',
                    label: intl.formatMessage({ id: 'signup.user.form.field.country' }),
                    required: true,
                    instanceId: 'select.country_id',
                    placeholder: intl.formatMessage({ id: 'select.placeholder' })
                  }}
                >
                  {Select}
                </Field>

                {/* Operators */}
                {form.permissions_request === 'operator' && form.country_id && (
                  <Field
                    validations={['required']}
                    className="-fluid"
                    hint={registerNewProducerHint}
                    options={HELPERS_REGISTER.mapToSelectOptions(operators.data.filter(o => o.country && o.country.id === form.country_id))}
                    properties={{
                      name: 'operator_id',
                      label: intl.formatMessage({ id: 'signup.user.form.field.producer' }),
                      required: true,
                      instanceId: 'select.operator_id',
                      placeholder: intl.formatMessage({ id: 'select.placeholder' })
                    }}
                  >
                    {Select}
                  </Field>
                )}

                <Field
                  validations={['required']}
                  className="-fluid"
                  properties={{
                    name: 'name',
                    label: intl.formatMessage({ id: 'signup.user.form.field.name' }),
                    required: true
                  }}
                >
                  {Input}
                </Field>

                <Field
                  validations={['required', 'email']}
                  className="-fluid"
                  properties={{
                    name: 'email',
                    autoComplete: 'email',
                    label: intl.formatMessage({ id: 'signup.user.form.field.email' }),
                    required: true,
                  }}
                >
                  {Input}
                </Field>

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

                <Field
                  validations={['required']}
                  className="-fluid"
                  properties={{
                    name: 'password',
                    autoComplete: 'new-password',
                    label: intl.formatMessage({ id: 'signup.user.form.field.password' }),
                    type: 'password',
                    required: true
                  }}
                >
                  {Input}
                </Field>

                <Field
                  validations={[
                    'required',
                    {
                      type: 'isEqual',
                      condition: form.password,
                      message: intl.formatMessage({ id: 'The field should be equal to password' })
                    }
                  ]}
                  className="-fluid"
                  properties={{
                    name: 'password_confirmation',
                    autoComplete: 'new-password',
                    label: intl.formatMessage({ id: 'signup.user.form.field.password_confirmation' }),
                    type: 'password',
                    required: true
                  }}
                >
                  {Input}
                </Field>

                <Field
                  className="-fluid"
                  validations={['required']}
                  properties={{
                    required: true,
                    name: 'agree',
                    label:
                      <>
                        {intl.formatMessage({ id: 'signup.user.form.field.agree' })}
                        {' ('}
                        <Link href="/terms" passHref>
                          <a target="_blank" rel="noopener noreferrer">
                            {intl.formatMessage({ id: 'Read here' })}
                          </a>
                        </Link>
                        {')'}
                      </>
                  }}
                >
                  {Checkbox}
                </Field>
              </fieldset>

              <ul className="c-field-buttons">
                <li>
                  <SubmitButton>
                    {intl.formatMessage({ id: 'signup' })}
                  </SubmitButton>
                </li>
              </ul>
            </Form>
          </>)}
        </FormProvider>
      </div>
    </div>
  );
}

UserNewForm.propTypes = {
  operators: PropTypes.object,
  countries: PropTypes.object,
  saveUser: PropTypes.func,
  onSubmit: PropTypes.func
};

export default connect(
  state => ({
    operators: state.operators,
    countries: state.countries
  }),
  { saveUser }
)(UserNewForm);
