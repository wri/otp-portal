import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { saveOperator } from 'modules/user';

// Next components
import Link from 'next/link';

// Components
import Spinner from 'components/ui/spinner';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Textarea from 'components/form/Textarea';
import FileImage from 'components/form/FileImage';
import Form, { FormProvider } from 'components/form/Form';
import Select from 'components/form/SelectInput';
import SubmitButton from 'components/form/SubmitButton';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';

const NewOperator = ({ intl, language, saveOperator, onSubmit }) => {
  const [formInitialState] = useState({
    name: '',
    details: '',
    type: '',
    address: '',
    website: '',
    country: '',
    fmus: []
  });
  const [certifications, setCertifications] = useState({});
  const [countryOptions, setCountryOptions] = useState([]);
  const [countryLoading, setCountryLoading] = useState(true);
  const [fmusOptions, setFmusOptions] = useState([]);
  const [fmusLoading, setFmusLoading] = useState(true);

  useEffect(() => {
    getCountries();
  }, []);

  const onChangeCertifications = (value) => {
    setCertifications({ ...certifications, ...value });
  };

  const handleSubmit = ({ form }) => {
    return saveOperator({ body: HELPERS_REGISTER.getBody(form) })
      .then(() => {
        if (onSubmit) onSubmit();
      });
  };

  const getCountries = async () => {
    setCountryLoading(true);
    const countries = await HELPERS_REGISTER.getCountries(language);
    setCountryOptions(countries);
    setCountryLoading(false);
  };

  const getFmus = async (countryId) => {
    setFmusLoading(true);
    const fmus = await HELPERS_REGISTER.getOperatorFmus(countryId, language);
    setFmusOptions(fmus);
    setFmusLoading(false);
  };

  return (
    <div className="c-section">
      <div className="l-container">
        <FormProvider initialValues={formInitialState} onSubmit={handleSubmit}>
          {({ form, submitted, setFormValues }) => (<>
            {!submitted && (
              <Form>
                <fieldset className="c-field-container">
                  {/* Operator name */}
                  <Field
                    validations={['required']}
                    className="-fluid"
                    properties={{
                      name: 'name',
                      label: intl.formatMessage({ id: 'signup.operators.form.field.name' }),
                      required: true
                    }}
                  >
                    {Input}
                  </Field>

                  {/* Operator description */}
                  <Field
                    className="-fluid"
                    properties={{
                      name: 'details',
                      label: intl.formatMessage({ id: 'signup.operators.form.field.details' }),
                      rows: '6'
                    }}
                  >
                    {Textarea}
                  </Field>

                  {/* Operator type */}
                  <Field
                    validations={['required']}
                    className="-fluid"
                    options={HELPERS_REGISTER.getOperatorTypes().map(t => ({
                      ...t,
                      label: intl.formatMessage({ id: t.label })
                    }))}
                    properties={{
                      name: 'operator_type',
                      label: intl.formatMessage({ id: 'signup.operators.form.field.operator_type' }),
                      required: true,
                      instanceId: 'select.operator_type',
                      placeholder: ''
                    }}
                  >
                    {Select}
                  </Field>

                  {/* Country */}
                  <Field
                    onChange={(value) => {
                      setFormValues({
                        country: value,
                        fmus: []
                      });
                      getFmus(value);
                    }}
                    validations={['required']}
                    className="-fluid"
                    options={countryOptions}
                    properties={{
                      name: 'country',
                      label: intl.formatMessage({ id: 'signup.operators.form.field.country' }),
                      required: true,
                      instanceId: 'select.country',
                      placeholder: ''
                    }}
                  >
                    {Select}
                  </Field>

                  {!!form.country && (
                    <Spinner isLoading={fmusLoading} />
                  )}

                  {/* FMUs */}
                  {!!fmusOptions.length && (
                    <Field
                      className="-fluid"
                      options={fmusOptions}
                      properties={{
                        name: 'fmus',
                        label: 'FMUs',
                        instanceId: 'select.fmus',
                        isMulti: true,
                        value: form.fmus,
                        placeholder: ''
                      }}
                    >
                      {Select}
                    </Field>
                  )}

                  {/* Address */}
                  <Field
                    className="-fluid"
                    properties={{
                      name: 'address',
                      label: intl.formatMessage({ id: 'signup.operators.form.field.address' })
                    }}
                  >
                    {Input}
                  </Field>

                  {/* Website */}
                  <Field
                    validations={['url']}
                    className="-fluid"
                    properties={{
                      name: 'website',
                      label: intl.formatMessage({ id: 'signup.operators.form.field.website' }),
                    }}
                  >
                    {Input}
                  </Field>

                  {/* Logo */}
                  <Field
                    className="-fluid"
                    properties={{
                      name: 'logo',
                      label: intl.formatMessage({ id: 'signup.operators.form.field.logo' }),
                    }}
                  >
                    {FileImage}
                  </Field>
                </fieldset>

                <ul className="c-field-buttons">
                  <li>
                    <SubmitButton>
                      {intl.formatMessage({ id: 'create.operator' })}
                    </SubmitButton>
                  </li>
                </ul>
              </Form>
            )}

            {submitted && (
              <div className="c-form">
                <h2 className="c-title">
                  {intl.formatMessage({ id: 'thankyou' })}
                </h2>

                <p>
                  {intl.formatMessage({ id: 'wait-for-approval' })}
                </p>

                <ul className="c-field-buttons">
                  <li>
                    <Link href="/operators" className="card-link c-button -primary -fullwidth">

                      {intl.formatMessage({ id: 'operators' })}

                    </Link>
                  </li>
                  <li>
                    <Link href="/observations" className="card-link c-button -primary -fullwidth">

                      {intl.formatMessage({ id: 'observations' })}

                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </>)}
        </FormProvider>
      </div>
    </div>
  );
};

NewOperator.propTypes = {
  saveOperator: PropTypes.func,
  onSubmit: PropTypes.func
};

export default injectIntl(connect(
  state => ({
    language: state.language
  }),
  { saveOperator }
)(NewOperator));
