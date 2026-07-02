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
import File from 'components/form/File';
import HiddenInput from 'components/form/HiddenInput';
import SubmitButton from '../form/SubmitButton';
import CancelButton from '../form/CancelButton';
import DocModalSelectExisting from 'components/ui/doc-modal-select-existing';
import useUser from 'hooks/use-user';

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

const DocAnnexesModal = ({ title, docId, id, name, startDate, expireDate, url, onChange }) => {
  const intl = useIntl();
  const user = useUser();
  // An existing annex id means we're editing; adding a new annex keeps the
  // submit button enabled.
  const isEditing = !!id;
  const [existingSearch, setExistingSearch] = useState('');
  const [existingSelection, setExistingSelection] = useState(null);
  const [fileTab, setFileTab] = useState('upload');

  const operatorIds = useMemo(() => {
    if (user.isAdmin) return [];
    return user.operator_ids || [];
  }, [user.isAdmin, user.operator_ids]);

  const canSelectExisting = operatorIds.length > 0;

  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token
  }), [user.token]);

  const getBody = (form) => {
    const usingSource = fileTab === 'existing' && !!form.source;

    return {
      data: {
        ...(id && { id }),
        type: 'operator-document-annexes', // TODO: Confirm if server side can accommodate -
        attributes: {
          name: form.name,
          'start-date': form.startDate,
          'expire-date': form.expireDate,
          ...(usingSource && form.source.kind === 'document' && {
            'source-operator-document-id': form.source.id,
          }),
          ...(usingSource && form.source.kind === 'annex' && {
            'source-annex-id': form.source.id,
          }),
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

          const showTabs = canSelectExisting;
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
                        <div className="c-field-row">
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
                            className="c-doc-modal-select-existing__source-field"
                            validations={['required']}
                            properties={{ name: 'source' }}
                          >
                            {HiddenInput}
                          </Field>
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
