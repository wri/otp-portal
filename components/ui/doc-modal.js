import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperator } from 'modules/operators-detail';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import File from 'components/form/File';
import Spinner from 'components/ui/spinner';

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

class DocModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {
        date: '',
        file: ''
      },
      submitting: false,
      errors: []
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Services
    this.documentationService = new DocumentationService({
      authorization: props.user.token
    });
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
        const { type } = this.props;

        // Start the submitting
        this.setState({ submitting: true });

        this.documentationService.saveDocument({
          url: type,
          type: 'POST',
          body: this.getBody()
        })
          .then(() => {
            this.setState({ submitting: false, errors: [] });
            this.props.onChange && this.props.onChange();
            modal.toggleModal(false);
          })
          .catch((err) => {
            console.error(err);
            this.setState({ submitting: false, errors: err });
          });
      } else {
        // toastr.error('Error', 'Fill all the required fields');
      }
    }, 0);
  }


  /**
   * HELPERS
   * - getBody
  */
  getBody() {
    const { requiredDocId, type, operatorId, fmu } = this.props;

    return {
      data: {
        type,
        attributes: {
          current: true,
          'operator-id': operatorId,
          'required-operator-document-id': requiredDocId,
          'start-date': this.state.form.date,
          attachment: this.state.form.file,
          ...fmu && { 'fmu-id': fmu.id }
        }
      }
    };
  }


  render() {
    const { submitting, errors } = this.state;
    const { title } = this.props;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-login">
        <Spinner isLoading={submitting} className="-light" />

        <h2 className="c-title -extrabig">
          {title}
        </h2>

        <form className="c-form" onSubmit={this.onSubmit} noValidate>
          <fieldset className="c-field-container">
            {/* DATE */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.date = c; }}
              onChange={value => this.onChange({ date: value })}
              validations={['required']}
              className="-fluid"
              properties={{
                name: 'date',
                label: 'Date',
                type: 'date',
                required: true,
                default: this.state.form.email
              }}
            >
              {Input}
            </Field>

            {/* DOCUMENT */}
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.file = c; }}
              onChange={value => this.onChange({ file: value })}
              validations={['required']}
              className="-fluid"
              properties={{
                name: 'file',
                label: 'File',
                required: true,
                default: this.state.form.file
              }}
            >
              {File}
            </Field>
          </fieldset>

          {!!errors.length &&
            errors.map(e => e.title)
          }

          <ul className="c-field-buttons">
            <li>
              <button
                type="button"
                name="commit"
                className="c-button -primary -expanded"
                onClick={() => modal.toggleModal(false)}
              >
                Cancel
              </button>
            </li>
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                Upload file
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

DocModal.propTypes = {
  title: PropTypes.string,
  requiredDocId: PropTypes.string,
  type: PropTypes.string,
  operatorId: PropTypes.string,
  fmu: PropTypes.object,
  user: PropTypes.object,
  onChange: PropTypes.func
};


export default withRedux(
  store,
  null,
  { getOperator }
)(DocModal);