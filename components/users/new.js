import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { saveUser } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Next components
import Link from 'next/link';

// Components
import Spinner from 'components/ui/spinner';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Select from 'components/form/SelectInput';
import Checkbox from 'components/form/Checkbox';
import RadioGroup from 'components/form/RadioGroup';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';
import { FormElements } from 'utils/form';

class UserNewForm extends React.Component {
  constructor(props) {
    super(props);

    this.formElements = new FormElements();
    this.state = {
      form: {
        name: '',
        email: '',
        operator_id: '',
        country_id: '',
        password: '',
        password_confirmation: '',
        permissions_request: 'operator',
        agree: false
      },
      submitting: false,
      submitted: false
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
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

    // Validate the form
    this.formElements.validate(this.state.form);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = this.formElements.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        const body = {
          user: {
            ...this.state.form
          }
        };
        if (this.state.form.permissions_request === 'government') {
          delete body.user.operator_id;
        }

        // Save data
        this.props.saveUser({ body })
            .then(() => {
              this.setState({ submitting: false, submitted: true });
              if (this.props.onSubmit) this.props.onSubmit();
            })
            .catch((errors) => {
              this.setState({ submitting: false });
              console.error(errors);

              try {
                errors.forEach(er =>
                  toastr.error(this.props.intl.formatMessage({ id: 'Error' }), `${er.title} - ${er.detail}`)
                );
              } catch (e) {
                toastr.error(this.props.intl.formatMessage({ id: 'Error' }), this.props.intl.formatMessage({ id: 'Oops! There was an error, try again' }));
              }
            });
      } else {
        toastr.error(this.props.intl.formatMessage({ id: 'Error' }), this.props.intl.formatMessage({ id: 'Fill all the required fields' }));
      }
    }, 0);
  }

  render() {
    const { submitting, submitted } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-section">
        <Spinner isLoading={submitting} className="-light -fixed" />

        {!submitted && (
          <form className="c-form" onSubmit={this.onSubmit} noValidate>
            <fieldset className="c-field-container">
              {/* Permission request */}
              <Field
                ref={(c) => { { if (c) this.formElements.elements.permissions_request = c; } }}
                onChange={value => this.onChange({ permissions_request: value })}
                validations={['required']}
                className="-fluid"
                options={[
                  { label: this.props.intl.formatMessage({ id: 'operator' }), value: 'operator' },
                  { label: this.props.intl.formatMessage({ id: 'government' }), value: 'government' }
                ]}
                hint={this.props.intl.formatMessage({ id: 'signup.user.form.field.permissions_request.hint' })}
                properties={{
                  name: 'permissions_request',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.permissions_request' }),
                  required: true,
                  default: this.state.form.permissions_request
                }}
              >
                {RadioGroup}
              </Field>

              {/* Countries */}
              <Field
                ref={(c) => { if (c) this.formElements.elements.country_id = c; }}
                onChange={value => this.onChange({ country_id: value, operator_id: null })}
                validations={['required']}
                className="-fluid"
                options={HELPERS_REGISTER.mapToSelectOptions(this.props.countries.data)}
                properties={{
                  name: 'country_id',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.country' }),
                  required: true,
                  instanceId: 'select.country_id',
                  default: this.state.form.country_id,
                  placeholder: this.props.intl.formatMessage({ id: 'select.placeholder' })
                }}
              >
                {Select}
              </Field>

              {/* Operators */}
              {this.state.form.permissions_request === 'operator' && this.state.form.country_id && (
                <Field
                  ref={(c) => { if (c) this.formElements.elements.operator_type = c; }}
                  onChange={value => this.onChange({ operator_id: value })}
                  validations={['required']}
                  className="-fluid"
                  hint={`${this.props.intl.formatMessage({ id: 'signin.not_a_producer' })} <a href="/operators/new">${this.props.intl.formatMessage({ id: 'signin.register_producer' })}</a>`}
                  options={HELPERS_REGISTER.mapToSelectOptions(this.props.operators.data.filter(o => o.country && o.country.id === this.state.form.country_id ))}
                  properties={{
                    name: 'operator_id',
                    label: this.props.intl.formatMessage({ id: 'signup.user.form.field.producer' }),
                    required: true,
                    instanceId: 'select.operator_id',
                    default: this.state.form.operator_id,
                    value: this.state.form.operator_id,
                    placeholder: this.props.intl.formatMessage({ id: 'select.placeholder' })
                  }}
                >
                  {Select}
                </Field>
              )}

              {/* Name */}
              <Field
                ref={(c) => { if (c) this.formElements.elements.name = c; }}
                onChange={value => this.onChange({ name: value })}
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'name',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.name' }),
                  required: true,
                  default: this.state.form.name
                }}
              >
                {Input}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) this.formElements.elements.email = c; }}
                onChange={value => this.onChange({ email: value })}
                validations={['required', 'email']}
                className="-fluid"
                properties={{
                  name: 'email',
                  autoComplete: 'email',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.email' }),
                  required: true,
                  default: this.state.form.email
                }}
              >
                {Input}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) this.formElements.elements.password = c; }}
                onChange={value => this.onChange({ password: value })}
                validations={['required']}
                className="-fluid"
                properties={{
                  name: 'password',
                  autoComplete: 'new-password',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.password' }),
                  type: 'password',
                  required: true,
                  default: this.state.form.password
                }}
              >
                {Input}
              </Field>

              {/* Name */}
              <Field
                ref={(c) => { if (c) this.formElements.elements.password_confirmation = c; }}
                onChange={value => this.onChange({ password_confirmation: value })}
                validations={[
                  'required',
                  {
                    type: 'isEqual',
                    condition: this.state.form.password
                  }
                ]}
                className="-fluid"
                properties={{
                  name: 'password_confirmation',
                  autoComplete: 'new-password',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.password_confirmation' }),
                  type: 'password',
                  required: true,
                  default: this.state.form.password_confirmation
                }}
              >
                {Input}
              </Field>

              <Field
                ref={(c) => { if (c) this.formElements.elements.agree = c; }}
                onChange={value => this.onChange({ agree: value.checked })}
                className="-fluid"
                validations={['required']}
                properties={{
                  required: true,
                  name: 'agree',
                  label: this.props.intl.formatMessage({ id: 'signup.user.form.field.agree' }), // this.props.intl.formatMessage({ id: 'sawmills.modal.active' }),
                  checked: this.state.form.agree
                }}
              >
                {Checkbox}
              </Field>
            </fieldset>

            <ul className="c-field-buttons">
              <li>
                <button
                  type="submit"
                  name="commit"
                  disabled={submitting}
                  className={`c-button -secondary -expanded ${submittingClassName}`}
                >
                  {this.props.intl.formatMessage({ id: 'signup' })}
                </button>
              </li>
            </ul>
          </form>
        )}

        {submitted && (
          <div className="c-form">
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'thankyou' })}
            </h2>

            <p>
              {this.props.intl.formatMessage({ id: 'wait-for-approval' })}
            </p>

            <ul className="c-field-buttons">
              <li>
                <Link href="/operators">
                  <a className="card-link c-button -primary -fullwidth">
                    {this.props.intl.formatMessage({ id: 'operators' })}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/observations">
                  <a className="card-link c-button -primary -fullwidth">
                    {this.props.intl.formatMessage({ id: 'observations' })}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }
}

UserNewForm.propTypes = {
  operators: PropTypes.object,
  countries: PropTypes.object,
  saveUser: PropTypes.func,
  onSubmit: PropTypes.func,
  intl: intlShape.isRequired
};


export default injectIntl(connect(
  state => ({
    operators: state.operators,
    countries: state.countries
  }),
  { saveUser }
)(UserNewForm));
