import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { intlShape, injectIntl } from 'react-intl';

import { forgotPassword } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Services
import modal from 'services/modal';

import { FormElements } from 'utils/form';

// Components
import Spinner from 'components/ui/spinner';
import Login from 'components/ui/login';
import Field from 'components/form/Field';
import Input from 'components/form/Input';

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        email: '',
      },
      submitting: false,
      submitted: false
    };

    this.formElements = new FormElements();

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

        // Save data
        forgotPassword(this.state.form.email)
          .then(() => {
            this.setState({ submitting: false, submitted: true });
          })
          .catch((errors) => {
            this.setState({ submitting: false });
            console.error(errors);
            try {
              errors.forEach(er =>
                toastr.error(this.props.intl.formatMessage({ id: 'Error' }), `${er.title}`)
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
      <div className="c-login">

        <Spinner isLoading={submitting} className="-light" />

        {submitted && (
          <>
            <h2 className="c-title -extrabig">
              {this.props.intl.formatMessage({ id: 'forgot-password.submitted', defaultMessage: 'Password reset instruction has been sent to your email.' })}
            </h2>
            <ul className="c-field-buttons">
              <li>
                <button
                  type="button"
                  name="commit"
                  className="c-button -primary -expanded"
                  onClick={() => modal.toggleModal(false)}
                >
                  {this.props.intl.formatMessage({ id: 'close' })}
                </button>
              </li>
            </ul>
          </>
        )}
        {!submitted && (
          <>
            <h2 className="c-title -extrabig">
              {this.props.intl.formatMessage({ id: 'forgot-password.title', defaultMessage: 'Enter your email to reset password' })}
            </h2>

            <form className="c-form" onSubmit={this.onSubmit} noValidate>
              <fieldset className="c-field-container">
                {/* EMAIL */}
                <Field
                  ref={(c) => { if (c) this.formElements.elements.email = c; }}
                  onChange={value => this.onChange({ email: value })}
                  validations={['required', 'email']}
                  className="-fluid"
                  properties={{
                    name: 'email',
                    label: this.props.intl.formatMessage({ id: 'login.form.field.email' }),
                    type: 'email',
                    required: true,
                    default: this.state.form.email
                  }}
                >
                  {Input}
                </Field>
              </fieldset>

              <ul className="c-field-buttons">
                <li>
                  <button
                    type="button"
                    name="commit"
                    className="c-button -primary -expanded"
                    onClick={() => modal.toggleModal(true, { children: Login })}
                  >
                    {this.props.intl.formatMessage({ id: 'cancel' })}
                  </button>
                </li>
                <li>
                  <button
                    type="submit"
                    name="commit"
                    disabled={submitting}
                    className={`c-button -secondary -expanded ${submittingClassName}`}
                  >
                    {this.props.intl.formatMessage({ id: 'Reset Password' })}
                  </button>
                </li>
              </ul>
            </form>
          </>
        )}
      </div>
    );
  }
}

ForgotPassword.propTypes = {
  intl: PropTypes.object.isRequired
};

export default injectIntl(ForgotPassword);
