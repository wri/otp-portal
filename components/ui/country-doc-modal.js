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
import { FormElements } from 'utils/form';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import File from 'components/form/File';
import Spinner from 'components/ui/spinner';

class DocModal extends React.Component {
  constructor(props) {
    super(props);
    const { startDate, endDate, link, value, units } = props;

    this.formElements = new FormElements();
    this.state = {
      form: {
        startDate:
            startDate &&
              startDate !== '1970/01/01' &&
              startDate.replace(/\//g, '-'),
        expireDate: endDate && endDate !== '1970/01/01' && endDate.replace(/\//g, '-'),
        file: {},
        link,
        units,
        value
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
    this.formElements.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = this.formElements.isValid(this.state.form);

      if (valid) {
        const { docId } = this.props;

        // Start the submitting
        this.setState({ submitting: true });

        this.documentationService.saveDocument({
          url: `gov-documents/${docId}`,
          type: 'PATCH',
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
    const { docId, type, docType } = this.props;

    return {
      data: {
        id: docId,
        type,
        attributes: {
          'start-date': this.state.form.startDate,
          'expire-date': this.state.form.expireDate,
          ...(docType === 'file' && this.state.form.file.base64 && {
            attachment: this.state.form.file.base64,
          }),
          ...docType === 'stats' && {
            value: this.state.form.value,
            units: this.state.form.units,
            link: this.state.form.link
          },
          ...docType === 'link' && {
            link: this.state.form.link
          }
        }
      }
    };
  }

  render() {
    const { submitting, errors } = this.state;
    const { title, url, docType } = this.props;
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
                  ref={(c) => { if (c) this.formElements.elements.startDate = c; }}
                  onChange={value => this.onChange({ startDate: value })}
                  validations={['required']}
                  className="-fluid"
                  properties={{
                    name: 'startDate',
                    label: this.props.intl.formatMessage({ id: 'doc.start_date' }),
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
                  ref={(c) => { if (c) this.formElements.elements.expireDate = c; }}
                  onChange={value => this.onChange({ expireDate: value })}
                  className="-fluid"
                  properties={{
                    name: 'expireDate',
                    label: this.props.intl.formatMessage({ id: 'doc.expiry_date' }),
                    type: 'date',
                    default: this.state.form.expireDate
                  }}
                >
                  {Input}
                </Field>
              </div>
            </div>

            {docType === 'stats' &&
              <>
                <div className="l-row row">
                  <div className="columns small-6">
                    <Field
                      ref={(c) => { if (c) this.formElements.elements.value = c; }}
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
                      ref={(c) => { if (c) this.formElements.elements.units = c; }}
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
                <div className="l-row row">
                  <div className="columns small-12">
                    <Field
                      ref={(c) => { if (c) this.formElements.elements.link = c; }}
                      onChange={value => this.onChange({ link: value })}
                      className="-fluid"
                      validations={['url']}
                      properties={{
                        name: 'link',
                        label: this.props.intl.formatMessage({ id: 'source' }),
                        type: 'text',
                        default: this.state.form.link
                      }}

                    >
                      {Input}
                    </Field>
                  </div>
                </div>
              </>
            }

              {docType === 'link' &&
                <div className="l-row row">
                  <div className="columns small-12">
                    <Field
                      ref={(c) => { if (c) this.formElements.elements.link = c; }}
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
                    <Field
                      ref={(c) => { if (c) this.formElements.elements.file = c; }}
                      onChange={value => this.onChange({ file: value })}
                      validations={!url ? ['required'] : []}
                      className="-fluid"
                      properties={{
                        name: 'file',
                        label: this.props.intl.formatMessage({ id: 'file' }),
                        required: !url,
                        default: { name: url }
                      }}
                    >
                      {File}
                    </Field>
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
  docId: PropTypes.number,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  link: PropTypes.string,
  value: PropTypes.string,
  units: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,
  docType: PropTypes.string,
  type: PropTypes.string,
  user: PropTypes.object,
  onChange: PropTypes.func,
  intl: intlShape.isRequired
};


export default injectIntl(connect(
  null,
  { getOperator }
)(DocModal));
