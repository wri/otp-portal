import React from 'react';
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

class NewOperator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formInitialState: {
        name: '',
        details: '',
        type: '',
        address: '',
        website: '',
        country: '',
        fmus: []
      },
      certifications: {},
      countryOptions: [],
      countryLoading: true,
      fmusOptions: [],
      fmusLoading: true
    };
  }

  componentDidMount() {
    this.getCountries();
  }

  onChangeCertifications(value) {
    const certifications = Object.assign({}, this.state.certifications, value);
    this.setState({ certifications });
  }

  handleSubmit = ({ form }) => {
    return this.props.saveOperator({ body: HELPERS_REGISTER.getBody(form) })
      .then(() => {
        if (this.props.onSubmit) this.props.onSubmit();
      })
  }

  /**
   * HELPERS
   * - getCountries
   * - getFmus
   *
   */
  async getCountries() {
    const { language } = this.props;
    this.setState({ countryLoading: true });
    const countries = await HELPERS_REGISTER.getCountries(language);

    this.setState({
      countryOptions: countries,
      countryLoading: false
    });
  }

  async getFmus(countryId) {
    const { language } = this.props;
    this.setState({ fmusLoading: true });
    const fmus = await HELPERS_REGISTER.getOperatorFmus(countryId, language);
    this.setState({
      fmusOptions: fmus,
      fmusLoading: false
    });
  }

  render() {
    const { intl } = this.props;

    return (
      <div className="c-section">
        <div className="l-container">
          <FormProvider initialValues={this.state.formInitialState} onSubmit={this.handleSubmit}>
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

                  <fieldset className="c-field-container">
                    <h2 className="c-title">
                      {intl.formatMessage({ id: 'forest-management-units' })}
                    </h2>

                    <div className="c-field-row">
                      {/* Country */}
                      <Field
                        onChange={(value) => {
                          setFormValues({
                            country: value,
                            fmus: []
                          });
                          this.getFmus(value);
                        }}
                        validations={['required']}
                        className="-fluid"
                        options={this.state.countryOptions}
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
                        <Spinner isLoading={this.state.fmusLoading} />
                      )}

                      {/* FMUs */}
                      {!!this.state.fmusOptions.length && (
                        <Field
                          className="-fluid"
                          options={this.state.fmusOptions}
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
                    </div>
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
  }
}

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
