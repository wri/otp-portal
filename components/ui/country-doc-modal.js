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
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import File from 'components/form/File';
import SubmitButton from 'components/form/SubmitButton';
import Form, { FormProvider } from 'components/form/Form';
import CancelButton from 'components/form/CancelButton';

const DocModal = ({ startDate, endDate, link, value, units, user, docId, type, docType, title, url, onChange }) => {
  const intl = useIntl();
  const formInitialState = useMemo(() => ({
    startDate:
      startDate &&
      startDate !== '1970/01/01' &&
      startDate.replace(/\//g, '-'),
    expireDate: endDate && endDate !== '1970/01/01' && endDate.replace(/\//g, '-'),
    file: {},
    link,
    units,
    value
  }), [startDate, endDate, link, value, units]);

  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token
  }), [user.token]);

  const getBody = (form) => {
    return {
      data: {
        id: docId,
        type,
        attributes: {
          'start-date': form.startDate,
          'expire-date': form.expireDate,
          ...(docType === 'file' && form.file.base64 && {
            attachment: form.file.base64,
          }),
          ...(docType === 'stats' && {
            value: form.value,
            units: form.units,
            link: form.link
          }),
          ...(docType === 'link' && {
            link: form.link
          })
        }
      }
    };
  };

  const handleSubmit = ({ form }) => {
    return documentationService.saveDocument({
      url: `gov-documents/${docId}`,
      body: getBody(form)
    }).then(() => {
      onChange && onChange();
      modal.toggleModal(false);
    });
  };

  return (
    <div className="c-login">
      <h2 className="c-title -extrabig">
        {title}
      </h2>

      <FormProvider initialValues={formInitialState} onSubmit={handleSubmit}>
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
                    label: intl.formatMessage({ id: 'doc.start_date' }),
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
                    label: intl.formatMessage({ id: 'doc.expiry_date' }),
                    type: 'date'
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
                      className="-fluid"
                      validations={['required']}
                      properties={{
                        name: 'value',
                        label: intl.formatMessage({ id: 'value' }),
                        type: 'number',
                        required: true
                      }}
                    >
                      {Input}
                    </Field>
                  </div>

                  <div className="columns small-6">
                    <Field
                      className="-fluid"
                      validations={['required']}
                      properties={{
                        name: 'units',
                        label: intl.formatMessage({ id: 'units' }),
                        type: 'text',
                        required: true
                      }}
                    >
                      {Input}
                    </Field>
                  </div>
                </div>
                <div className="l-row row">
                  <div className="columns small-12">
                    <Field
                      className="-fluid"
                      validations={['url']}
                      properties={{
                        name: 'link',
                        label: intl.formatMessage({ id: 'source' }),
                        type: 'text'
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
                    className="-fluid"
                    validations={['required', 'url']}
                    properties={{
                      name: 'link',
                      label: intl.formatMessage({ id: 'link' }),
                      type: 'text',
                      required: true
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
                    validations={['required']}
                    className="-fluid"
                    properties={{
                      name: 'file',
                      label: intl.formatMessage({ id: 'file' }),
                      required: true,
                      default: !url ? null : { name: url }
                    }}
                  >
                    {File}
                  </Field>
                </div>
              </div>
            }
          </fieldset>

          <ul className="c-field-buttons">
            <li>
              <CancelButton onClick={() => modal.toggleModal(false)} />
            </li>
            <li>
              <SubmitButton>
                {intl.formatMessage({ id: 'submit' })}
              </SubmitButton>
            </li>
          </ul>
        </Form>
      </FormProvider>
    </div>
  );
};

DocModal.propTypes = {
  docId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  onChange: PropTypes.func
};


export default connect(
  null,
  { getOperator }
)(DocModal);
