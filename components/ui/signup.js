import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import { connect } from 'react-redux';
import { signup } from 'modules/user';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import FileImage from 'components/form/FileImage';
import CheckboxGroup from 'components/form/CheckboxGroup';
import Select from 'components/form/SelectInput';

// Utils
import { HELPERS_REGISTER } from 'utils/signup';

// Constants
const FORM_ELEMENTS = {
  elements: {
  },
  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  },
  isValid() {
    const elements = this.elements;
    const valid = Object.keys(elements)
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
};

class Signup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        name: '',
        type: '',
        address: '',
        website: '',
        country: '',
        fmus: []
      },
      fmusOptions: [],
      submitting: false
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
    FORM_ELEMENTS.validate(this.state.form);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        // Save data
        this.props.signup({ body: HELPERS_REGISTER.getBody(this.state.form) })
          .then(() => {
            this.setState({ submitting: false });
            // if (this.props.onSubmit) this.props.onSubmit();
          })
          .catch((err) => {
            this.setState({ submitting: false });
            // toastr.error('Error', `Oops! There was an error, try again`);
            console.error(err);
          });
      } else {
        // toastr.error('Error', 'Fill all the required fields');
      }
    }, 0);
  }

  /**
   * HELPERS
   * - getFmus
   *
  */
  async getFmus(countryId) {
    const fmus = await HELPERS_REGISTER.getOperatorFmus(countryId);
    this.setState({
      fmusOptions: fmus
    });
  }

  render() {
    const { submitting } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-login">
        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            <h2 className="c-title -huge">
              Operator info
            </h2>

            {/* Operator name */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.name = c; }}
              onChange={value => this.onChange({ name: value })}
              validations={['required']}
              className="-fluid"
              properties={{
                name: 'name',
                label: 'Operator\'s name',
                required: true,
                default: this.state.form.name
              }}
            >
              {Input}
            </Field>

            {/* Operator type */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.operator_type = c; }}
              onChange={value => this.onChange({ operator_type: value })}
              validations={['required']}
              className="-fluid"
              options={HELPERS_REGISTER.getOperatorTypes()}
              properties={{
                name: 'operator_type',
                label: 'Operator\'s type',
                required: true,
                instanceId: 'select.operator_type',
                default: this.state.form.operator_type
              }}
            >
              {Select}
            </Field>

            {/* Certification */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.certification = c; }}
              onChange={value => this.onChange({ certification: value })}
              validations={['required']}
              className="-fluid"
              options={HELPERS_REGISTER.getOperatorCertifications()}
              properties={{
                name: 'certification',
                label: 'Certification',
                required: true,
                instanceId: 'select.certification',
                default: this.state.form.certification
              }}
            >
              {Select}
            </Field>

            {/* Website */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.website = c; }}
              onChange={value => this.onChange({ website: value })}
              validations={['url']}
              className="-fluid"
              properties={{
                name: 'website',
                label: 'Website',
                default: this.state.form.website
              }}
            >
              {Input}
            </Field>

            {/* Address */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.address = c; }}
              onChange={value => this.onChange({ address: value })}
              className="-fluid"
              properties={{
                name: 'address',
                label: 'Address',
                default: this.state.form.address
              }}
            >
              {Input}
            </Field>

            {/* Logo */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.logo = c; }}
              onChange={value => this.onChange({ logo: value })}
              className="-fluid"
              properties={{
                name: 'logo',
                label: 'Logo',
                default: this.state.form.logo
              }}
            >
              {FileImage}
            </Field>

          </fieldset>

          <fieldset className="c-field-container">
            <h2 className="c-title -huge">
              Forest Management Units (FMUs)
            </h2>

            {/* Country */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.country = c; }}
              onChange={(value) => {
                this.onChange({ country: value });
                this.getFmus(value);
              }}
              validations={['required']}
              className="-fluid"
              loadOptions={HELPERS_REGISTER.getCountries}
              properties={{
                name: 'country',
                label: 'Country',
                required: true,
                instanceId: 'select.country',
                default: this.state.form.country
              }}
            >
              {Select}
            </Field>


            {/* FMUs */}
            {!!this.state.fmusOptions.length &&
              <Field
                ref={(c) => { if (c) FORM_ELEMENTS.elements.fmus = c; }}
                onChange={value => this.onChange({ fmus: value })}
                className="-fluid"
                validations={['required']}
                grid={{
                  small: 12,
                  medium: 4,
                  large: 4
                }}
                options={this.state.fmusOptions}
                properties={{
                  name: 'fmus',
                  label: 'FMUs',
                  required: true,
                  default: this.state.form.fmus
                }}
              >
                {CheckboxGroup}
              </Field>
            }
          </fieldset>

          <ul className="c-field-buttons">
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                Sign up
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

Signup.propTypes = {
  signup: PropTypes.func
};


export default connect(
  null,
  { signup }
)(Signup);
