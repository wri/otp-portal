import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { getOperator } from 'modules/operators-detail';

// Intl
import { injectIntl } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import File from 'components/form/File';
import SubmitButton from '../form/SubmitButton';
import CancelButton from '../form/CancelButton';

class DocAnnexesModal extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    intl: PropTypes.object.isRequired,
    user: PropTypes.object,
    docId: PropTypes.string,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.documentationService = new DocumentationService({
      authorization: props.user.token
    });
  }

  getBody(form) {
    const { docId } = this.props;

    return {
      data: {
        type: 'operator-document-annexes', // TODO: Confirm if server side can accommodate -countries / -fmu
        attributes: {
          name: form.name,
          'start-date': form.startDate,
          'expire-date': form.expireDate,
          attachment: form.file.base64
        },
        relationships: {
          "operator-document": {
            data: {
              type: "operator-documents",
              id: docId
            }
          }
        }
      }
    };
  }

  handleSubmit = ({ form }) => {
    return this.documentationService.saveAnnex({
      url: 'operator-document-annexes',
      body: this.getBody(form)
    })
      .then(() => {
        this.props.onChange && this.props.onChange();
        modal.toggleModal(false);
      })
  }

  render() {
    const { title, intl } = this.props;

    return (
      <div className="c-login">
        <h2 className="c-title -extrabig">Add a document for the annex of {title}</h2>

        <FormProvider initialValues={{ name: '', startDate: '', expiryDate: '', file: {} }} onSubmit={this.handleSubmit}>
          <Form>
            <fieldset className="c-field-container">
              <div className="c-field-row">
                <Field
                  className="-fluid"
                  validations={['required']}
                  properties={{
                    name: 'name',
                    label: intl.formatMessage({ id: 'annex.form.name' }),
                    required: true,
                    type: 'text',
                  }}
                >
                  {Input}
                </Field>
              </div>
              <div className="c-field-row">
                <div className="l-row row">
                  <div className="columns medium-6 small-12">
                    {/* DATE */}
                    <Field
                      validations={['required']}
                      className="-fluid"
                      properties={{
                        name: 'startDate',
                        label: intl.formatMessage({ id: 'annex.form.start_date' }),
                        type: 'date',
                        required: true
                      }}
                    >
                      {Input}
                    </Field>
                  </div>
                  <div className="columns medium-6 small-12">
                    {/* DATE */}
                    <Field
                      className="-fluid"
                      properties={{
                        name: 'expireDate',
                        label: intl.formatMessage({ id: 'annex.form.expiry_date' }),
                        type: 'date'
                      }}
                    >
                      {Input}
                    </Field>
                  </div>
                </div>
              </div>
              <div>
                <div className="l-row row">
                  <div className="columns small-12">
                    <div className="c-field-row">
                      <Field
                        validations={['required']}
                        className="-fluid"
                        properties={{
                          name: 'file',
                          label: intl.formatMessage({ id: 'file' }),
                          required: true
                        }}
                      >
                        {File}
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            <ul className="c-field-buttons">
              <li>
                <CancelButton onClick={() => modal.toggleModal(false)} />
              </li>
              <li>
                <SubmitButton />
              </li>
            </ul>
          </Form>
        </FormProvider>
      </div>
    );
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user
  }),
  { getOperator }
)(DocAnnexesModal));
