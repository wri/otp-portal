import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import Jsona from 'jsona';
import groupBy from 'lodash/groupBy';

// Intl
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';

import API from 'services/api';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Select from 'components/form/SelectInput';

import { FormElements } from 'utils/form';

const JSONA = new Jsona();

class NewsletterForm extends React.Component {
  constructor(props) {
    super(props);

    this.formElements = new FormElements();
    this.state = {
      form: {
        email: '',
        first_name: '',
        last_name: '',
        job_title: '',
        organization: '',
        country: '',
        city: ''
      },
      countryOptions: []
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.formRef = null;
  }

  componentDidMount() {
    this.loadCountries();
  }

  /**
   * UI EVENTS
   * - onChange
   * - onSubmit
   */
  onChange(value) {
    const form = Object.assign({}, this.state.form, value);
    this.setState({ form });
  }

  onSubmit(e) {
    e && e.preventDefault();

    const { form } = this.state;

    // Validate the form
    this.formElements.validate(form);
    setTimeout(() => {
      if (this.formElements.isValid(form)) {
        this.formRef.submit(); // this does not trigger onSubmit again
      }
    }, 0);
  }

  loadCountries() {
    const { language } = this.props;

    const countriesEnPromise = this.fetchCountries('en');
    const countriesLangPromise = language === 'en' ? countriesEnPromise : this.fetchCountries(language);

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
      .then((countryOptions) => {
        this.setState({
          countryOptions,
        });
      })
      .catch((error) => {
        console.error(error);
      })
  }

  fetchCountries(lang) {
    return API.get('countries', { locale: lang, 'filter[is-active]': 'all' })
      .then((data) => JSONA.deserialize(data))
      .catch((error) => console.error(error));
  }

  render() {
    const { intl } = this.props;
    const { countryOptions } = this.state;

    return (
      <div className="c-section">
        <form ref={(c) => {this.formRef = c}} className="c-form" action="https://connect.wri.org/l/120942/2022-03-31/582yt4" method="post" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            <Field
              ref={(c) => { if (c) this.formElements.elements.first_name = c; }}
              onChange={value => this.onChange({ first_name: value })}
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
              ref={(c) => { if (c) this.formElements.elements.last_name = c; }}
              onChange={value => this.onChange({ last_name: value })}
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
              ref={(c) => { if (c) this.formElements.elements.email = c; }}
              onChange={value => this.onChange({ email: value })}
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
              ref={(c) => { if (c) this.formElements.elements.organization = c; }}
              onChange={value => this.onChange({ organization: value })}
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
              ref={(c) => { if (c) this.formElements.elements.country = c; }}
              onChange={value => this.onChange({ country: value })}
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
              <button
                type="submit"
                className={`c-button -secondary -expanded`}
              >
                {intl.formatMessage({ id: 'signup' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

NewsletterForm.propTypes = {
  intl: intlShape.isRequired,
  language: PropTypes.string,
};

export default injectIntl(connect(
  state => ({
    language: state.language
  })
)(NewsletterForm));
