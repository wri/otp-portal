import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { useIntl } from 'react-intl';

// Services
import DocumentationService from 'services/documentationService';
import modal from 'services/modal';

// Components
import { showConfirmModal } from 'components/ui/confirm-modal';
import CountryDocModal from 'components/ui/country-doc-modal';
import useUser from 'hooks/use-user';

const CountryDocCardUpload = (props) => {
  const { status, docType, id, onChange } = props;
  const intl = useIntl();
  const user = useUser();

  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token
  }), [user.token]);

  const triggerAddFile = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: CountryDocModal,
      childrenProps: {
        ...props,
        onChange: () => {
          onChange && onChange();
        }
      }
    });
  };

  const triggerDeleteFile = (e) => {
    e && e.preventDefault();

    showConfirmModal({
      text: intl.formatMessage(
        { id: 'delete.document.text', defaultMessage: 'Are you sure you want to delete document {document}?' }, { document: title }
      ),
      confirmText: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
      onConfirm: ({ onSuccess, onError } = {}) => {
        documentationService.deleteDocument(id, 'gov-documents')
          .then(() => {
            modal.toggleModal(false);
            onSuccess && onSuccess();
            onChange && onChange();
          })
          .catch((err) => {
            onError && onError(
              intl.formatMessage({ id: 'document.delete.error', defaultMessage: 'An error occurred while deleting the document.' })
            );
            Sentry.captureException(err);
            console.error(err);
          });
      }
    })
  };

  const classNames = classnames({
    [`-${status}`]: !!status
  });

  return (
    <div className={`c-doc-card-upload ${classNames}`}>
      {(status === 'doc_valid' || status === 'doc_invalid' || status === 'doc_pending' || status === 'doc_expired') &&
        <ul>
          <li>
            <button onClick={triggerAddFile} className="c-button -small -primary">
              {intl.formatMessage({ id: `update-${docType}` })}
            </button>
          </li>

          <li>
            <button onClick={triggerDeleteFile} className="c-button -small -primary">
              {intl.formatMessage({ id: 'delete' })}
            </button>
          </li>
        </ul>
      }
      {status === 'doc_not_provided' &&
        <ul>
          <li>
            <button onClick={triggerAddFile} className="c-button -small -secondary">
              {intl.formatMessage({ id: `add-${docType}` })}
            </button>
          </li>
        </ul>
      }
    </div>
  );
};

CountryDocCardUpload.propTypes = {
  status: PropTypes.string,
  docType: PropTypes.string,
  id: PropTypes.string,
  onChange: PropTypes.func
};

export default CountryDocCardUpload;
