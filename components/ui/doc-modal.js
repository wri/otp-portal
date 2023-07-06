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
import Select from 'components/form/SelectInput';
import Textarea from 'components/form/Textarea';
import File from 'components/form/File';
import SubmitButton from 'components/form/SubmitButton';
import CancelButton from '../form/CancelButton';

const TYPES = {
  'operator-document-countries': 'operator-document-countries',
  'operator-document-country-histories': 'operator-document-countries',
  'operator-document-fmu-histories': 'operator-document-fmus',
};

class DocModal extends React.Component {
  constructor(props) {
    super(props);
    const { startDate, endDate, url, reason, source, sourceInfo } = props;

    this.state = {
      formInitialState: {
        startDate:
          startDate &&
          startDate !== '1970/01/01' &&
          startDate.replace(/\//g, '-'),
        expireDate:
          endDate && endDate !== '1970/01/01' && endDate.replace(/\//g, '-'),
        file: {},
        url,
        reason,
        source: source || 'company',
        sourceInfo,
      }
    };

    // Services
    this.documentationService = new DocumentationService({
      authorization: props.user.token,
    });
  }

  handleSubmit = ({ form }) => {
    const { type, docId, onChange } = this.props;

    return this.documentationService
      .saveDocument({
        url: `${TYPES[type]}/${docId}`,
        body: this.getBody(form, 'patch'),
      })
      .then(() => {
        onChange && onChange();
        modal.toggleModal(false);
      });
  }

  /**
   * HELPERS
   * - getBody
   */
  getBody(form, request) {
    const { type, docId, requiredDocId, properties, fmu } = this.props;
    const { id: propertyId, type: typeDoc } = properties;

    return {
      data: {
        id: docId,
        type: TYPES[type],
        attributes: {
          'start-date': form.startDate,
          'expire-date': form.expireDate,
          'source-type': form.source,
          'source-info':
            form.source === 'other_source'
              ? form.sourceInfo
              : null,
          ...(form.file.base64 && {
            attachment: form.file.base64,
          }),
          ...(form.reason && {
            reason: form.reason,
          }),
          ...(fmu && request === 'post' && { 'fmu-id': fmu.id }),
          ...(typeDoc === 'operator' && {
            'operator-id': propertyId,
            'required-operator-document-id': requiredDocId,
          }),
          ...(typeDoc === 'government' && {
            'country-id': propertyId,
            'required-gov-document-id': requiredDocId,
          }),
        },
      },
    };
  }

  render() {
    const { intl, title, url, notRequired } = this.props;

    return (
      <div className="c-login">
        <h2 className="c-title -extrabig">{title}</h2>

        <FormProvider initialValues={this.state.formInitialState} onSubmit={this.handleSubmit}>
          {({ form }) => (
            <Form>
              <fieldset className="c-field-container">
                <div className="l-row row">
                  <div className="columns medium-6 small-12">
                    {/* DATE */}
                    <Field
                      validations={['required']}
                      className="-fluid"
                      properties={{
                        name: 'startDate',
                        label: notRequired
                          ? intl.formatMessage({ id: 'start_date' })
                          : intl.formatMessage({ id: 'doc.start_date' }),
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
                        label: notRequired
                          ? intl.formatMessage({ id: 'expire_date' })
                          : intl.formatMessage({
                            id: 'doc.expiry_date',
                          }),
                        type: 'date'
                      }}
                    >
                      {Input}
                    </Field>
                  </div>
                </div>

                {!notRequired && (
                  <div className="l-row row">
                    <div className="columns small-12">
                      <Field
                        validations={['required']}
                        className="-fluid"
                        options={[
                          {
                            label: intl.formatMessage({ id: 'company' }),
                            value: 'company',
                          },
                          {
                            label: intl.formatMessage({
                              id: 'forest_atlas',
                            }),
                            value: 'forest_atlas',
                          },
                          {
                            label: intl.formatMessage({
                              id: 'other_source',
                            }),
                            value: 'other_source',
                          },
                        ]}
                        properties={{
                          name: 'source',
                          label: intl.formatMessage({ id: 'source' }),
                          required: true
                        }}
                      >
                        {Select}
                      </Field>
                    </div>
                    {form.source === 'other_source' && (
                      <div className="columns small-12">
                        <Field
                          validations={['required']}
                          className="-fluid"
                          properties={{
                            name: 'sourceInfo',
                            label: intl.formatMessage({
                              id: 'source-info',
                            }),
                            required: true
                          }}
                        >
                          {Input}
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                {/* DOCUMENT */}
                {(!notRequired ||
                  (form.file.base64 && !form.reason)) && (
                    <div className="l-row row">
                      <div className="columns small-12">
                        <Field
                          validations={!url ? ['required'] : []}
                          className="-fluid"
                          properties={{
                            name: 'file',
                            label: intl.formatMessage({ id: 'file' }),
                            required: !url,
                            default: { name: url }
                          }}
                        >
                          {File}
                        </Field>
                      </div>
                    </div>
                  )}

                {/* REASON */}
                {(notRequired ||
                  (form.reason && !form.file.base64)) && (
                    <div className="l-row row">
                      <div className="columns small-12">
                        <Field
                          className="-fluid"
                          validations={['required']}
                          properties={{
                            name: 'reason',
                            label: intl.formatMessage({
                              id: 'why-is-it-not-required',
                            }),
                            required: true,
                            rows: '6'
                          }}
                        >
                          {Textarea}
                        </Field>
                      </div>
                    </div>
                  )}
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
          )}
        </FormProvider>
      </div>
    );
  }
}

DocModal.propTypes = {
  id: PropTypes.string,
  docId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  status: PropTypes.string,
  url: PropTypes.string,
  reason: PropTypes.string,
  source: PropTypes.string,
  sourceInfo: PropTypes.string,
  title: PropTypes.string,
  requiredDocId: PropTypes.string,
  type: PropTypes.string,
  properties: PropTypes.object,
  notRequired: PropTypes.bool,
  fmu: PropTypes.object,
  user: PropTypes.object,
  onChange: PropTypes.func,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(connect(null, { getOperator })(DocModal));
