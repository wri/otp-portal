import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

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
import File from 'components/form/File';
import HiddenInput from 'components/form/HiddenInput';
import SubmitButton from 'components/form/SubmitButton';
import CancelButton from '../form/CancelButton';
import DocModalSelectExisting from 'components/ui/doc-modal-select-existing';
import useUser from 'hooks/use-user';

const TYPES = {
  'operator-document-countries': 'operator-document-countries',
  'operator-document-country-histories': 'operator-document-countries',
  'operator-document-fmu-histories': 'operator-document-fmus',
};

const getFilenameFromUrl = (url) => {
  if (!url) return '';
  try {
    const stripped = url.split('?')[0];
    const parts = stripped.split('/');
    return decodeURIComponent(parts[parts.length - 1] || url);
  } catch (e) {
    return url;
  }
};

const DocModal = ({ startDate, endDate, url, reason, type, docId, requiredDocId, properties, fmu, onChange, title, notRequired }) => {
  const intl = useIntl();
  const user = useUser();
  const [existingSearch, setExistingSearch] = useState('');
  const [existingSelection, setExistingSelection] = useState(null);
  const [fileTab, setFileTab] = useState('upload');

  const operatorIds = useMemo(() => {
    if (user.isAdmin) return [];
    return user.operator_ids || [];
  }, [user.isAdmin, user.operator_ids]);

  const canSelectExisting = !notRequired && operatorIds.length > 0;

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
    const usingSource = fileTab === 'existing' && !!form.source;

    return {
      data: {
        id: docId,
        type: TYPES[type],
        attributes: {
          'start-date': form.startDate,
          'expire-date': form.expireDate,
          'source-type': 'company',
          ...(usingSource && form.source.kind === 'document' && {
            'source-operator-document-id': form.source.id,
          }),
          ...(usingSource && form.source.kind === 'annex' && {
            'source-annex-id': form.source.id,
          }),
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
          const setTab = (nextTab) => {
            if (nextTab === fileTab) return;
            setFileTab(nextTab);
            if (nextTab === 'upload') {
              setFormValues({ source: null });
            } else {
              setFormValues({ source: existingSelection });
            }
          };

          const showFileSection = !notRequired || (form.file.base64 && !form.reason);
          const showReasonSection = notRequired || (form.reason && !form.file.base64);
          const showTabs = canSelectExisting && showFileSection;
          const onUploadTab = !showTabs || fileTab === 'upload';
          const showOperatorName = operatorIds.length > 1;
          const sourceOrigin = [
            showOperatorName && form.source?.operatorName,
            form.source?.fmuName,
          ]
            .filter(Boolean)
            .join(' - ');

          return (
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

              {/* DOCUMENT */}
              {showFileSection && (
                <div className="l-row row">
                  <div className="columns small-12">
                    {url && (
                      <div className="c-doc-modal-current-file">
                        <a
                          className="c-doc-modal-current-file__name"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={getFilenameFromUrl(url)}
                        >
                          {getFilenameFromUrl(url)}
                        </a>
                        <span className="c-doc-modal-current-file__badge">
                          {intl.formatMessage({ id: 'doc-modal.current-file.badge' })}
                        </span>
                      </div>
                    )}

                    {showTabs && (
                      <div className="c-doc-modal-tabs" role="tablist">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={onUploadTab}
                          className={classnames('c-doc-modal-tabs__tab', { '-active': onUploadTab })}
                          onClick={() => setTab('upload')}
                        >
                          {intl.formatMessage({ id: 'doc-modal.tabs.upload-new' })}
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={!onUploadTab}
                          className={classnames('c-doc-modal-tabs__tab', { '-active': !onUploadTab })}
                          onClick={() => setTab('existing')}
                        >
                          {intl.formatMessage({ id: 'doc-modal.tabs.select-existing' })}
                        </button>
                      </div>
                    )}

                    {onUploadTab && (
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
                    )}

                    {showTabs && !onUploadTab && (
                      <>
                        <DocModalSelectExisting
                          operatorIds={operatorIds}
                          excludeDocId={docId}
                          currentSelection={form.source}
                          onSelect={(selection) => {
                            setExistingSelection(selection);
                            setFormValues({ source: selection });
                          }}
                          search={existingSearch}
                          onSearchChange={setExistingSearch}
                        />
                        <Field
                          hidden
                          validations={['required']}
                          properties={{ name: 'source' }}
                        >
                          {HiddenInput}
                        </Field>
                      </>
                    )}
                  </div>
                </div>
              )}

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

            {fileTab === 'existing' && form.source?.url && (
              <div className="c-doc-modal-selected-file">
                <span className="c-doc-modal-selected-file__label">
                  {intl.formatMessage({ id: 'doc-modal.selected-file' })}
                </span>
                <a
                  className="c-doc-modal-selected-file__link"
                  href={form.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={form.source.label}
                >
                  {form.source.label}
                  {sourceOrigin && ` (${sourceOrigin})`}
                </a>
              </div>
            )}

            <ul className="c-field-buttons">
              <li>
                <CancelButton onClick={() => modal.toggleModal(false)} />
              </li>
              <li>
                <SubmitButton disableIfNoChanges />
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
