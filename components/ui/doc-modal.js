import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperator } from 'modules/operators-detail';

// Services
import modal from 'services/modal';
import DocumentsService from 'services/documentsService';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import File from 'components/form/File';

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
      submitting: false
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    // Services
    this.documentsService = new DocumentsService({
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
    this.setState({ form }, () => {
      console.info(this.state.form);
    });
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
        const { id, title } = this.props;
        // Start the submitting
        this.setState({ submitting: true });

        this.documentsService.saveDocument({
          type: 'POST',
          body: {
            data: {
              type: 'documents',
              attributes: {
                'document-type': 'Report',
                name: title,
                attachment: this.state.form.file
              },
              relationships: {
                attacheable: {
                  data: {
                    id,
                    type: 'operator-documents',
                    'start-date': this.state.form.date
                  }
                }
              }
            }
          }
        })
          .then(() => {
            this.setState({ submitting: false });
            modal.toggleModal(false);
          })
          .catch((err) => {
            console.error(err);
            this.setState({ submitting: false });
          });
      } else {
        // toastr.error('Error', 'Fill all the required fields');
      }
    }, 0);
  }


  render() {
    const { submitting } = this.state;
    const submittingClassName = classnames({
      '-submitting': submitting
    });

    return (
      <div className="c-login">
        <h2 className="c-title -huge">
          Upload file
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
  id: PropTypes.string,
  title: PropTypes.string,
  status: PropTypes.string,
  user: PropTypes.object,
  documents: PropTypes.array,
  onChange: PropTypes.func
};


export default withRedux(
  store,
  null,
  { getOperator }
)(DocModal);
