import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import { connect } from 'react-redux';
import { getOperator } from 'modules/operators-detail';

// Intl
import { injectIntl, intlShape } from 'react-intl';


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
        startDate: '',
        expireDate: '',
        file: '',
        reason: '',
        link: '',
        units: '',
        value: '',
        files: ['']
      },
      submitting: false,
      errors: []
    };

    // Bindings
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeFiles = this.onChangeFiles.bind(this);
    this.onAddFiles = this.onAddFiles.bind(this);

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

  onChangeFiles(index, value) {
    const files = this.state.form.files.slice(0);
    files[index] = value;

    const form = Object.assign({}, this.state.form, { files });
    this.setState({ form });
  }

  onAddFiles() {
    const files = this.state.form.files.slice(0);
    if (files[files.length - 1]) {
      const form = Object.assign({}, this.state.form, { files: [...files, ''] });
      this.setState({ form });
    }
  }

  onSubmit(e) {
    e && e.preventDefault();

    // Validate the form
    FORM_ELEMENTS.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        const { type, docType } = this.props;

        // Start the submitting
        this.setState({ submitting: true });

        this.documentationService.saveDocument({
          url: type,
          type: 'POST',
          body: this.getBody()
        })
          .then(({ data }) => {
            if (docType === 'file') {
              const promises = this.state.form.files.map(file => this.documentationService.saveGovFiles({
                body: this.getFilesBody(data.id, file)
              }));

              Promise.all(promises)
              .then(() => {
                this.setState({ submitting: false, errors: [] });
                this.props.onChange && this.props.onChange();
                modal.toggleModal(false);
              });
            } else {
              this.setState({ submitting: false, errors: [] });
              this.props.onChange && this.props.onChange();
              modal.toggleModal(false);
            }
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
    const { requiredDocId, type, docType } = this.props;

    return {
      data: {
        type,
        attributes: {
          current: true,
          'start-date': this.state.form.startDate,
          'expire-date': this.state.form.expireDate,
          'required-gov-document-id': requiredDocId,
          ...docType === 'stats' && {
            value: this.state.form.value,
            units: this.state.form.units
          },
          ...docType === 'link' && {
            link: this.state.form.link
          }
        }
      }
    };
  }

  getFilesBody(id, attachment) {
    return {
      data: {
        type: 'gov-files',
        attributes: {
          attachment,
          'gov-document-id': id
        }
      }
    };
  }


  render() {
    const { submitting, errors } = this.state;
    const { title, docType, notRequired } = this.props;
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

            <div className="l-row row">
              <div className="columns medium-6 small-12">
                {/* DATE */}
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.startDate = c; }}
                  onChange={value => this.onChange({ startDate: value })}
                  validations={['required']}
                  className="-fluid"
                  properties={{
                    name: 'startDate',
                    label: notRequired ?
                      this.props.intl.formatMessage({ id: 'start_date' }) :
                      this.props.intl.formatMessage({ id: 'doc.start_date' }),
                    type: 'date',
                    required: true,
                    default: this.state.form.startDate
                  }}
                >
                  {Input}
                </Field>
              </div>
              <div className="columns medium-6 small-12">
                {/* DATE */}
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.expireDate = c; }}
                  onChange={value => this.onChange({ expireDate: value })}
                  className="-fluid"
                  properties={{
                    name: 'expireDate',
                    label: notRequired ?
                      this.props.intl.formatMessage({ id: 'expire_date' }) :
                      this.props.intl.formatMessage({ id: 'doc.expiry_date' }),
                    type: 'date',
                    default: this.state.form.expireDate
                  }}
                >
                  {Input}
                </Field>
              </div>
            </div>

            {docType === 'stats' &&
              <div className="l-row row">
                <div className="columns small-6">
                  <Field
                    ref={(c) => { if (c) FORM_ELEMENTS.elements.value = c; }}
                    onChange={value => this.onChange({ value })}
                    className="-fluid"
                    validations={['required']}
                    properties={{
                      name: 'value',
                      label: this.props.intl.formatMessage({ id: 'value' }),
                      type: 'number',
                      required: true,
                      default: this.state.form.value
                    }}

                  >
                    {Input}
                  </Field>
                </div>

                <div className="columns small-6">
                  <Field
                    ref={(c) => { if (c) FORM_ELEMENTS.elements.units = c; }}
                    onChange={value => this.onChange({ units: value })}
                    className="-fluid"
                    validations={['required']}
                    properties={{
                      name: 'units',
                      label: this.props.intl.formatMessage({ id: 'units' }),
                      type: 'text',
                      required: true,
                      default: this.state.form.units
                    }}
                  >
                    {Input}
                  </Field>
                </div>
              </div>
            }

            {docType === 'link' &&
              <div className="l-row row">
                <div className="columns small-12">
                  <Field
                    ref={(c) => { if (c) FORM_ELEMENTS.elements.link = c; }}
                    onChange={value => this.onChange({ link: value })}
                    className="-fluid"
                    validations={['required', 'url']}
                    properties={{
                      name: 'link',
                      label: this.props.intl.formatMessage({ id: 'link' }),
                      type: 'text',
                      required: true,
                      default: this.state.form.link
                    }}

                  >
                    {Input}
                  </Field>
                </div>
              </div>
            }

            {docType === 'file' &&
              <div className="l-row row">
                <div className="columns small-12">
                  {this.state.form.files.map((file, i) => (
                    <Field
                      key={i}
                      ref={(c) => { if (c) FORM_ELEMENTS.elements.files = c; }}
                      onChange={value => this.onChangeFiles(i, value)}
                      validations={['required']}
                      className="-fluid"
                      properties={{
                        name: 'file',
                        label: i === 0 && this.props.intl.formatMessage({ id: 'files' }),
                        required: true,
                        default: file
                      }}
                    >
                      {File}
                    </Field>
                  ))}

                  <div
                    style={{
                      padding: 16,
                      background: '#EDECE3'
                    }}
                  >
                    <button
                      type="button"
                      disabled={!this.state.form.files[this.state.form.files.length - 1]}
                      className={classnames({
                        'c-button -primary -small -fullwidth': true,
                        '-disabled': !this.state.form.files[this.state.form.files.length - 1]
                      })}
                      onClick={this.onAddFiles}
                    >
                      Add More
                    </button>
                  </div>
                </div>
              </div>
            }
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
                {this.props.intl.formatMessage({
                  id: 'submit'
                })}
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
  notRequired: PropTypes.bool,
  docType: PropTypes.string,
  user: PropTypes.object,
  onChange: PropTypes.func,
  intl: intlShape.isRequired
};


export default injectIntl(connect(
  null,
  { getOperator }
)(DocModal));
