import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl } from 'react-intl';

// Redux
import { resetPassword, login } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Components
import Spinner from 'components/ui/spinner';
import Field from 'components/form/Field';
import Input from 'components/form/Input';

import { FormElements } from 'utils/form';

class ResetPasswordForm extends React.Component {
  constructor(props) {
    super(props);

    this.formElements = new FormElements();
    this.state = {
      form: {
        password: '',
        passwordConfirmation: '',
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

    const { form } = this.state;

    // Validate the form
    this.formElements.validate(form);

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = this.formElements.isValid(form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        const attributes = {
          reset_password_token: this.props.token,
          password: form.password,
          password_confirmation: form.passwordConfirmation
        }

        // Save data
        resetPassword(attributes)
          .then((user) => {
            toastr.success(
              this.props.intl.formatMessage({ id: 'operators.edit.toaster.success.title' }),
              this.props.intl.formatMessage({ id: 'Password changed successfully' })
            );
            this.setState({
              submitting: false,
              submitted: true,
            });
            return login({
              body: { auth: { email: user.email, password: attributes.password } }
            }).then(() => { window.location.href = '/'; })
          })
          .catch((errors) => {
            this.setState({ submitting: false });
            console.error(errors);

            try {
              errors.forEach(er => {
                toastr.error(this.props.intl.formatMessage({ id: 'Error' }), `${er.title} - ${er.detail}`);
              });
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
    const { submitting } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-section">
        <Spinner isLoading={submitting} className="-light -fixed" />

        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            <Field
              ref={(c) => { if (c) this.formElements.elements.password = c; }}
              onChange={value => this.onChange({ password: value })}
              className="-fluid"
              properties={{
                name: 'password',
                autoComplete: 'new-password',
                label: this.props.intl.formatMessage({ id: 'New Password' }),
                type: 'password',
                required: false,
                value: this.state.form.password
              }}
            >
              {Input}
            </Field>

            <Field
              ref={(c) => { if (c) this.formElements.elements.passwordConfirmation = c; }}
              onChange={value => this.onChange({ passwordConfirmation: value })}
              validations={[
                {
                  type: 'isEqual',
                  condition: this.state.form.password,
                  message: this.props.intl.formatMessage({ id: 'The field should be equal to password' })
                }
              ]}
              className="-fluid"
              properties={{
                name: 'passwordConfirmation',
                autoComplete: 'new-password',
                label: this.props.intl.formatMessage({ id: 'Confirm New Password' }),
                type: 'password',
                required: false,
                value: this.state.form.passwordConfirmation
              }}
            >
              {Input}
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
                {this.props.intl.formatMessage({ id: 'Change Password' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

ResetPasswordForm.propTypes = {
  token: PropTypes.string,
  intl: PropTypes.object.isRequired
};

export default injectIntl(ResetPasswordForm);
