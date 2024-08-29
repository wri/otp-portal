import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import Jsona from 'jsona';
import groupBy from 'lodash/groupBy';

// Intl
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import API from 'services/api';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Select from 'components/form/SelectInput';

import SubmitButton from '../form/SubmitButton';

const JSONA = new Jsona();

function fetchCountries(lang) {
  return API.get('countries', { locale: lang, 'page[size]': 500, 'filter[is-active]': 'all' })
    .then((data) => JSONA.deserialize(data))
    .catch((error) => console.error(error));
}

const NewsletterForm = ({ language }) => {
  const intl = useIntl();
  const formRef = useRef(null);
  const [loadTime, _setLoadTime] = useState(Date.now());
  const [countryOptions, setCountryOptions] = useState([]);
  const [ipAddress, setIPAddress] = useState('');
  useEffect(() => {
    fetch('https://api.db-ip.com/v2/free/self')
      .then(response => response.json())
      .then(data => setIPAddress(data.ipAddress));
  }, []);

  const loadCountries = () => {
    const countriesEnPromise = fetchCountries('en');
    const countriesLangPromise = language === 'en' ? countriesEnPromise : fetchCountries(language);

    Promise
      .all([countriesEnPromise, countriesLangPromise])
      .then(([countriesEn, countriesLang]) => {
        if (language === 'en') return countriesEn.map(c => ({ label: c.name, value: c.name }));
        const byId = groupBy(countriesLang, 'id');

        return countriesEn.map(c => ({ label: byId[c.id][0].name, value: c.name }));
      })
      .then((cOptions) => {
        return sortBy(cOptions, 'label');
      })
      .then((_countryOptions) => {
        setCountryOptions(_countryOptions);
      })
      .catch((error) => {
        console.error(error);
      })
  }

  useEffect(() => {
    loadCountries();
  }, []);

  const handleSubmit = () => {
    formRef.current['ts-submit'].value = Date.now();
    formRef.current.submit();
    return Promise.resolve();
  }

  const formInitialState = {
    first_name: '',
    last_name: '',
    email: '',
    organization: '',
    country: '',
    address: ''
  }

  return (
    <div className="c-section">
      <div className="l-container">
        <FormProvider initialValues={formInitialState} onSubmit={handleSubmit}>
          <Form ref={formRef} action="https://ortto.wri.org/custom-forms/" method="post">
            <input type="hidden" name="website" value="opentimberportal.org" />
            <input type="hidden" name="form-name" value="Open Timber Portal Newsletter Signup" />
            <input type="hidden" name="list" value="FOR - FGP - NEWSL - Open Timber Portal - LIST" />
            <input type="hidden" name="interests" value="Forests" />
            <input type="hidden" name="preferred_language" value={language} />
            <input type="hidden" name="ip_addr" value={ipAddress} />
            <input type="hidden" name="ts-load" value={loadTime} />
            <input type="hidden" name="ts-submit" value="" />
            <fieldset className="c-field-container">
              <Field
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'first_name',
                  label: intl.formatMessage({ id: 'First Name' }),
                  required: true,
                }}
              >
                {Input}
              </Field>
              <Field
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'last_name',
                  label: intl.formatMessage({ id: 'Last Name' }),
                  required: true,
                }}
              >
                {Input}
              </Field>
              <Field
                className="-fluid address-field"
                properties={{
                  name: 'address',
                  tabIndex: -1,
                  label: intl.formatMessage({ id: 'Address' })
                }}
              >
                {Input}
              </Field>
              <Field
                validations={['required', 'email']}
                className="-fluid"
                properties={{
                  name: 'email',
                  label: intl.formatMessage({ id: 'email' }),
                  required: true,
                }}
              >
                {Input}
              </Field>
              <Field
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'organization',
                  label: intl.formatMessage({ id: 'Organization' }),
                  required: true,
                }}
              >
                {Input}
              </Field>
              <Field
                validations={['required']}
                className="-fluid"
                options={countryOptions}
                properties={{
                  name: 'country',
                  label: intl.formatMessage({ id: 'country' }),
                  instanceId: 'select.country',
                  required: true,
                }}
              >
                {Select}
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
        </FormProvider>
      </div>
    </div>
  );
}

NewsletterForm.propTypes = {
  language: PropTypes.string,
};

export default connect(
  state => ({
    language: state.language
  })
)(NewsletterForm);
