import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useIntl } from 'react-intl';

import Field from 'components/form/Field';
import File from 'components/form/File';
import HiddenInput from 'components/form/HiddenInput';
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

// Builds the attachment source attributes for the request body from the
// currently selected reusable document/annex (empty when uploading a new file).
export const getSourceAttributes = (source) => {
  if (!source) return {};
  if (source.kind === 'document') {
    return { 'source-operator-document-id': source.id };
  }
  if (source.kind === 'annex') {
    return { 'source-annex-id': source.id };
  }
  return {};
};

// Shared file section for the document / annex modals: lets the user either
// upload a new file or reuse an already uploaded document/annex via tabs.
const DocModalFileSource = ({
  form,
  setFormValues,
  docId,
  url,
  allowSelectExisting,
  fileLabelId,
}) => {
  const intl = useIntl();
  const user = useUser();
  const [fileTab, setFileTab] = useState('upload');
  const [existingSearch, setExistingSearch] = useState('');
  const [existingSelection, setExistingSelection] = useState(null);

  const operatorIds = useMemo(() => {
    if (user.isAdmin) return [];
    return user.operator_ids || [];
  }, [user.isAdmin, user.operator_ids]);

  const canSelectExisting = allowSelectExisting && operatorIds.length > 0;
  const onUploadTab = !canSelectExisting || fileTab === 'upload';
  const showOperatorName = operatorIds.length > 1;
  const sourceOrigin = [
    showOperatorName && form.source?.operatorName,
    form.source?.fmuName,
  ]
    .filter(Boolean)
    .join(' - ');

  const setTab = (nextTab) => {
    if (nextTab === fileTab) return;
    setFileTab(nextTab);
    setFormValues({ source: nextTab === 'upload' ? null : existingSelection });
  };

  return (
    <>
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

      {canSelectExisting && (
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
            label: intl.formatMessage({ id: fileLabelId }),
            required: true,
            default: !url ? null : { name: url },
          }}
        >
          {File}
        </Field>
      )}

      {!onUploadTab && (
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

      {form.source?.url && (
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
    </>
  );
};

DocModalFileSource.propTypes = {
  form: PropTypes.shape({
    source: PropTypes.object,
  }).isRequired,
  setFormValues: PropTypes.func.isRequired,
  docId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  url: PropTypes.string,
  allowSelectExisting: PropTypes.bool,
  fileLabelId: PropTypes.string,
};

DocModalFileSource.defaultProps = {
  allowSelectExisting: true,
  fileLabelId: 'file',
};

export default DocModalFileSource;
