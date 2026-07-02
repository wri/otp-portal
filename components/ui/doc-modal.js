import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { getOperator } from 'modules/operators-detail';

// Intl
import { useIntl } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Textarea from 'components/form/Textarea';
import SubmitButton from 'components/form/SubmitButton';
import CancelButton from '../form/CancelButton';
import DocModalFileSource, { getSourceAttributes } from 'components/ui/doc-modal-file-source';
import useUser from 'hooks/use-user';

const TYPES = {
  'operator-document-countries': 'operator-document-countries',
  'operator-document-country-histories': 'operator-document-countries',
  'operator-document-fmu-histories': 'operator-document-fmus',
};

const DocModal = ({ startDate, endDate, url, reason, type, docId, requiredDocId, properties, fmu, onChange, title, notRequired }) => {
  const intl = useIntl();
  const user = useUser();
  // The document already has content (a file or a "not required" reason) when
  // we're editing; when adding a new one we keep the submit button enabled.
  const isEditing = !!url || !!reason;

  const formInitialState = useMemo(() => ({
    startDate:
      startDate &&
      startDate !== '1970/01/01' &&
      startDate.replace(/\//g, '-'),
    expireDate:
      endDate && endDate !== '1970/01/01' && endDate.replace(/\//g, '-'),
    file: {},
    url: url || '',
    reason: reason || '',
    source: null,
  }), [startDate, endDate, url, reason]);

  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token,
  }), [user.token]);

  const getBody = (form, request) => {
    const { id: propertyId, type: typeDoc } = properties;
    const usingSource = !!form.source;

    return {
      data: {
        id: docId,
        type: TYPES[type],
        attributes: {
          'start-date': form.startDate,
          'expire-date': form.expireDate,
          'source-type': 'company',
          ...getSourceAttributes(form.source),
          ...(!usingSource && form.file.base64 && {
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
  };

  const handleSubmit = ({ form }) => {
    return documentationService
      .saveDocument({
        url: `${TYPES[type]}/${docId}`,
        body: getBody(form, 'patch'),
      })
      .then(() => {
        onChange && onChange();
        modal.toggleModal(false);
      });
  };

  return (
    <div className="c-login">
      <h2 className="c-title -extrabig">{title}</h2>

      <FormProvider initialValues={formInitialState} onSubmit={handleSubmit}>
        {({ form, setFormValues }) => {
          const showFileSection = !notRequired || (form.file.base64 && !form.reason);
          const showReasonSection = notRequired || (form.reason && !form.file.base64);

          return (
          <Form>
            <fieldset className="c-field-container">
              {/* DOCUMENT */}
              {showFileSection && (
                <div className="l-row row">
                  <div className="columns small-12">
                    <DocModalFileSource
                      form={form}
                      setFormValues={setFormValues}
                      docId={docId}
                      url={url}
                      allowSelectExisting={!notRequired}
                    />
                  </div>
                </div>
              )}

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
                      required: true,
                      value: form.startDate,
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
                      type: 'date',
                      value: form.expireDate,
                    }}
                  >
                    {Input}
                  </Field>
                </div>
              </div>

              {/* REASON */}
              {showReasonSection && (
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
                <SubmitButton disableIfNoChanges={isEditing} />
              </li>
            </ul>
          </Form>
          );
        }}
      </FormProvider>
    </div>
  );
};

DocModal.propTypes = {
  id: PropTypes.string,
  docId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  status: PropTypes.string,
  url: PropTypes.string,
  reason: PropTypes.string,
  title: PropTypes.string,
  requiredDocId: PropTypes.string,
  type: PropTypes.string,
  properties: PropTypes.object,
  notRequired: PropTypes.bool,
  fmu: PropTypes.object,
  onChange: PropTypes.func,
};

export default connect(null, { getOperator })(DocModal);
