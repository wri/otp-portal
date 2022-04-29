import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Redux
import { connect } from 'react-redux';
import { updateUserProfile } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Components
import Spinner from 'components/ui/spinner';
import Field from 'components/form/Field';
import Input from 'components/form/Input';

import { FormElements } from 'utils/form';

class UserEditForm extends React.Component {
  constructor(props) {
    super(props);

    const { userProfile } = props;

    this.formElements = new FormElements();
    this.state = {
      form: {
        name: userProfile.name,
        password: '',
        passwordConfirmation: '',
        currentPassword: ''
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
          name: form.name,
          password: form.password,
          'password-confirmation': form.passwordConfirmation,
          'current-password': form.password && form.password.length && form.currentPassword
        }

        // Save data
        this.props
            .updateUserProfile({ attributes })
            .then(() => {
              toastr.success(
                this.props.intl.formatMessage({ id: 'operators.edit.toaster.success.title' }),
                this.props.intl.formatMessage({ id: 'operators.edit.toaster.success.content' })
              );
              this.setState({
                submitting: false,
                submitted: true,
              });
              // total profanity and wrong way, but otherwise I would have to properly refactor the whole app
              this.formElements.elements.password.child.setValue('');
              this.formElements.elements.passwordConfirmation.child.setValue('');
              if (this.formElements.elements.currentPassword) {
                this.formElements.elements.currentPassword.child.setValue('');
              }
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
    const { submitting } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-section">
        <Spinner isLoading={submitting} className="-light -fixed" />

        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'Personal Information' })}
            </h2>

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
          </fieldset>

          <fieldset className="c-field-container">
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'Update Password' })}
            </h2>

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
                default: this.state.form.password
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
                  condition: this.state.form.password
                }
              ]}
              className="-fluid"
              properties={{
                name: 'passwordConfirmation',
                autoComplete: 'new-password',
                label: this.props.intl.formatMessage({ id: 'Confirm New Password' }),
                type: 'password',
                required: false,
                default: this.state.form.passwordConfirmation
              }}
            >
              {Input}
            </Field>

            {this.state.form.password && this.state.form.password.length && (
              <Field
                ref={(c) => { if (c) this.formElements.elements.currentPassword = c; }}
                onChange={value => this.onChange({ currentPassword: value })}
                className="-fluid"
                hint={this.props.intl.formatMessage({ id: 'We need your current password to confirm your changes' })}
                properties={{
                  name: 'currentPassword',
                  autoComplete: 'current-password',
                  label: this.props.intl.formatMessage({ id: 'Current Password' }),
                  type: 'password',
                  required: this.state.form.password && this.state.form.password.length,
                  default: this.state.form.currentPassword
                }}
              >
                {Input}
              </Field>
            )}
          </fieldset>

          <ul className="c-field-buttons">
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                {this.props.intl.formatMessage({ id: 'Update' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

UserEditForm.propTypes = {
  userProfile: PropTypes.object,
  updateUserProfile: PropTypes.func,
  onSubmit: PropTypes.func,
  intl: intlShape.isRequired
};


export default injectIntl(connect(
  null,
  { updateUserProfile }
)(UserEditForm));
