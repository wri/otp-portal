import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import Spinner from 'components/ui/spinner';

const ConfirmModal = ({
  title,
  text,
  confirmText,
  cancelText,
  onCancel,
  onConfirm
}) => {
  const intl = useIntl();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const _cancelText = cancelText || intl.formatMessage({ id: 'cancel', defaultMessage: 'Cancel' });
  const _confirmText = confirmText || intl.formatMessage({ id: 'confirm', defaultMessage: 'Confirm' });

  const handleConfirm = () => {
    setSubmitting(true);
    onConfirm({
      onSuccess: () => {
        setErrorMessage(null);
      },
      onError: (errorMessage) => {
        setSubmitting(false);
        setErrorMessage(errorMessage);
      }
    });
  };

  return (
    <div className="c-confirm-modal">
      <Spinner
        isLoading={submitting}
        className="-tiny"
      />

      {title && <h2 className="c-title -extrabig">{title}</h2>}
      <p className="c-text">
        {text}
      </p>
      <p className="c-text -error">
        {errorMessage}
      </p>
      <div className="actions">
        <button className="c-button -primary" data-test-id="confirm-modal-cancel" onClick={onCancel}>
          {_cancelText}
        </button>
        <button className="c-button -dangerous" data-test-id="confirm-modal-confirm" onClick={handleConfirm}>
          {_confirmText}
        </button>
      </div>
    </div>
  )
};

export default ConfirmModal;
