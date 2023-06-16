import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';

// Redux
import { connect } from 'react-redux';

// Intl
import { injectIntl } from 'react-intl';

import { login } from 'modules/user';
import { toastr } from 'react-redux-toastr';

// Services
import modal from 'services/modal';

// Components
import Spinner from 'components/ui/spinner';
import ForgotPassword from 'components/ui/forgot-password';
import Field from 'components/form/Field';
import Input from 'components/form/Input';

import { FormElements } from 'utils/form';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        email: '',
        password: ''
      },
      submitting: false
    };

    this.formElements = new FormElements();

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onForgotPasswordClick = this.onForgotPasswordClick.bind(this);
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

    const { intl } = this.props;

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
        login({ body: { auth: this.state.form } })
          .then(() => {
            window.location.reload();
          })
          .catch((errors) => {
            this.setState({ submitting: false });
            console.error(errors);
            try {
              errors.forEach(er =>
                toastr.error(intl.formatMessage({ id: 'Error' }), `${er.title}`)
              );
            } catch (e) {
              toastr.error(intl.formatMessage({ id: 'Error' }), intl.formatMessage({ id: 'Oops! There was an error, try again' }));
            }
          });
      } else {
        toastr.error(intl.formatMessage({ id: 'Error' }), intl.formatMessage({ id: 'Fill all the required fields' }));
      }
    }, 0);
  }

  onForgotPasswordClick() {
    modal.toggleModal(true, {
      children: ForgotPassword
    });
  }

  render() {
    const { intl } = this.props;
    const { submitting } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });
    const closeModal = () => { modal.toggleModal(false); };

    return (
      <div className="c-login">

        <Spinner isLoading={submitting} className="-light" />

        <h2 className="c-title -huge">
          {intl.formatMessage({ id: 'login' })}
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
                label: intl.formatMessage({ id: 'login.form.field.email' }),
                type: 'email',
                required: true,
                default: this.state.form.email
              }}
            >
              {Input}
            </Field>

            {/* PASSWORD */}
            <Field
              ref={(c) => { if (c) this.formElements.elements.password = c; }}
              onChange={value => this.onChange({ password: value })}
              validations={['required']}
              className="-fluid"
              properties={{
                name: 'password',
                label: intl.formatMessage({ id: 'login.form.field.password' }),
                type: 'password',
                required: true,
                default: this.state.form.password
              }}
            >
              {Input}
            </Field>
          </fieldset>

          <div className="c-field-extra-actions">
            <p>{intl.formatMessage({ id: 'signin.forgot_password', defaultMessage: 'Did you forget your password?' })}  <button type="button" className="c-link-button" onClick={this.onForgotPasswordClick}>{intl.formatMessage({ id: 'signin.reset_your_password', defaultMessage: 'Reset your password' })}</button></p>
            <p>{intl.formatMessage({ id: 'signin.not_a_member' })} <Link href="/signup"><a onClick={closeModal}>{intl.formatMessage({ id: 'signin.register_now' })}</a></Link></p>
            <p>{intl.formatMessage({ id: 'signin.not_a_producer' })} <Link href="/operators/new"><a onClick={closeModal}>{intl.formatMessage({ id: 'signin.register_producer' })}</a></Link></p>
          </div>

          <ul className="c-field-buttons">
            <li>
              <button
                type="button"
                name="commit"
                className="c-button -primary -expanded"
                onClick={closeModal}
              >
                {intl.formatMessage({ id: 'cancel' })}
              </button>
            </li>
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                {intl.formatMessage({ id: 'login' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

Login.propTypes = {
  intl: PropTypes.object.isRequired
};


export default injectIntl(Login);
