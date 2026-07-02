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
import SubmitButton from '../form/SubmitButton';
import CancelButton from '../form/CancelButton';
import DocModalFileSource, { getSourceAttributes } from 'components/ui/doc-modal-file-source';
import useUser from 'hooks/use-user';

const DocAnnexesModal = ({ title, docId, id, name, startDate, expireDate, url, onChange }) => {
  const intl = useIntl();
  const user = useUser();
  // An existing annex id means we're editing; adding a new annex keeps the
  // submit button enabled.
  const isEditing = !!id;
  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token
  }), [user.token]);

  const getBody = (form) => {
    const usingSource = !!form.source;

    return {
      data: {
        ...(id && { id }),
        type: 'operator-document-annexes', // TODO: Confirm if server side can accommodate -
        attributes: {
          name: form.name,
          'start-date': form.startDate,
          'expire-date': form.expireDate,
          ...getSourceAttributes(form.source),
          ...(!usingSource && form.file.base64 && {
            attachment: form.file.base64,
          }),
        },
        ...(!id && { relationships: {
          "operator-document": {
            data: {
              type: "operator-documents",
              id: docId
            }
          }
        }})
      }
    };
  };

  const handleSubmit = ({ form }) => {
    const body = getBody(form);
    const action = !!id ? documentationService.editAnnex({ id, body }) : documentationService.addAnnex({ body });

    return action.then(() => {
        onChange && onChange();
        modal.toggleModal(false);
      });
  };

  const formInitialState = useMemo(() => ({
    startDate:
      startDate &&
      startDate !== '1970/01/01' &&
      startDate.replace(/\//g, '-'),
    expireDate:
      expireDate && expireDate !== '1970/01/01' && expireDate.replace(/\//g, '-'),
    file: {},
    name: name || '',
    url: url || '',
    source: null,
  }), [startDate, expireDate, url, name]);

  return (
    <div className="c-login">
      <h2 className="c-title -extrabig">
        {!id && intl.formatMessage({ id: "annex.form.title", defaultMessage: "Add a document for the annex of {title}" }, { title })}
        {!!id && intl.formatMessage({ id: "annex.edit", defaultMessage: "Edit annex" })}
      </h2>

      <FormProvider initialValues={formInitialState} onSubmit={handleSubmit}>
        {({ form, setFormValues }) => (
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
                <div>
                  <div className="l-row row">
                    <div className="columns small-12">
                      <DocModalFileSource
                        form={form}
                        setFormValues={setFormValues}
                        docId={docId}
                        url={url}
                      />
                    </div>
                  </div>
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
                          label: intl.formatMessage({ id: 'annex.form.expiry_date' }),
                          type: 'date',
                          value: form.expireDate,
                        }}
                      >
                        {Input}
                      </Field>
                    </div>
                  </div>
                </div>
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
          )}
      </FormProvider>
    </div>
  );
};

DocAnnexesModal.propTypes = {
  title: PropTypes.string,
  docId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  startDate: PropTypes.string,
  expireDate: PropTypes.string,
  url: PropTypes.string,
  onChange: PropTypes.func
};

export default connect(
  null,
  { getOperator }
)(DocAnnexesModal);
